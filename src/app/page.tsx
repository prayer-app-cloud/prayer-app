import { createClient } from "@/lib/supabase/server";
import { getSessionId } from "@/lib/session";
import { TabShell } from "@/components/tab-shell";
import type { PrayerRequest } from "@/lib/types/database";

const PAGE_SIZE = 10;

export default async function Home() {
  const supabase = await createClient();
  const sessionId = await getSessionId();

  // Fetch prayers for the feed — interleave newest and needs-prayer
  const [newestResult, needsPrayerResult] = await Promise.all([
    supabase
      .from("prayer_requests")
      .select("*")
      .in("status", ["active", "updated", "answered"])
      .lt("report_count", 3)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE),
    supabase
      .from("prayer_requests")
      .select("*")
      .in("status", ["active", "updated"])
      .lt("report_count", 3)
      .order("prayer_count", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE),
  ]);

  const newest = (newestResult.data ?? []) as PrayerRequest[];
  const needsPrayer = (needsPrayerResult.data ?? []) as PrayerRequest[];

  // Interleave: positions 0,2,4,6,8 = newest; positions 1,3,5,7,9 = needs-prayer
  const seen = new Set<string>();
  const interleaved: PrayerRequest[] = [];
  let ni = 0;
  let npi = 0;
  for (let pos = 0; pos < PAGE_SIZE; pos++) {
    if (pos % 2 === 0) {
      // newest slot
      while (ni < newest.length && seen.has(newest[ni].id)) ni++;
      if (ni < newest.length) {
        interleaved.push(newest[ni]);
        seen.add(newest[ni].id);
        ni++;
      }
    } else {
      // needs-prayer slot
      while (npi < needsPrayer.length && seen.has(needsPrayer[npi].id)) npi++;
      if (npi < needsPrayer.length) {
        interleaved.push(needsPrayer[npi]);
        seen.add(needsPrayer[npi].id);
        npi++;
      }
    }
  }
  // Fill remaining slots
  while (interleaved.length < PAGE_SIZE && ni < newest.length) {
    if (!seen.has(newest[ni].id)) {
      interleaved.push(newest[ni]);
      seen.add(newest[ni].id);
    }
    ni++;
  }
  while (interleaved.length < PAGE_SIZE && npi < needsPrayer.length) {
    if (!seen.has(needsPrayer[npi].id)) {
      interleaved.push(needsPrayer[npi]);
      seen.add(needsPrayer[npi].id);
    }
    npi++;
  }

  const prayerList = interleaved;

  // Featured prayer: weighted by prayer_count × freshness, random from top 5
  const { data: featuredPool } = await supabase
    .from("prayer_requests")
    .select("*")
    .eq("status", "active")
    .lt("report_count", 3)
    .order("prayer_count", { ascending: false })
    .limit(15);

  let featuredPrayer: PrayerRequest | null = null;
  const featuredCandidates = (featuredPool ?? []) as PrayerRequest[];
  if (featuredCandidates.length > 0) {
    const now = Date.now();
    const scored = featuredCandidates.map((p) => {
      const hoursOld = Math.max(1, (now - new Date(p.created_at).getTime()) / 3600000);
      return { prayer: p, score: p.prayer_count / hoursOld };
    });
    scored.sort((a, b) => b.score - a.score);
    const top5 = scored.slice(0, Math.min(5, scored.length));
    featuredPrayer = top5[Math.floor(Math.random() * top5.length)].prayer;
  }

  // User's active prayers
  let myActivePrayers: PrayerRequest[] = [];
  if (sessionId) {
    const { data: myData } = await supabase
      .from("prayer_requests")
      .select("*")
      .eq("session_id", sessionId)
      .in("status", ["active", "updated"])
      .order("created_at", { ascending: false })
      .limit(5);
    myActivePrayers = (myData ?? []) as PrayerRequest[];
  }

  // Today tab: daily prayer (un-prayed, not featured)
  let dailyPrayer: PrayerRequest | null = null;
  {
    const excludeIds = featuredPrayer ? [featuredPrayer.id] : [];
    let prayedIds: string[] = [];
    if (sessionId) {
      const { data: taps } = await supabase
        .from("prayer_taps")
        .select("request_id")
        .eq("session_id", sessionId);
      prayedIds = (taps ?? []).map((t) => t.request_id);
    }
    const allExclude = [...new Set([...prayedIds, ...excludeIds])];

    const { data: dailyCandidates } = await supabase
      .from("prayer_requests")
      .select("*")
      .in("status", ["active", "updated"])
      .lt("report_count", 3)
      .not("guided_prayer", "is", null)
      .order("created_at", { ascending: false })
      .limit(15);

    const filtered = ((dailyCandidates ?? []) as PrayerRequest[]).filter(
      (p) => !allExclude.includes(p.id)
    );
    if (filtered.length > 0) {
      const pool = filtered.slice(0, Math.min(5, filtered.length));
      dailyPrayer = pool[Math.floor(Math.random() * pool.length)];
    }
  }

  // Today tab: followed prayers with updates
  let followedWithUpdates: PrayerRequest[] = [];
  if (sessionId) {
    const { data: follows } = await supabase
      .from("prayer_follows")
      .select("prayer_request_id")
      .eq("user_session_id", sessionId);

    if (follows && follows.length > 0) {
      const fIds = follows.map((f) => f.prayer_request_id);
      const { data: fPrayers } = await supabase
        .from("prayer_requests")
        .select("*")
        .in("id", fIds)
        .order("updated_at", { ascending: false })
        .limit(2);
      followedWithUpdates = (fPrayers ?? []) as PrayerRequest[];
    }
  }

  // Today tab: recently answered prayer for social proof
  let recentAnswered: PrayerRequest | null = null;
  {
    const { data: answeredData } = await supabase
      .from("prayer_requests")
      .select("*")
      .eq("status", "answered")
      .lt("report_count", 3)
      .order("updated_at", { ascending: false })
      .limit(5);

    const answeredCandidates = (answeredData ?? []) as PrayerRequest[];
    if (answeredCandidates.length > 0) {
      recentAnswered = answeredCandidates[Math.floor(Math.random() * answeredCandidates.length)];
    }
  }

  // Check which prayers user already prayed for / follows
  const allIds = [
    ...prayerList.map((p) => p.id),
    ...(featuredPrayer ? [featuredPrayer.id] : []),
    ...(dailyPrayer ? [dailyPrayer.id] : []),
  ];
  const uniqueIds = [...new Set(allIds)];

  let prayedIds: string[] = [];
  let followedIds: string[] = [];
  let unreadCount = 0;
  if (sessionId && uniqueIds.length > 0) {
    const [tapsResult, followsResult, unreadResult] = await Promise.all([
      supabase
        .from("prayer_taps")
        .select("request_id")
        .eq("session_id", sessionId)
        .in("request_id", uniqueIds),
      supabase
        .from("prayer_follows")
        .select("prayer_request_id")
        .eq("user_session_id", sessionId)
        .in("prayer_request_id", uniqueIds),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_session_id", sessionId)
        .eq("read", false),
    ]);
    prayedIds = (tapsResult.data ?? []).map((t) => t.request_id);
    followedIds = (followsResult.data ?? []).map((f) => f.prayer_request_id);
    unreadCount = unreadResult.count ?? 0;
  } else if (sessionId) {
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_session_id", sessionId)
      .eq("read", false);
    unreadCount = count ?? 0;
  }

  return (
    <TabShell
      initialPrayers={prayerList}
      initialPrayedIds={prayedIds}
      initialFollowedIds={followedIds}
      initialUnreadCount={unreadCount}
      featuredPrayer={featuredPrayer}
      myActivePrayers={myActivePrayers}
      dailyPrayer={dailyPrayer}
      followedWithUpdates={followedWithUpdates}
      recentAnswered={recentAnswered}
    />
  );
}
