"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { recordPrayerTap, followPrayer, unfollowPrayer } from "@/app/actions";
import { GuidedPrayerSheet } from "@/components/guided-prayer-sheet";
import { getCategoryStyle } from "@/lib/category-config";
import { getRandomVerse } from "@/lib/verses";
import { HandsPraying, BookmarkSimple } from "@phosphor-icons/react";
import type { PrayerRequest } from "@/lib/types/database";

function timeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / (1000 * 60 * 60));
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

const BODY_LIMIT = 80;

export function FeedItem({
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

  const prayerPoints = parsePrayerPoints(prayer.prayer_points);
  const hasGuidedPrayer = !!prayer.guided_prayer;
  const primaryCategory = prayer.category[0] ?? "other";
  const primaryStyle = getCategoryStyle(primaryCategory);
  const verse = useMemo(() => getRandomVerse(primaryCategory), [primaryCategory]);

  const displayName = prayer.display_name_snapshot || (prayer.anonymous ? "Anonymous" : null);
  const bodyPreview = prayer.text.length > BODY_LIMIT
    ? prayer.text.slice(0, BODY_LIMIT) + "..."
    : prayer.text;
  const firstPoint = prayerPoints[0] ?? null;
  const isAnswered = prayer.status === "answered";
  const hasUpdate = !!prayer.update_text;

  function handleRowClick() {
    router.push(`/r/${prayer.share_slug}`);
  }

  function handlePrayClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (prayed || loading) return;
    if (hasGuidedPrayer) {
      setShowSheet(true);
    } else {
      confirmPrayer();
    }
  }

  function handleBookmarkClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (followed) {
      setFollowed(false);
      unfollowPrayer(prayer.id);
    } else {
      setFollowed(true);
      followPrayer(prayer.id);
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
      <div className={`border-b border-stone-100 last:border-b-0 ${isAnswered ? "border-l-2 border-l-emerald-200" : ""}`}>
        <div
          onClick={handleRowClick}
          className="py-4 px-1 cursor-pointer hover:bg-stone-50/60 active:bg-stone-50 transition-colors rounded-lg -mx-1"
        >
          {/* Meta line: name · category · time */}
          <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mb-1">
            {displayName && (
              <>
                <span className="text-stone-500 font-medium">{displayName}</span>
                <span>·</span>
              </>
            )}
            <span>{primaryStyle.label}</span>
            <span>·</span>
            <span>{timeLeft(prayer.expires_at)}</span>
          </div>

          {/* Title (headline) + answered badge */}
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[15px] font-semibold text-gray-900 leading-snug">
              {prayer.title || bodyPreview}
            </p>
            {isAnswered && (
              <span className="inline-flex shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                Answered
              </span>
            )}
          </div>

          {/* Body preview (only if we have a title) */}
          {prayer.title && (
            <p className="text-sm text-stone-600 leading-snug mb-1">
              {bodyPreview}
            </p>
          )}

          {/* One-line prayer point summary */}
          {firstPoint && (
            <p className="text-sm text-stone-400 italic leading-snug truncate">
              Pray for: {firstPoint}
            </p>
          )}
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between pb-4 px-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrayClick}
              disabled={prayed}
              className={`
                flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium
                transition-all duration-200
                ${
                  prayed
                    ? "bg-stone-100 text-stone-400 cursor-default"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100 active:scale-95 border border-amber-200/60"
                }
              `}
            >
              <HandsPraying size={16} weight={prayed ? "duotone" : "thin"} />
              {prayed ? "Prayed \u2713" : "I Prayed"}
            </button>

            <button
              onClick={handleBookmarkClick}
              className="p-2 rounded-full hover:bg-stone-100 transition-colors"
              aria-label={followed ? "Unfollow prayer" : "Follow prayer"}
            >
              <BookmarkSimple
                size={18}
                weight={followed ? "duotone" : "thin"}
                className={followed ? "text-amber-500" : "text-stone-400"}
              />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {hasUpdate && (
              <span className="text-[11px] text-stone-400">1 update</span>
            )}
            <span
              className={`
                text-xs tabular-nums
                transition-all duration-300
                ${animating ? "text-amber-500 scale-110 animate-count-pulse" : "text-stone-400"}
              `}
            >
              {count} {count === 1 ? "prayer" : "prayers"}
            </span>
          </div>
        </div>

        {/* Thank you message + verse */}
        {thankYouVisible && (
          <div className="pb-3 px-1 text-center animate-fade-out">
            <p className="text-xs text-amber-600">
              Thank you for praying. They are not alone.
            </p>
            <p className="font-serif text-[11px] text-stone-400 italic mt-1 leading-relaxed">
              &ldquo;{verse.text}&rdquo; — {verse.reference}
            </p>
          </div>
        )}
      </div>

      {showSheet && prayer.guided_prayer && (
        <GuidedPrayerSheet
          guidedPrayer={prayer.guided_prayer}
          onDone={confirmPrayer}
          onClose={() => setShowSheet(false)}
        />
      )}
    </>
  );
}
