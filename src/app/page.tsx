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
    <main className="flex flex-col min-h-screen max-w-lg mx-auto px-4 pt-6 pb-20">
      {/* Header with subtle radial warmth */}
      <header className="mb-8 text-center relative">
        <div className="absolute inset-0 -top-6 bg-[radial-gradient(ellipse_at_center,_rgba(251,191,36,0.06)_0%,_transparent_70%)] pointer-events-none" />
        <h1 className="font-serif text-2xl font-semibold text-gray-800 mb-1 relative">
          Prayer Room
        </h1>
        <p className="text-sm text-warm-gray relative">
          You are heard here
        </p>
      </header>

      {/* Prayer queue */}
      <PrayerQueue
        initialPrayers={displayPrayers}
        initialPrayedIds={prayedIds}
        initialHasMore={hasMore}
      />

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-cream/90 backdrop-blur-sm border-t border-stone-200/60 py-3 px-4">
        <div className="max-w-lg mx-auto flex justify-center">
          <Link
            href="/post"
            className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-amber-900 text-sm font-medium rounded-full shadow-sm transition-colors active:scale-95"
          >
            Share a prayer request
          </Link>
        </div>
      </div>
    </main>
  );
}
