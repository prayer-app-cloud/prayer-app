"use client";

import { useState, useTransition, useMemo, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FeedItem } from "@/components/feed-item";
import { GuidedPrayerSheet } from "@/components/guided-prayer-sheet";
import { fetchPrayers, fetchPrayedRequestIds, fetchFollowedRequestIds, recordPrayerTap } from "@/app/actions";

import { getCategoryStyle, CATEGORY_STYLES } from "@/lib/category-config";
import { getRandomVerse } from "@/lib/verses";
import { HandsPraying } from "@phosphor-icons/react";
import { VerseCard } from "@/components/verse-card";
import type { PrayerRequest } from "@/lib/types/database";

const TILE_CATEGORIES = [
  "health", "family", "grief", "finances",
  "inner_struggle", "work", "school", "other",
] as const;

function matchesFilter(prayer: PrayerRequest, filter: string): boolean {
  if (filter === "all") return true;
  if (filter === "work") {
    return prayer.category.some((c) => c === "work" || (c as string) === "work_school");
  }
  if (filter === "school") {
    return prayer.category.some((c) => c === "school" || (c as string) === "work_school");
  }
  return prayer.category.includes(filter as PrayerRequest["category"][0]);
}

function timeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 24) {
    const days = Math.min(Math.floor(hours / 24), 7);
    return `${days}d left`;
  }
  if (hours >= 1) return `${hours}h left`;
  const minutes = Math.floor(diff / (1000 * 60));
  return `${minutes}m left`;
}

function parsePrayerPoints(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const BODY_LIMIT = 150;

function FeaturedCard({
  prayer,
  initialPrayed,
}: {
  prayer: PrayerRequest;
  initialPrayed: boolean;
}) {
  const router = useRouter();
  const [prayed, setPrayed] = useState(initialPrayed);
  const [count, setCount] = useState(prayer.prayer_count);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [thankYouVisible, setThankYouVisible] = useState(false);

  const primaryCategory = prayer.category[0] ?? "other";
  const primaryStyle = getCategoryStyle(primaryCategory);
  const displayName = prayer.display_name_snapshot || (prayer.anonymous ? "Anonymous" : null);
  const hasGuidedPrayer = !!prayer.guided_prayer;
  const prayerPoints = parsePrayerPoints(prayer.prayer_points);
  const verse = useMemo(() => getRandomVerse(primaryCategory), [primaryCategory]);

  const bodyPreview = prayer.text.length > BODY_LIMIT
    ? prayer.text.slice(0, BODY_LIMIT) + "..."
    : prayer.text;
  const titleDuplicatesBody = !!prayer.title && prayer.text.startsWith(prayer.title);
  const showBody = !!prayer.title && !titleDuplicatesBody;

  function handlePrayClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (prayed || loading) return;
    if (hasGuidedPrayer) {
      setShowSheet(true);
    } else {
      confirmPrayer();
    }
  }

  async function confirmPrayer() {
    setShowSheet(false);
    if (prayed || loading) return;
    setLoading(true);

    setPrayed(true);
    setCount((c) => c + 1);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 700);

    setThankYouVisible(true);
    setTimeout(() => setThankYouVisible(false), 7000);

    const result = await recordPrayerTap(prayer.id);
    if (!result.success && !result.alreadyPrayed) {
      setPrayed(false);
      setCount((c) => c - 1);
    }
    setLoading(false);
  }

  return (
    <>
      <div className="bg-white/85 backdrop-blur-sm rounded-2xl shadow-[0_1px_3px_rgba(120,100,70,0.08)] overflow-hidden mb-6">
        {/* Tappable content */}
        <div
          onClick={() => router.push(`/r/${prayer.share_slug}`)}
          className="p-5 pb-3 cursor-pointer hover:bg-stone-50/30 active:bg-stone-50/50 transition-colors"
        >
          {/* Meta: dot + category · name · time */}
          <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-3">
            <span className={`w-2 h-2 rounded-full shrink-0 ${primaryStyle.dotColor}`} />
            <span className={primaryStyle.chipText}>{primaryStyle.label}</span>
            {displayName && (
              <>
                <span>·</span>
                <span className="text-stone-500 font-medium">{displayName}</span>
              </>
            )}
            <span>·</span>
            <span>{timeLeft(prayer.expires_at)}</span>
          </div>

          {/* Title */}
          <p className="font-serif text-lg font-semibold text-gray-900 leading-relaxed mb-2">
            {prayer.title || bodyPreview}
          </p>

          {/* Body preview */}
          {showBody && (
            <p className="text-sm text-stone-600 leading-relaxed line-clamp-2 mb-2">
              {bodyPreview}
            </p>
          )}

          {/* First prayer point */}
          {prayerPoints[0] && !showBody && (
            <p className="text-sm text-stone-500 italic leading-relaxed truncate">
              Pray for: {prayerPoints[0]}
            </p>
          )}
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between px-5 pb-4 pt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrayClick}
              disabled={prayed}
              className={`
                flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium
                transition-all duration-200
                ${
                  prayed
                    ? "bg-stone-50 text-stone-400 cursor-default"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 active:scale-[0.96] border border-amber-200 shadow-sm"
                }
              `}
            >
              <HandsPraying size={16} weight={prayed ? "duotone" : "thin"} />
              {prayed ? "Prayed \u2713" : "Pray"}
            </button>

            <span
              className={`
                text-sm tabular-nums transition-all duration-300
                ${animating ? "text-amber-500 scale-110 animate-count-pulse" : "text-stone-400"}
              `}
            >
              {count} {count === 1 ? "prayer" : "prayers"}
            </span>
          </div>
        </div>

        {/* Thank you + verse */}
        {thankYouVisible && (
          <div className="px-5 pb-5 animate-fade-out">
            <p className="text-xs text-amber-600 text-center mb-2.5">
              Thank you for praying. They are not alone.
            </p>
            <VerseCard text={verse.text} reference={verse.reference} />
          </div>
        )}
      </div>

      {showSheet && prayer.guided_prayer && (
        <GuidedPrayerSheet
          guidedPrayer={prayer.guided_prayer}
          category={primaryCategory}
          onDone={confirmPrayer}
          onClose={() => setShowSheet(false)}
        />
      )}
    </>
  );
}

