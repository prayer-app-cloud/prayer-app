import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSessionId } from "@/lib/session";
import { PrayerQueue } from "@/components/prayer-queue";
import type { PrayerRequest } from "@/lib/types/database";

const PAGE_SIZE = 10;

export default async function Home() {
  const supabase = await createClient();
  const sessionId = await getSessionId();

  // Fetch first page of active prayers
  const { data: prayers } = await supabase
    .from("prayer_requests")
    .select("*")
    .in("status", ["active", "updated"])
    .lt("report_count", 3)
    .order("urgency", { ascending: false })
    .order("created_at", { ascending: false })
    .range(0, PAGE_SIZE);

  const prayerList = (prayers ?? []) as PrayerRequest[];
  const hasMore = prayerList.length > PAGE_SIZE;
  const displayPrayers = prayerList.slice(0, PAGE_SIZE);

  // Check which ones the current user already prayed for
  let prayedIds: string[] = [];
  if (sessionId && displayPrayers.length > 0) {
    const { data: taps } = await supabase
      .from("prayer_taps")
      .select("request_id")
      .eq("session_id", sessionId)
      .in(
        "request_id",
        displayPrayers.map((p) => p.id)
      );
    prayedIds = (taps ?? []).map((t) => t.request_id);
  }

  return (
    <main className="flex flex-col min-h-screen max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Post a prayer. Get prayed for.
        </h1>
        <p className="text-sm text-warm-gray mt-1">
          Pray for someone, or share what you need prayer for.
        </p>
      </header>

      {/* Prayer queue */}
      <PrayerQueue
        initialPrayers={displayPrayers}
        initialPrayedIds={prayedIds}
        initialHasMore={hasMore}
      />

      {/* Post CTA */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none">
        <Link
          href="/post"
          className="pointer-events-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-full shadow-lg transition-colors active:scale-95"
        >
          Need prayer?
        </Link>
      </div>
    </main>
  );
}
