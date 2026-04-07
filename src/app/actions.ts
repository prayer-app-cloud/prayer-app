"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionId } from "@/lib/session";
import { filterContent, containsSelfHarm } from "@/lib/content-filter";
import type { CategoryEnum, UrgencyEnum, PrayerRequest } from "@/lib/types/database";

// ── Fetch prayers for the home queue ────────────────────────────
export async function fetchPrayers(offset = 0, limit = 10): Promise<{
  prayers: PrayerRequest[];
  hasMore: boolean;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("prayer_requests")
    .select("*")
    .in("status", ["active", "updated"])
    .lt("report_count", 3)
    .order("urgency", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit);

  if (error) {
    console.error("fetchPrayers error:", error);
    return { prayers: [], hasMore: false };
  }

  return {
    prayers: (data ?? []) as PrayerRequest[],
    hasMore: (data?.length ?? 0) > limit,
  };
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

  // Insert the tap (unique constraint prevents duplicates)
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

  // Increment prayer count atomically
  const { error: rpcError } = await supabase.rpc("increment_prayer_count", {
    p_request_id: requestId,
  });

  if (rpcError) {
    console.error("increment_prayer_count error:", rpcError);
  }

  // Create notification for the prayer poster
  const { data: request } = await supabase
    .from("prayer_requests")
    .select("session_id")
    .eq("id", requestId)
    .single();

  if (request && request.session_id !== sessionId) {
    await supabase.from("notifications").insert({
      user_session_id: request.session_id,
      type: "prayer_received",
      request_id: requestId,
    });
  }

  return { success: true };
}

// ── Step 1: Validate prayer text (no DB insert) ─────────────────
export async function validatePrayerRequest(formData: {
  text: string;
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
  const categories = formData.categories;

  if (categories.length < 1 || categories.length > 3) {
    return { valid: false, error: "Choose between 1 and 3 categories." };
  }

  if (text.length < 10 || text.length > 500) {
    return { valid: false, error: "Prayer must be between 10 and 500 characters." };
  }

  if (containsSelfHarm(text)) {
    return { valid: false, selfHarm: true };
  }

  const filterResult = filterContent(text);
  if (!filterResult.ok) {
    return { valid: false, error: filterResult.reason };
  }

  return { valid: true };
}

// ── Step 2: Publish prayer with optional AI-generated content ───
export async function publishPrayerRequest(formData: {
  text: string;
  categories: CategoryEnum[];
  anonymous: boolean;
  urgency: UrgencyEnum;
  prayerPoints: string[] | null;
  guidedPrayer: string | null;
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
      text: formData.text.trim(),
      category: formData.categories,
      session_id: sessionId,
      anonymous: formData.anonymous,
      urgency: formData.urgency,
      prayer_points: formData.prayerPoints
        ? JSON.stringify(formData.prayerPoints)
        : null,
      guided_prayer: formData.guidedPrayer ?? null,
    })
    .select("share_slug")
    .single();

  if (error) {
    console.error("publishPrayerRequest error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }

  return { success: true, shareSlug: data.share_slug };
}