export function PrayerQueue({
  initialPrayers,
  initialPrayedIds,
  initialFollowedIds,
  initialHasMore,
  featuredPrayer,
}: {
  initialPrayers: PrayerRequest[];
  initialPrayedIds: string[];
  initialFollowedIds: string[];
  initialHasMore: boolean;
  featuredPrayer: PrayerRequest | null;
}) {
  const [prayers, setPrayers] = useState(initialPrayers);
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set(initialPrayedIds));
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set(initialFollowedIds));
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();
  const [activeFilter, setActiveFilter] = useState("all");
  const feedRef = useRef<HTMLDivElement>(null);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of TILE_CATEGORIES) {
      counts[cat] = prayers.filter((p) => matchesFilter(p, cat)).length;
    }
    counts.all = prayers.length;
    return counts;
  }, [prayers]);

  function selectCategory(cat: string) {
    setActiveFilter(cat);
    setTimeout(() => {
      feedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

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
      {/* ── Featured prayer card ── */}
      {featuredPrayer && (
        <FeaturedCard
          prayer={featuredPrayer}
          initialPrayed={prayedIds.has(featuredPrayer.id)}
        />
      )}

      {/* ── Category scroll row ── */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide -mx-5 px-5">
        {/* "All" pill */}
        <button
          onClick={() => setActiveFilter("all")}
          className={`
            shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200
            ${
              activeFilter === "all"
                ? "bg-amber-100 text-amber-800 ring-2 ring-amber-400"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }
          `}
        >
          All
        </button>

        {/* Category tiles */}
        {TILE_CATEGORIES.map((cat) => {
          const style = getCategoryStyle(cat);
          const isActive = activeFilter === cat;

          return (
            <button
              key={cat}
              onClick={() => selectCategory(cat)}
              className={`
                relative shrink-0 rounded-xl overflow-hidden w-[100px] h-[70px]
                transition-all duration-200 active:scale-[0.97]
                ${isActive ? "ring-2 ring-amber-400 shadow-md" : "shadow-sm"}
              `}
            >
              <Image
                src={style.image}
                alt={style.label}
                fill
                className="object-cover"
                sizes="100px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
              <span className="absolute bottom-2 left-2 right-2 text-xs font-semibold text-white drop-shadow-sm text-left leading-tight">
                {style.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Prayer feed ── */}
      <div ref={feedRef} className="scroll-mt-4">
        {/* Active filter label */}
        {activeFilter !== "all" && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getCategoryStyle(activeFilter).dotColor}`} />
              <span className="text-sm font-medium text-gray-800">
                {getCategoryStyle(activeFilter).label}
              </span>
            </div>
            <button
              onClick={() => setActiveFilter("all")}
              className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
            >
              Show all
            </button>
          </div>
        )}

        {filteredPrayers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-400 text-sm leading-relaxed">
              {activeFilter === "all"
                ? "No prayers yet. Be the first to share."
                : "No prayers in this category yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
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
          <div className="flex justify-center mt-8 mb-4">
            <button
              onClick={loadMore}
              disabled={isPending}
              className="px-6 py-2.5 rounded-full text-sm font-medium bg-white text-stone-600 hover:bg-stone-50 border border-stone-200/60 shadow-sm transition-colors disabled:opacity-50"
            >
              {isPending ? "Loading\u2026" : "Load more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
