"use client";

import { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HandsPraying, BookmarkSimple } from "@phosphor-icons/react";
import { GuidedPrayerSheet } from "@/components/guided-prayer-sheet";
import { VerseCard } from "@/components/verse-card";
import { fetchPrayers, fetchPrayedRequestIds, fetchFollowedRequestIds, recordPrayerTap, followPrayer, unfollowPrayer } from "@/app/actions";
import { logEvent } from "@/lib/events";
import { getCategoryStyle } from "@/lib/category-config";
import { getRandomVerse } from "@/lib/verses";
import type { PrayerRequest, CategoryEnum } from "@/lib/types/database";

const TILE_CATEGORIES: CategoryEnum[] = [
  "health", "family", "grief", "finances",
  "inner_struggle", "work", "school", "other",
];

function matchesFilter(prayer: PrayerRequest, filter: string): boolean {
  if (filter === "all") return true;
  return prayer.category.includes(filter as CategoryEnum);
}

function timeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 24) return `${Math.floor(hours / 24)}d left`;
  if (hours >= 1) return `${hours}h left`;
  return `${Math.floor(diff / (1000 * 60))}m left`;
}

function parsePrayerPoints(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

// ── Individual prayer card (used in feed) ──
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function FeedCard({
  prayer,
  initialPrayed,
  initialFollowed,
}: {
  prayer: PrayerRequest;
  initialPrayed: boolean;
  initialFollowed: boolean;
}) {
  const router = useRouter();
  const [prayed, setPrayed] = useState(initialPrayed);
  const [followed, setFollowed] = useState(initialFollowed);
  const [count, setCount] = useState(prayer.prayer_count);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [thankYouVisible, setThankYouVisible] = useState(false);
  const [showFollowPrompt, setShowFollowPrompt] = useState(false);

  const primaryCategory = prayer.category[0] ?? "other";
  const style = getCategoryStyle(primaryCategory);
  const hasGuidedPrayer = !!prayer.guided_prayer;
  const displayName = prayer.display_name_snapshot || (prayer.anonymous ? "Anonymous" : null);
  const prayerPoints = parsePrayerPoints(prayer.prayer_points);
  const verse = useMemo(() => getRandomVerse(primaryCategory), [primaryCategory]);
  const isAnswered = prayer.status === "answered";
  const isUpdated = prayer.status === "updated";

  const titleText = prayer.title || (prayer.text.length > 60 ? prayer.text.slice(0, 57) + "..." : prayer.text);
  const titleDuplicatesBody = !!prayer.title && prayer.text.startsWith(prayer.title);
  const showBody = !!prayer.title && !titleDuplicatesBody;

  function handlePrayClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (prayed || loading) return;
    if (hasGuidedPrayer) setShowSheet(true);
    else confirmPray();
  }

  async function confirmPray() {
    setShowSheet(false);
    if (prayed || loading) return;
    setLoading(true);
    setPrayed(true);
    setCount((c) => c + 1);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 700);
    setThankYouVisible(true);
    setTimeout(() => setThankYouVisible(false), 7000);

    // Show follow prompt after praying if not already following
    if (!followed) {
      setShowFollowPrompt(true);
      setTimeout(() => setShowFollowPrompt(false), 5000);
    }

    const totalPrayed = parseInt(localStorage.getItem("totalPrayed") ?? "0", 10) + 1;
    localStorage.setItem("totalPrayed", String(totalPrayed));

    const result = await recordPrayerTap(prayer.id);
    if (!result.success && !result.alreadyPrayed) {
      setPrayed(false);
      setCount((c) => c - 1);
    }
    logEvent(null, "pray_tapped", { request_id: prayer.id });
    setLoading(false);
  }

  function handleFollow(e: React.MouseEvent) {
    e.stopPropagation();
    if (followed) {
      setFollowed(false);
      unfollowPrayer(prayer.id);
    } else {
      setFollowed(true);
      setShowFollowPrompt(false);
      followPrayer(prayer.id);
    }
  }

  return (
    <>
      <div className={`
        rounded-2xl shadow-sm overflow-hidden
        ${isAnswered ? "bg-amber-50/30 border-l-2 border-amber-300" : isUpdated ? "bg-white border-l-2 border-stone-300" : "bg-white"}
      `}>
        <div
          onClick={() => router.push(`/r/${prayer.share_slug}`)}
          className="p-5 pb-3 cursor-pointer hover:bg-stone-50/30 active:bg-stone-50/50 transition-colors"
        >
          {/* Meta row */}
          <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-2">
            <span className={`w-2 h-2 rounded-full shrink-0 ${style.dotColor}`} />
            <span className={style.chipText}>{style.label}</span>
            {displayName && (
              <>
                <span>·</span>
                <span className="text-stone-500 font-medium">{displayName}</span>
              </>
            )}
            <span>·</span>
            <span>{timeLeft(prayer.expires_at)}</span>
            {isAnswered && (
              <span className="inline-flex shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wide ml-1">
                Answered
              </span>
            )}
            {isUpdated && (
              <span className="text-stone-400 ml-1">
                Updated {timeAgo(prayer.updated_at)}
              </span>
            )}
          </div>

          {/* Title */}
          <p className="font-serif text-lg font-semibold text-gray-900 leading-relaxed mb-2 mt-2">
            {titleText}
          </p>

          {/* Body */}
          {showBody && (
            <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">
              {prayer.text}
            </p>
          )}

          {/* Prayer point */}
          {prayerPoints[0] && !showBody && (
            <p className="text-xs text-stone-400 italic mt-2 truncate">
              How others can pray: {prayerPoints[0]}
            </p>
          )}

          {/* Answered update */}
          {isAnswered && prayer.update_text && (
            <p className="text-xs text-stone-500 italic mt-2">
              ✓ {prayer.update_text}
            </p>
          )}
        </div>

        {/* Action row */}
        <div className="flex items-center gap-3 px-5 pb-4 pt-2">
          <button
            onClick={handlePrayClick}
            disabled={prayed}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${prayed
                ? "bg-stone-100 text-stone-400 cursor-default"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 shadow-sm active:scale-[0.96]"
              }
            `}
          >
            <HandsPraying size={14} weight={prayed ? "duotone" : "thin"} />
            {prayed ? "Prayed \u2713" : "Pray"}
          </button>
          <button
            onClick={handleFollow}
            className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm transition-all ${followed ? "text-amber-600" : "text-stone-400 hover:text-amber-600"}`}
          >
            <BookmarkSimple size={14} weight={followed ? "fill" : "thin"} className={followed ? "text-amber-500" : ""} />
            <span className="text-xs">{followed ? "Following" : "Follow"}</span>
          </button>
          <span className={`text-sm tabular-nums transition-all duration-300 ml-auto ${animating ? "text-amber-500 scale-110" : "text-stone-400"}`}>
            {count} {count === 1 ? "prayer" : "prayers"}
          </span>
        </div>

        {/* Follow prompt after praying */}
        {showFollowPrompt && !followed && (
          <div className="px-5 pb-4 animate-fade-in">
            <button
              onClick={handleFollow}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-full text-xs font-medium bg-stone-50 text-stone-500 hover:bg-amber-50 hover:text-amber-700 transition-colors"
            >
              <BookmarkSimple size={12} weight="thin" />
              Follow this prayer for updates
            </button>
          </div>
        )}

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
          requestId={prayer.id}
          onDone={confirmPray}
          onClose={() => setShowSheet(false)}
        />
      )}
    </>
  );
}

