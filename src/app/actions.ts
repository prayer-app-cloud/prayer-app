"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionId } from "@/lib/session";
import { filterContent, containsSelfHarm } from "@/lib/content-filter";
import { logEvent } from "@/lib/events";
import type { CategoryEnum, UrgencyEnum, UpdateTypeEnum, PrayerRequest, Update, Notification, JournalEntry, PrayerReminder } from "@/lib/types/database";

// ── Fetch prayers for the home queue (interleaved: newest + needs-prayer) ──
export async function fetchPrayers(offset = 0, limit = 10): Promise<{
  prayers: PrayerRequest[];
  hasMore: boolean;
}> {
  const supabase = await createClient();

  // Fetch more than needed from both orderings so we can interleave and dedupe
  const fetchSize = offset + limit + 1;
  const [newestResult, needsResult] = await Promise.all([
    supabase
      .from("prayer_requests")
      .select("*")
      .in("status", ["active", "updated", "answered"])
      .lt("report_count", 3)
      .order("created_at", { ascending: false })
      .range(0, fetchSize),
    supabase
      .from("prayer_requests")
      .select("*")
      .in("status", ["active", "updated"])
      .lt("report_count", 3)
      .order("prayer_count", { ascending: true })
      .order("created_at", { ascending: false })
      .range(0, fetchSize),
  ]);

  if (newestResult.error) {
    console.error("fetchPrayers error:", newestResult.error);
    return { prayers: [], hasMore: false };
  }

  const newest = (newestResult.data ?? []) as PrayerRequest[];
  const needs = (needsResult.data ?? []) as PrayerRequest[];

  // Interleave: even positions = newest, odd positions = needs-prayer
  const seen = new Set<string>();
  const interleaved: PrayerRequest[] = [];
  let ni = 0;
  let npi = 0;
  const target = offset + limit + 1; // +1 to detect hasMore
  while (interleaved.length < target) {
    const pos = interleaved.length;
    let added = false;
    if (pos % 2 === 0) {
      while (ni < newest.length && seen.has(newest[ni].id)) ni++;
      if (ni < newest.length) {
        interleaved.push(newest[ni]);
        seen.add(newest[ni].id);
        ni++;
        added = true;
      }
    } else {
      while (npi < needs.length && seen.has(needs[npi].id)) npi++;
      if (npi < needs.length) {
        interleaved.push(needs[npi]);
        seen.add(needs[npi].id);
        npi++;
        added = true;
      }
    }
    if (!added) {
      // Fill from whichever source has remaining
      while (ni < newest.length && seen.has(newest[ni].id)) ni++;
      if (ni < newest.length) {
        interleaved.push(newest[ni]);
        seen.add(newest[ni].id);
        ni++;
      } else {
        while (npi < needs.length && seen.has(needs[npi].id)) npi++;
        if (npi < needs.length) {
          interleaved.push(needs[npi]);
          seen.add(needs[npi].id);
          npi++;
        } else {
          break; // both exhausted
        }
      }
    }
  }

  // Slice to the requested page
  const page = interleaved.slice(offset, offset + limit + 1);
  const hasMore = page.length > limit;
  const prayers = page.slice(0, limit);

  return { prayers, hasMore };
}

// ── Check which requests the current user already prayed for ────
export async function fetchPrayedRequestIds(requestIds: string[]): Promise<Set<string>> {
  if (requestIds.length === 0) return new Set();

  const sessionId = await getSessionId();
  if (!sessionId) return new Set();

  const supabase = await createClient();
  const { data } = await supabase
    .from("prayer_taps")
    .select("request_id")
    .eq("session_id", sessionId)
    .in("request_id", requestIds);

  return new Set((data ?? []).map((t) => t.request_id));
}

// ── Check which requests the current user is following ──────────
export async function fetchFollowedRequestIds(requestIds: string[]): Promise<Set<string>> {
  if (requestIds.length === 0) return new Set();

  const sessionId = await getSessionId();
  if (!sessionId) return new Set();

  const supabase = await createClient();
  const { data } = await supabase
    .from("prayer_follows")
    .select("prayer_request_id")
    .eq("user_session_id", sessionId)
    .in("prayer_request_id", requestIds);

  return new Set((data ?? []).map((f) => f.prayer_request_id));
}

