"use client";

import { useState, useTransition, useRef } from "react";
import { FeedItem } from "@/components/feed-item";
import { fetchPrayers, fetchPrayedRequestIds } from "@/app/actions";
import { getCategoryStyle } from "@/lib/category-config";
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
  { value: "work", label: "Work", icon: Compass },
  { value: "school", label: "School", icon: Compass },
  { value: "other", label: "Other", icon: Sparkle },
];

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
  const [activeFilter, setActiveFilter] = useState("all");
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const filteredPrayers = activeFilter === "all"
    ? prayers
    : prayers.filter((p) => p.category.includes(activeFilter as PrayerRequest["category"][0]));

  return (
    <div>
      {/* Category filter pills — horizontal scroll */}
      <div
        ref={scrollRef}
        className="sticky top-0 z-10 bg-cream/90 backdrop-blur-sm -mx-4 px-4 py-2 mb-2 flex gap-2 overflow-x-auto scrollbar-hide"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {FILTER_CATEGORIES.map(({ value, label, icon: Icon }) => {
          const isActive = activeFilter === value;
          return (
            <button
              key={value}
              onClick={() => setActiveFilter(value)}
              className={`
                inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-medium
                whitespace-nowrap shrink-0 transition-colors
                ${
                  isActive
                    ? "bg-stone-800 text-white"
                    : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                }
              `}
            >
              <Icon size={14} weight={isActive ? "duotone" : "thin"} />
              {label}
            </button>
          );
        })}
        {/* Spacer so last pill isn't cut off */}
        <div className="shrink-0 w-4" aria-hidden="true" />
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