// ── Main Prayer Room tab ──
export function PrayerRoomTab({
  initialPrayers,
  initialPrayedIds,
  initialFollowedIds,
  featuredPrayer,
}: {
  initialPrayers: PrayerRequest[];
  initialPrayedIds: string[];
  initialFollowedIds: string[];
  featuredPrayer: PrayerRequest | null;
}) {
  const router = useRouter();
  const [prayers, setPrayers] = useState(initialPrayers);
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set(initialPrayedIds));
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set(initialFollowedIds));
  const [hasMore, setHasMore] = useState(initialPrayers.length >= 10);
  const [isPending, startTransition] = useTransition();
  const [activeFilter, setActiveFilter] = useState("all");

  // Featured card state
  const [featuredPrayed, setFeaturedPrayed] = useState(
    featuredPrayer ? prayedIds.has(featuredPrayer.id) : false
  );
  const [featuredCount, setFeaturedCount] = useState(featuredPrayer?.prayer_count ?? 0);
  const [featuredAnimating, setFeaturedAnimating] = useState(false);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [featuredSheet, setFeaturedSheet] = useState(false);
  const [featuredThankYou, setFeaturedThankYou] = useState(false);

  const featuredCategory = featuredPrayer?.category[0] ?? "other";
  const featuredStyle = getCategoryStyle(featuredCategory);
  const featuredVerse = useMemo(() => getRandomVerse(featuredCategory), [featuredCategory]);
  const featuredDisplayName = featuredPrayer?.display_name_snapshot || "Anonymous";

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: prayers.length };
    for (const cat of TILE_CATEGORIES) {
      counts[cat] = prayers.filter((p) => matchesFilter(p, cat)).length;
    }
    return counts;
  }, [prayers]);

  const filteredPrayers = prayers.filter((p) => matchesFilter(p, activeFilter));

  function loadMore() {
    startTransition(async () => {
      const result = await fetchPrayers(prayers.length, 10);
      if (result.prayers.length > 0) {
        const ids = result.prayers.map((p) => p.id);
        const [newPrayed, newFollowed] = await Promise.all([
          fetchPrayedRequestIds(ids),
          fetchFollowedRequestIds(ids),
        ]);
        setPrayers((prev) => [...prev, ...result.prayers]);
        setPrayedIds((prev) => {
          const next = new Set(prev);
          newPrayed.forEach((id) => next.add(id));
          return next;
        });
        setFollowedIds((prev) => {
          const next = new Set(prev);
          newFollowed.forEach((id) => next.add(id));
          return next;
        });
      }
      setHasMore(result.hasMore);
    });
  }

  // Featured pray handler
  function handleFeaturedPray(e: React.MouseEvent) {
    e.stopPropagation();
    if (featuredPrayed || featuredLoading || !featuredPrayer) return;
    if (featuredPrayer.guided_prayer) setFeaturedSheet(true);
    else confirmFeaturedPray();
  }

  async function confirmFeaturedPray() {
    if (!featuredPrayer || featuredPrayed || featuredLoading) return;
    setFeaturedSheet(false);
    setFeaturedLoading(true);
    setFeaturedPrayed(true);
    setFeaturedCount((c) => c + 1);
    setFeaturedAnimating(true);
    setTimeout(() => setFeaturedAnimating(false), 700);
    setFeaturedThankYou(true);
    setTimeout(() => setFeaturedThankYou(false), 7000);

    const totalPrayed = parseInt(localStorage.getItem("totalPrayed") ?? "0", 10) + 1;
    localStorage.setItem("totalPrayed", String(totalPrayed));

    const result = await recordPrayerTap(featuredPrayer.id);
    if (!result.success && !result.alreadyPrayed) {
      setFeaturedPrayed(false);
      setFeaturedCount((c) => c - 1);
    }
    logEvent(null, "pray_tapped", { request_id: featuredPrayer.id });
    setFeaturedLoading(false);
  }

  return (
    <div className="px-5 pt-6 pb-24">
      {/* Header */}
      <h1 className="font-serif text-xl font-semibold text-gray-900">Prayer Room</h1>
      <p className="text-xs text-stone-400 mt-1">Someone needs prayer right now</p>

      {/* Featured card */}
      {featuredPrayer && (
        <div className="bg-white rounded-2xl shadow-sm p-5 mt-4">
          <div
            onClick={() => router.push(`/r/${featuredPrayer.share_slug}`)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${featuredStyle.dotColor}`} />
              <span className={featuredStyle.chipText}>{featuredStyle.label}</span>
              <span>·</span>
              <span className="text-stone-500 font-medium">{featuredDisplayName}</span>
              <span>·</span>
              <span>{timeLeft(featuredPrayer.expires_at)}</span>
            </div>
            <p className="font-serif text-lg font-semibold text-gray-900 leading-relaxed mb-2">
              {featuredPrayer.title || featuredPrayer.text.slice(0, 60)}
            </p>
            <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">
              {featuredPrayer.text}
            </p>
          </div>

          <div className="flex justify-center mt-3">
            <button
              onClick={handleFeaturedPray}
              disabled={featuredPrayed}
              className={`
                flex items-center gap-1.5 px-6 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-all
                ${featuredPrayed
                  ? "bg-stone-100 text-stone-400 cursor-default"
                  : "bg-amber-400 text-amber-900 active:scale-[0.96]"
                }
              `}
            >
              <HandsPraying size={16} weight={featuredPrayed ? "duotone" : "thin"} />
              {featuredPrayed ? "Prayed \u2713" : "Pray"}
            </button>
          </div>
          <p className={`text-sm text-center mt-2 tabular-nums transition-all duration-300 ${featuredAnimating ? "text-amber-500 scale-110" : "text-stone-400"}`}>
            {featuredCount} {featuredCount === 1 ? "prayer" : "prayers"}
          </p>

          {featuredThankYou && (
            <div className="mt-3 animate-fade-out">
              <p className="text-xs text-amber-600 text-center mb-2">
                Thank you for praying. They are not alone.
              </p>
              <VerseCard text={featuredVerse.text} reference={featuredVerse.reference} />
            </div>
          )}
        </div>
      )}

      {/* Category pills */}
      <p className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-3 mt-6">Browse</p>
      <div className="flex flex-wrap gap-2">
        {/* All pill */}
        <button
          onClick={() => setActiveFilter("all")}
          className={`
            px-3 py-2 rounded-full text-xs font-medium transition-all
            ${activeFilter === "all"
              ? "bg-stone-800 text-white"
              : "bg-white border border-stone-200/60 text-stone-600"
            }
          `}
        >
          All
        </button>

        {TILE_CATEGORIES.map((cat) => {
          const catStyle = getCategoryStyle(cat);
          const count = categoryCounts[cat] ?? 0;
          const isActive = activeFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all
                ${isActive
                  ? "bg-stone-800 text-white"
                  : "bg-white border border-stone-200/60 text-stone-600"
                }
              `}
            >
              <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0">
                <Image
                  src={catStyle.image}
                  alt={catStyle.label}
                  fill
                  className="object-cover"
                  sizes="24px"
                />
              </div>
              {catStyle.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Feed */}
      <div className="mt-4 space-y-4">
        {activeFilter !== "all" && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getCategoryStyle(activeFilter).dotColor}`} />
              <span className="text-sm font-medium text-gray-800">{getCategoryStyle(activeFilter).label}</span>
            </div>
            <button onClick={() => setActiveFilter("all")} className="text-xs text-stone-400 hover:text-stone-600">
              Show all
            </button>
          </div>
        )}

        {filteredPrayers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-400 text-sm">
              {activeFilter === "all" ? "No prayers yet. Be the first to share." : "No prayers in this category yet."}
            </p>
          </div>
        ) : (
          filteredPrayers.map((prayer) => (
            <FeedCard
              key={prayer.id}
              prayer={prayer}
              initialPrayed={prayedIds.has(prayer.id)}
              initialFollowed={followedIds.has(prayer.id)}
            />
          ))
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

      {/* Post CTA bar */}
      <div className="fixed bottom-[60px] left-0 right-0 z-40 flex justify-center pb-3 pt-2 bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2]/95 to-transparent pointer-events-none">
        <Link
          href="/post"
          className="pointer-events-auto px-8 py-3 rounded-full text-sm font-medium bg-amber-400 text-amber-900 shadow-lg shadow-amber-400/20 active:scale-[0.96] transition-transform"
        >
          Need prayer?
        </Link>
      </div>

      {featuredSheet && featuredPrayer?.guided_prayer && (
        <GuidedPrayerSheet
          guidedPrayer={featuredPrayer.guided_prayer}
          category={featuredCategory}
          requestId={featuredPrayer.id}
          onDone={confirmFeaturedPray}
          onClose={() => setFeaturedSheet(false)}
        />
      )}
    </div>
  );
}