// ── Record an "I prayed" tap ────────────────────────────────────
export async function recordPrayerTap(requestId: string): Promise<{
  success: boolean;
  alreadyPrayed?: boolean;
  error?: string;
}> {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return { success: false, error: "No session found." };
  }

  const supabase = await createClient();

  const { error: tapError } = await supabase
    .from("prayer_taps")
    .insert({
      request_id: requestId,
      session_id: sessionId,
      source: "community",
    });

  if (tapError) {
    if (tapError.code === "23505") {
      return { success: false, alreadyPrayed: true };
    }
    console.error("recordPrayerTap error:", tapError);
    return { success: false, error: "Something went wrong." };
  }

  const { error: rpcError } = await supabase.rpc("increment_prayer_count", {
    p_request_id: requestId,
  });

  if (rpcError) {
    console.error("increment_prayer_count error:", rpcError);
  }

  const { data: request } = await supabase
    .from("prayer_requests")
    .select("session_id, prayer_count")
    .eq("id", requestId)
    .single();

  if (request && request.session_id !== sessionId) {
    // Throttle: only notify if no prayer_received notification was sent for this request in the last 60 minutes
    const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentNotif } = await supabase
      .from("notifications")
      .select("id, created_at")
      .eq("user_session_id", request.session_id)
      .eq("type", "prayer_received")
      .eq("request_id", requestId)
      .order("created_at", { ascending: false })
      .limit(1);

    const lastNotif = recentNotif?.[0];
    if (!lastNotif || lastNotif.created_at < sixtyMinutesAgo) {
      await supabase.from("notifications").insert({
        user_session_id: request.session_id,
        type: "prayer_received",
        request_id: requestId,
      });
    }

    // Milestone notifications at 5, 10, 25
    const newCount = (request.prayer_count ?? 0) + 1;
    const milestones = [5, 10, 25];
    if (milestones.includes(newCount)) {
      // Check if milestone already sent
      const { data: existingMilestone } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_session_id", request.session_id)
        .eq("type", "milestone")
        .eq("request_id", requestId);

      const milestoneCount = existingMilestone?.length ?? 0;
      const milestoneIndex = milestones.indexOf(newCount);
      if (milestoneCount <= milestoneIndex) {
        await supabase.from("notifications").insert({
          user_session_id: request.session_id,
          type: "milestone",
          request_id: requestId,
        });
      }
    }
  }

  return { success: true };
}

// ── Follow / unfollow a prayer ──────────────────────────────────
export async function followPrayer(requestId: string): Promise<{ success: boolean }> {
  const sessionId = await getSessionId();
  if (!sessionId) return { success: false };

  const supabase = await createClient();
  const { error } = await supabase
    .from("prayer_follows")
    .insert({ user_session_id: sessionId, prayer_request_id: requestId });

  if (error && error.code !== "23505") {
    console.error("followPrayer error:", error);
    return { success: false };
  }
  logEvent(sessionId, "prayer_followed", { request_id: requestId });
  return { success: true };
}

export async function unfollowPrayer(requestId: string): Promise<{ success: boolean }> {
  const sessionId = await getSessionId();
  if (!sessionId) return { success: false };

  const supabase = await createClient();
  const { error } = await supabase
    .from("prayer_follows")
    .delete()
    .eq("user_session_id", sessionId)
    .eq("prayer_request_id", requestId);

  if (error) {
    console.error("unfollowPrayer error:", error);
    return { success: false };
  }
  logEvent(sessionId, "prayer_unfollowed", { request_id: requestId });
  return { success: true };
}

