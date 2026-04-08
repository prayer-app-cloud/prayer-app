"use client";

import { useState, useTransition, useRef, useMemo } from "react";
import { FeedItem } from "@/components/feed-item";
import { fetchPrayers, fetchPrayedRequestIds, fetchFollowedRequestIds } from "@/app/actions";
import {
  Heartbeat,
  UsersThree,
  CloudRain,
  Coins,
  Spiral,
  Compass,
  Sparkle,
} from "@phosphor-icons/react";
import type { PrayerRequest } from "@/lib/types/database";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";

const FILTER_CATEGORIES: { value: string; label: string; icon: PhosphorIcon }[] = [
  { value: "all", label: "All", icon: Sparkle },
  { value: "health", label: "Health", icon: Heartbeat },
  { value: "family", label: "Family", icon: UsersThree },
  { value: "grief", label: "Grief", icon: CloudRain },
  { value: "finances", label: "Finances", icon: Coins },
  { value: "inner_struggle", label: "Inner Struggle", icon: Spiral },
  { value: "work", label: "Work & School", icon: Compass },
  { value: "other", label: "Other", icon: Sparkle },
];

// Match work, school, or work_school categories under the "work" filter
function matchesFilter(prayer: PrayerRequest, filter: string): boolean {
  if (filter === "all") return true;
  if (filter === "work") {
    return prayer.category.some((c) => c === "work" || c === "school" || (c as string) === "work_school");
  }
  return prayer.category.includes(filter as PrayerRequest["category"][0]);
}

export function PrayerQueue({
  initialPrayers,
  initialPrayedIds,
  initialFollowedIds,
  initialHasMore,
}: {
  initialPrayers: PrayerRequest[];
  initialPrayedIds: string[];
  initialFollowedIds: string[];
  initialHasMore: boolean;
}) {
  const [prayers, setPrayers] = useState(initialPrayers);
  const [prayedIds, setPrayedIds] = useState<Set<string>>(
    new Set(initialPrayedIds)
  );
  const [followedIds, setFollowedIds] = useState<Set<string>>(
    new Set(initialFollowedIds)
  );
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();
  const [activeFilter, setActiveFilter] = useState("all");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Count prayers per filter category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of FILTER_CATEGORIES) {
      counts[f.value] = f.value === "all"
        ? prayers.length
        : prayers.filter((p) => matchesFilter(p, f.value)).length;
    }
    return counts;
  }, [prayers]);

  // Sort filters: All first, then by count descending
  const sortedFilters = useMemo(() => {
    const allFilter = FILTER_CATEGORIES[0];
    const rest = FILTER_CATEGORIES.slice(1)
      .filter((f) => categoryCounts[f.value] > 0)
      .sort((a, b) => categoryCounts[b.value] - categoryCounts[a.value]);
    return [allFilter, ...rest];
  }, [categoryCounts]);

  function loadMore() {
    startTransition(async () => {
      const result = await fetchPrayers(prayers.length, 10);
      const newPrayers = result.prayers;

      if (newPrayers.length > 0) {
        const ids = newPrayers.map((p) => p.id);
        const [newPrayedSet, newFollowedSet] = await Promise.all([
          fetchPrayedRequestIds(ids),
          fetchFollowedRequestIds(ids),
        ]);

        setPrayers((prev) => [...prev, ...newPrayers]);
        setPrayedIds((prev) => {
          const next = new Set(prev);
          newPrayedSet.forEach((id) => next.add(id));
          return next;
        });
        setFollowedIds((prev) => {
          const next = new Set(prev);
          newFollowedSet.forEach((id) => next.add(id));
          return next;
        });
      }

      setHasMore(result.hasMore);
    });
  }

  const filteredPrayers = prayers.filter((p) => matchesFilter(p, activeFilter));

  return (
    <div>
      {/* Category filter pills with fade hint */}
      <div className="sticky top-0 z-10 -mx-4 mb-2 relative">
        <div
          ref={scrollRef}
          className="bg-cream/90 backdrop-blur-sm px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {sortedFilters.map(({ value, label, icon: Icon }) => {
            const isActive = activeFilter === value;
            const count = categoryCounts[value] ?? 0;
            return (
              <button
                key={value}
                onClick={() => setActiveFilter(value)}
                className={`
                  inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-medium
                  whitespace-nowrap shrink-0 transition-colors min-h-[44px]
                  ${
                    isActive
                      ? "bg-stone-800 text-white"
                      : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                  }
                `}
              >
                <Icon size={14} weight={isActive ? "duotone" : "thin"} />
                {label}
                {value !== "all" && count > 0 && (
                  <span className={`text-[10px] ${isActive ? "text-stone-400" : "text-stone-400"}`}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
          <div className="shrink-0 w-6" aria-hidden="true" />
        </div>
        {/* Fade gradient on right edge */}
        <div className="absolute top-0 right-0 bottom-0 w-6 bg-gradient-to-l from-cream/90 to-transparent pointer-events-none" />
      </div>

      {/* Feed items */}
      {filteredPrayers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-stone-400 text-sm">
            {activeFilter === "all"
              ? "No prayers yet. Be the first to share."
              : "No prayers in this category yet."}
          </p>
        </div>
      ) : (
        <div>
          {filteredPrayers.map((prayer) => (
            <FeedItem
              key={prayer.id}
              prayer={prayer}
              initialPrayed={prayedIds.has(prayer.id)}
              initialFollowed={followedIds.has(prayer.id)}
            />
          ))}
        </div>
      )}

      {hasMore && activeFilter === "all" && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            disabled={isPending}
            className="px-6 py-2.5 rounded-full text-sm font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors disabled:opacity-50"
          >
            {isPending ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
