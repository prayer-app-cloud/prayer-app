"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { recordPrayerTap } from "@/app/actions";

import { GuidedPrayerSheet } from "@/components/guided-prayer-sheet";
import { getCategoryStyle } from "@/lib/category-config";
import { getRandomVerse } from "@/lib/verses";
import { HandsPraying } from "@phosphor-icons/react";
import { VerseCard } from "@/components/verse-card";
import type { PrayerRequest } from "@/lib/types/database";

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

const BODY_LIMIT = 100;

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
  const titleDuplicatesBody = !!prayer.title && prayer.text.startsWith(prayer.title);
  const showBody = !!prayer.title && !titleDuplicatesBody;
  const firstPoint = prayerPoints[0] ?? null;
  const isAnswered = prayer.status === "answered";

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
      <div
        className={`
          rounded-2xl shadow-sm transition-all duration-200 animate-fade-in overflow-hidden
          ${isAnswered ? "bg-amber-50/30" : "bg-white"}
        `}
      >
        {/* Tappable content area */}
        <div
          onClick={handleRowClick}
          className="p-5 pb-3 cursor-pointer hover:bg-stone-50/30 active:bg-stone-50/50 transition-colors"
        >
          {/* Meta line: dot + category · name · time */}
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

          {/* Title — serif font */}
          <div className="flex items-center gap-2 mb-2">
            <p className="font-serif text-lg font-semibold text-gray-900 leading-relaxed">
              {prayer.title || bodyPreview}
            </p>
            {isAnswered && (
              <span className="inline-flex shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100/60 text-amber-700">
                Answered
              </span>
            )}
          </div>

          {/* Body preview — max 2 lines */}
          {showBody && (
            <p className="text-sm text-stone-600 leading-relaxed line-clamp-2 mb-2">
              {bodyPreview}
            </p>
          )}

          {/* Prayer point summary */}
          {firstPoint && !showBody && (
            <p className="text-sm text-stone-400 italic leading-relaxed truncate">
              Pray for: {firstPoint}
            </p>
          )}
        </div>

        {/* Action row */}
        <div className="flex items-center px-5 pb-4 pt-2 gap-3">
          <button
            onClick={handlePrayClick}
            disabled={prayed}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
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

        {/* Thank you + verse card */}
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