// ── Fetch a single prayer for onboarding ──────────────────────────
export async function fetchOnboardingPrayer(): Promise<PrayerRequest | null> {
  const supabase = await createClient();

  // Prefer seed prayers with guided prayer, mid-range count (8-18), relatable categories
  const { data: relatable } = await supabase
    .from("prayer_requests")
    .select("*")
    .eq("is_seed", true)
    .eq("status", "active")
    .gte("prayer_count", 8)
    .lte("prayer_count", 18)
    .not("guided_prayer", "is", null)
    .overlaps("category", ["inner_struggle", "family"])
    .limit(10);

  const relatableCandidates = (relatable ?? []) as PrayerRequest[];
  if (relatableCandidates.length > 0) {
    return relatableCandidates[Math.floor(Math.random() * relatableCandidates.length)];
  }

  // Fallback: any seed with guided prayer and mid-range count
  const { data: seeds } = await supabase
    .from("prayer_requests")
    .select("*")
    .eq("is_seed", true)
    .eq("status", "active")
    .gte("prayer_count", 5)
    .lte("prayer_count", 20)
    .not("guided_prayer", "is", null)
    .limit(10);

  const candidates = (seeds ?? []) as PrayerRequest[];
  if (candidates.length > 0) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // Last fallback: any active prayer with guided prayer
  const { data: fallback } = await supabase
    .from("prayer_requests")
    .select("*")
    .eq("status", "active")
    .lt("report_count", 3)
    .not("guided_prayer", "is", null)
    .order("prayer_count", { ascending: false })
    .limit(1);

  return ((fallback ?? []) as PrayerRequest[])[0] ?? null;
}

// ── Fetch featured prayer (weighted by prayer_count × freshness) ──
export async function fetchFeaturedPrayer(): Promise<PrayerRequest | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("prayer_requests")
    .select("*")
    .eq("status", "active")
    .lt("report_count", 3)
    .order("prayer_count", { ascending: false })
    .limit(15);

  const candidates = (data ?? []) as PrayerRequest[];
  if (candidates.length === 0) return null;

  // Score: prayer_count * (1 / hours_since_created), pick random from top 5
  const now = Date.now();
  const scored = candidates.map((p) => {
    const hoursOld = Math.max(1, (now - new Date(p.created_at).getTime()) / 3600000);
    return { prayer: p, score: p.prayer_count / hoursOld };
  });
  scored.sort((a, b) => b.score - a.score);

  const top5 = scored.slice(0, Math.min(5, scored.length));
  return top5[Math.floor(Math.random() * top5.length)].prayer;
}

// ── Fetch user's active prayer requests ───────────────────────────
export async function fetchMyActivePrayers(): Promise<PrayerRequest[]> {
  const sessionId = await getSessionId();
  if (!sessionId) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("prayer_requests")
    .select("*")
    .eq("session_id", sessionId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(5);

  return (data ?? []) as PrayerRequest[];
}

// ── Simple post for onboarding (skip title requirement, auto-generate) ──
export async function quickPostPrayer(formData: {
  text: string;
  categories: CategoryEnum[];
}): Promise<{
  success: boolean;
  shareSlug?: string;
  requestId?: string;
  error?: string;
}> {
  const sessionId = await getSessionId();
  if (!sessionId) return { success: false, error: "No session found." };

  const text = formData.text.trim();
  if (text.length < 10 || text.length > 500) {
    return { success: false, error: "Prayer must be between 10 and 500 characters." };
  }

  if (formData.categories.length < 1 || formData.categories.length > 3) {
    return { success: false, error: "Choose between 1 and 3 categories." };
  }

  const filterResult = filterContent(text);
  if (!filterResult.ok) {
    return { success: false, error: filterResult.reason };
  }

  // Auto-generate title from text
  const title = text.length > 60 ? text.slice(0, 57) + "..." : text;

  const supabase = await createClient();

  // Try AI generation
  let prayerPoints: string[] | null = null;
  let guidedPrayer: string | null = null;
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/generate-prayer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, text, category: formData.categories[0] }),
    });
    const aiData = await res.json();
    if (aiData?.prayer_points && aiData?.guided_prayer) {
      prayerPoints = aiData.prayer_points;
      guidedPrayer = aiData.guided_prayer;
    }
  } catch {
    // AI failed — publish without it
  }

  const { data, error } = await supabase
    .from("prayer_requests")
    .insert({
      title,
      text,
      category: formData.categories,
      session_id: sessionId,
      anonymous: true,
      urgency: "normal" as UrgencyEnum,
      prayer_points: prayerPoints ? JSON.stringify(prayerPoints) : null,
      guided_prayer: guidedPrayer,
    })
    .select("id, share_slug")
    .single();

  if (error) {
    console.error("quickPostPrayer error:", error);
    return { success: false, error: "Something went wrong." };
  }

  return { success: true, shareSlug: data.share_slug, requestId: data.id };
}

