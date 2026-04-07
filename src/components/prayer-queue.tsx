"use client";

import { useState, useTransition } from "react";
import { PrayerCard } from "@/components/prayer-card";
import { fetchPrayers, fetchPrayedRequestIds } from "@/app/actions";
import type { PrayerRequest } from "@/lib/types/database";

export function PrayerQueue({
  initialPrayers,
  initialPrayedIds,
  initialHasMore,
}: {
  initialPrayers: PrayerRequest[];
  initialPrayedIds: string[];
  initialHasMore: boolean;
}) {
  const [prayers, setPrayers] = useState(initialPrayers);
  const [prayedIds, setPrayedIds] = useState<Set<string>>(
    new Set(initialPrayedIds)
  );
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();

  function loadMore() {
    startTransition(async () => {
      const result = await fetchPrayers(prayers.length, 10);
      const newPrayers = result.prayers;

      if (newPrayers.length > 0) {
        const newPrayedSet = await fetchPrayedRequestIds(
          newPrayers.map((p) => p.id)
        );

        setPrayers((prev) => [...prev, ...newPrayers]);
        setPrayedIds((prev) => {
          const next = new Set(prev);
          newPrayedSet.forEach((id) => next.add(id));
          return next;
        });
      }

      setHasMore(result.hasMore);
    });
  }

  if (prayers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-warm-gray text-sm">
          No prayers yet. Be the first to share.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {prayers.map((prayer) => (
          <PrayerCard
            key={prayer.id}
            prayer={prayer}
            initialPrayed={prayedIds.has(prayer.id)}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            disabled={isPending}
            className="px-6 py-2.5 rounded-full text-sm font-medium bg-cream-dark text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors disabled:opacity-50"
          >
            {isPending ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