// ── Step 1: Validate prayer text (no DB insert) ─────────────────
export async function validatePrayerRequest(formData: {
  text: string;
  title: string;
  categories: CategoryEnum[];
}): Promise<{
  valid: boolean;
  selfHarm?: boolean;
  error?: string;
}> {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return { valid: false, error: "No session found." };
  }

  const text = formData.text.trim();
  const title = formData.title.trim();
  const categories = formData.categories;

  if (categories.length < 1 || categories.length > 3) {
    return { valid: false, error: "Choose between 1 and 3 categories." };
  }

  if (title.length < 5 || title.length > 100) {
    return { valid: false, error: "Add a brief title so others know how to pray." };
  }

  if (text.length < 10 || text.length > 500) {
    return { valid: false, error: "Prayer must be between 10 and 500 characters." };
  }

  if (containsSelfHarm(text) || containsSelfHarm(title)) {
    return { valid: false, selfHarm: true };
  }

  const filterResult = filterContent(text);
  if (!filterResult.ok) {
    return { valid: false, error: filterResult.reason };
  }

  const titleFilter = filterContent(title);
  if (!titleFilter.ok) {
    return { valid: false, error: titleFilter.reason };
  }

  return { valid: true };
}

// ── Step 2: Publish prayer with optional AI-generated content ───
export async function publishPrayerRequest(formData: {
  title: string;
  text: string;
  categories: CategoryEnum[];
  anonymous: boolean;
  urgency: UrgencyEnum;
  prayerPoints: string[] | null;
  guidedPrayer: string | null;
  displayNameSnapshot: string | null;
}): Promise<{
  success: boolean;
  shareSlug?: string;
  error?: string;
}> {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return { success: false, error: "No session found." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("prayer_requests")
    .insert({
      title: formData.title.trim(),
      text: formData.text.trim(),
      category: formData.categories,
      session_id: sessionId,
      anonymous: formData.anonymous,
      urgency: formData.urgency,
      prayer_points: formData.prayerPoints
        ? JSON.stringify(formData.prayerPoints)
        : null,
      guided_prayer: formData.guidedPrayer ?? null,
      display_name_snapshot: formData.anonymous ? null : formData.displayNameSnapshot,
    })
    .select("share_slug")
    .single();

  if (error) {
    console.error("publishPrayerRequest error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  return { success: true, shareSlug: data.share_slug };
}

// ── Submit an update or mark prayer as answered ────────────────
export async function submitPrayerUpdate(formData: {
  requestId: string;
  type: UpdateTypeEnum;
  text: string;
}): Promise<{
  success: boolean;
  shareSlug?: string;
  error?: string;
}> {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return { success: false, error: "No session found." };
  }

  const text = formData.text.trim();
  if (text.length < 1 || text.length > 280) {
    return { success: false, error: "Update must be between 1 and 280 characters." };
  }

  const supabase = await createClient();

  // Verify ownership
  const { data: prayer } = await supabase
    .from("prayer_requests")
    .select("id, session_id, share_slug")
    .eq("id", formData.requestId)
    .single();

  if (!prayer || prayer.session_id !== sessionId) {
    return { success: false, error: "You can only update your own prayer." };
  }

  // Insert into updates table
  const { error: insertError } = await supabase
    .from("updates")
    .insert({
      request_id: formData.requestId,
      type: formData.type,
      text,
    });

  if (insertError) {
    console.error("submitPrayerUpdate insert error:", insertError);
    return { success: false, error: "Something went wrong." };
  }

  // Update the prayer_requests row
  const newStatus = formData.type === "answered" ? "answered" : "updated";
  const { error: updateError } = await supabase
    .from("prayer_requests")
    .update({
      status: newStatus,
      update_text: text,
    })
    .eq("id", formData.requestId);

  if (updateError) {
    console.error("submitPrayerUpdate status error:", updateError);
  }

  // Notify followers and pray-ers
  const notifType = formData.type === "answered" ? "request_answered" : "request_updated";

  // Get all followers
  const { data: followers } = await supabase
    .from("prayer_follows")
    .select("user_session_id")
    .eq("prayer_request_id", formData.requestId)
    .neq("user_session_id", sessionId);

  // Get all pray-ers
  const { data: taps } = await supabase
    .from("prayer_taps")
    .select("session_id")
    .eq("request_id", formData.requestId)
    .neq("session_id", sessionId);

  // Combine unique session IDs
  const notifySet = new Set<string>();
  for (const f of followers ?? []) notifySet.add(f.user_session_id);
  for (const t of taps ?? []) notifySet.add(t.session_id);

  if (notifySet.size > 0) {
    const notifications = [...notifySet].map((sid) => ({
      user_session_id: sid,
      type: notifType as "request_answered" | "request_updated",
      request_id: formData.requestId,
    }));

    const { error: notifError } = await supabase
      .from("notifications")
      .insert(notifications);

    if (notifError) {
      console.error("submitPrayerUpdate notification error:", notifError);
    }
  }

  return { success: true, shareSlug: prayer.share_slug };
}

// ── Fetch all prayers a user follows ─────────────────────────────
export async function fetchFollowedPrayers(): Promise<PrayerRequest[]> {
  const sessionId = await getSessionId();
  if (!sessionId) return [];

  const supabase = await createClient();
  const { data: follows } = await supabase
    .from("prayer_follows")
    .select("prayer_request_id")
    .eq("user_session_id", sessionId);

  if (!follows || follows.length === 0) return [];

  const ids = follows.map((f) => f.prayer_request_id);
  const { data } = await supabase
    .from("prayer_requests")
    .select("*")
    .in("id", ids)
    .order("updated_at", { ascending: false });

  return (data ?? []) as PrayerRequest[];
}

// ── Fetch updates for a prayer ───────────────────────────────────
export async function fetchUpdatesForPrayer(requestId: string): Promise<Update[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("updates")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });

  return (data ?? []) as Update[];
}

// ── Notification actions ─────────────────────────────────────────
export async function fetchNotifications(limit = 30): Promise<(Notification & { prayer_request?: PrayerRequest | null })[]> {
  const sessionId = await getSessionId();
  if (!sessionId) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*, prayer_requests:request_id(*)")
    .eq("user_session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((n: Record<string, unknown>) => ({
    id: n.id as string,
    user_session_id: n.user_session_id as string,
    type: n.type as Notification["type"],
    request_id: n.request_id as string,
    read: n.read as boolean,
    created_at: n.created_at as string,
    prayer_request: n.prayer_requests as PrayerRequest | null,
  }));
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const sessionId = await getSessionId();
  if (!sessionId) return;

  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_session_id", sessionId);
}

export async function markAllNotificationsRead(): Promise<void> {
  const sessionId = await getSessionId();
  if (!sessionId) return;

  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_session_id", sessionId)
    .eq("read", false);
}

export async function getUnreadNotificationCount(): Promise<number> {
  const sessionId = await getSessionId();
  if (!sessionId) return 0;

  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_session_id", sessionId)
    .eq("read", false);

  return count ?? 0;
}

// ── Fetch a single un-prayed prayer for the Today "pray for someone" module ──
export async function fetchDailyPrayer(excludeIds: string[] = []): Promise<PrayerRequest | null> {
  const sessionId = await getSessionId();
  const supabase = await createClient();

  // Get IDs this user already prayed for
  let prayedIds: string[] = [];
  if (sessionId) {
    const { data: taps } = await supabase
      .from("prayer_taps")
      .select("request_id")
      .eq("session_id", sessionId);
    prayedIds = (taps ?? []).map((t) => t.request_id);
  }

  const allExclude = [...new Set([...prayedIds, ...excludeIds])];

  let query = supabase
    .from("prayer_requests")
    .select("*")
    .in("status", ["active", "updated"])
    .lt("report_count", 3)
    .not("guided_prayer", "is", null)
    .order("created_at", { ascending: false })
    .limit(10);

  if (allExclude.length > 0) {
    // Supabase doesn't have a "not in" for arrays easily, so filter client-side
  }

  const { data } = await query;
  const candidates = ((data ?? []) as PrayerRequest[]).filter(
    (p) => !allExclude.includes(p.id)
  );

  if (candidates.length === 0) return null;
  // Pick randomly from the first 5 freshest
  const pool = candidates.slice(0, Math.min(5, candidates.length));
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Fetch followed prayers with updates for Today tab ──────────────
export async function fetchFollowedWithUpdates(): Promise<PrayerRequest[]> {
  const sessionId = await getSessionId();
  if (!sessionId) return [];

  const supabase = await createClient();
  const { data: follows } = await supabase
    .from("prayer_follows")
    .select("prayer_request_id")
    .eq("user_session_id", sessionId);

  if (!follows || follows.length === 0) return [];

  const ids = follows.map((f) => f.prayer_request_id);
  const { data } = await supabase
    .from("prayer_requests")
    .select("*")
    .in("id", ids)
    .in("status", ["updated", "answered"])
    .order("updated_at", { ascending: false })
    .limit(2);

  return (data ?? []) as PrayerRequest[];
}

// ── Fetch a recently answered prayer for community social proof ────
export async function fetchRecentAnswered(): Promise<PrayerRequest | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("prayer_requests")
    .select("*")
    .eq("status", "answered")
    .lt("report_count", 3)
    .order("updated_at", { ascending: false })
    .limit(5);

  const candidates = (data ?? []) as PrayerRequest[];
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ── Fetch ALL user prayers (any status) for Me tab ─────────────────
export async function fetchMyPrayers(): Promise<PrayerRequest[]> {
  const sessionId = await getSessionId();
  if (!sessionId) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("prayer_requests")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(20);

  return (data ?? []) as PrayerRequest[];
}

// ── Fetch answered prayers the user prayed for (emotional payoff) ──
export async function fetchAnsweredPrayersIPrayedFor(): Promise<PrayerRequest[]> {
  const sessionId = await getSessionId();
  if (!sessionId) return [];

  const supabase = await createClient();
  const { data: taps } = await supabase
    .from("prayer_taps")
    .select("request_id")
    .eq("session_id", sessionId);

  if (!taps || taps.length === 0) return [];

  const ids = taps.map((t) => t.request_id);
  const { data } = await supabase
    .from("prayer_requests")
    .select("*")
    .in("id", ids)
    .eq("status", "answered")
    .order("updated_at", { ascending: false })
    .limit(10);

  return (data ?? []) as PrayerRequest[];
}

// ── Fetch followed prayers count ───────────────────────────────────
export async function fetchFollowedCount(): Promise<number> {
  const sessionId = await getSessionId();
  if (!sessionId) return 0;

  const supabase = await createClient();
  const { count } = await supabase
    .from("prayer_follows")
    .select("id", { count: "exact", head: true })
    .eq("user_session_id", sessionId);

  return count ?? 0;
}

// ── Journal actions ──────────────────────────────────────────────
export async function createJournalEntry(text: string, requestId?: string): Promise<{ success: boolean; id?: string }> {
  const sessionId = await getSessionId();
  if (!sessionId) return { success: false };

  const trimmed = text.trim();
  if (trimmed.length < 1 || trimmed.length > 500) return { success: false };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prayer_journal_entries")
    .insert({
      session_id: sessionId,
      request_id: requestId ?? null,
      text: trimmed,
    })
    .select("id")
    .single();

  if (error) {
    console.error("createJournalEntry error:", error);
    return { success: false };
  }

  logEvent(sessionId, "journal_entry_created", { request_id: requestId ?? null });
  return { success: true, id: data.id };
}

export async function fetchJournalEntries(): Promise<JournalEntry[]> {
  const sessionId = await getSessionId();
  if (!sessionId) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("prayer_journal_entries")
    .select("*, prayer_requests:request_id(id, title, text, share_slug)")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []).map((e: Record<string, unknown>) => ({
    id: e.id as string,
    session_id: e.session_id as string,
    request_id: e.request_id as string | null,
    text: e.text as string,
    created_at: e.created_at as string,
    prayer_request: e.prayer_requests as JournalEntry["prayer_request"],
  }));
}

// ── Reminder actions ─────────────────────────────────────────────
export async function getReminder(): Promise<PrayerReminder | null> {
  const sessionId = await getSessionId();
  if (!sessionId) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("prayer_reminders")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  return (data as PrayerReminder) ?? null;
}

export async function setReminder(time: string, enabled: boolean): Promise<{ success: boolean }> {
  const sessionId = await getSessionId();
  if (!sessionId) return { success: false };

  const supabase = await createClient();
  const { error } = await supabase
    .from("prayer_reminders")
    .upsert({
      session_id: sessionId,
      reminder_time: time,
      enabled,
    }, { onConflict: "session_id" });

  if (error) {
    console.error("setReminder error:", error);
    return { success: false };
  }

  logEvent(sessionId, "reminder_preference_set", { time, enabled });
  return { success: true };
}
