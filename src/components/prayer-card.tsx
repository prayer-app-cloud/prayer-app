"use client";

import { useState, useMemo } from "react";
import { recordPrayerTap } from "@/app/actions";
import { GuidedPrayerSheet } from "@/components/guided-prayer-sheet";
import { getCategoryStyle } from "@/lib/category-config";
import { getRandomVerse } from "@/lib/verses";
import {
  Heartbeat,
  UsersThree,
  CloudRain,
  Coins,
  Spiral,
  Compass,
  Sparkle,
  HandsPraying,
} from "@phosphor-icons/react";
import type { PrayerRequest } from "@/lib/types/database";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";

const CATEGORY_ICONS: Record<string, PhosphorIcon> = {
  health: Heartbeat,
  family: UsersThree,
  grief: CloudRain,
  finances: Coins,
  inner_struggle: Spiral,
  work: Compass,
  school: Compass,
  work_school: Compass,
  other: Sparkle,
};

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

const TEXT_PREVIEW_LENGTH = 150;

export function PrayerCard({
  prayer,
  initialPrayed,
  expandBullets = false,
}: {
  prayer: PrayerRequest;
  initialPrayed: boolean;
  expandBullets?: boolean;
}) {
  const [prayed, setPrayed] = useState(initialPrayed);
  const [count, setCount] = useState(prayer.prayer_count);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [showAllBullets, setShowAllBullets] = useState(expandBullets);
  const [thankYouVisible, setThankYouVisible] = useState(false);

  const prayerPoints = parsePrayerPoints(prayer.prayer_points);
  const hasGuidedPrayer = !!prayer.guided_prayer;
  const isUrgent = prayer.urgency === "high";

  const primaryCategory = prayer.category[0] ?? "other";
  const primaryStyle = getCategoryStyle(primaryCategory);

  const verse = useMemo(() => getRandomVerse(primaryCategory), [primaryCategory]);

  const textIsTruncated = prayer.text.length > TEXT_PREVIEW_LENGTH;
  const textPreview = textIsTruncated
    ? prayer.text.slice(0, TEXT_PREVIEW_LENGTH) + "..."
    : prayer.text;

  const visibleChips = prayer.category.slice(0, 2);
  const overflowCount = prayer.category.length - 2;

  const visibleBullets = showAllBullets ? prayerPoints : prayerPoints.slice(0, 1);
  const hiddenBulletCount = prayerPoints.length - 1;

  // Default to display name; fall back to "Anonymous" only if explicitly anonymous with no snapshot
  const displayName = prayer.display_name_snapshot || (prayer.anonymous ? "Anonymous" : null);

  function handlePrayClick() {
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
      <div className="bg-white/85 backdrop-blur-sm rounded-2xl p-5 shadow-[0_1px_3px_rgba(120,100,70,0.08)]">
        {/* Category chips + time */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-wrap gap-1.5 items-center">
            {isUrgent && (
              <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                Urgent
              </span>
            )}
            {visibleChips.map((cat) => {
              const style = getCategoryStyle(cat);
              const Icon = CATEGORY_ICONS[cat] ?? Sparkle;
              return (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600"
                >
                  <Icon size={13} weight="thin" className={style.chipText} />
                  {style.label}
                </span>
              );
            })}
            {overflowCount > 0 && (
              <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-400">
                +{overflowCount}
              </span>
            )}
          </div>
          <span className="text-[11px] text-stone-400 shrink-0 ml-2">
            {timeLeft(prayer.expires_at)}
          </span>
        </div>

        {/* Display name */}
        {displayName && (
          <p className="text-xs text-stone-500 mb-1">{displayName}</p>
        )}

        {/* Prayer text — the hero */}
        <div className="mb-3">
          {showFullText ? (
            <p className="text-base font-medium text-gray-900 leading-relaxed">
              {prayer.text}
            </p>
          ) : (
            <>
              <p className="text-base font-medium text-gray-900 leading-relaxed">
                {textPreview}
              </p>
              {textIsTruncated && (
                <button
                  onClick={() => setShowFullText(true)}
                  className="text-xs text-amber-600 hover:text-amber-700 mt-1.5"
                >
                  Full story
                </button>
              )}
            </>
          )}
        </div>

        {/* "What to pray for" — collapsed on feed, expanded on detail */}
        {prayerPoints.length > 0 && (
          <div className="mb-3 mt-4">
            <p className="font-serif text-xs text-stone-500 mb-1.5 flex items-center gap-1">
              <HandsPraying size={12} weight="thin" />
              What to pray for
            </p>
            <ul className="space-y-0.5">
              {visibleBullets.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-600 leading-snug"
                >
                  <span className="text-stone-300 mt-0.5 shrink-0">•</span>
                  {point}
                </li>
              ))}
            </ul>
            {!showAllBullets && hiddenBulletCount > 0 && (
              <button
                onClick={() => setShowAllBullets(true)}
                className="text-xs text-amber-600 hover:text-amber-700 mt-1"
              >
                and {hiddenBulletCount} more
              </button>
            )}
          </div>
        )}

        {/* Divider before action row */}
        <div className="border-t border-stone-200/50 my-3" />

        {/* I Prayed button + count */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrayClick}
            disabled={prayed}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium
              transition-all duration-200
              ${
                prayed
                  ? "bg-stone-100 text-stone-400 cursor-default"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100 active:scale-95 border border-amber-200/60"
              }
            `}
          >
            <HandsPraying size={18} weight={prayed ? "duotone" : "thin"} />
            {prayed ? "Prayed \u2713" : "I Prayed"}
          </button>

          <span
            className={`
              text-xs tabular-nums rounded-full px-2 py-0.5
              transition-all duration-300
              ${animating ? "text-amber-500 scale-110 animate-count-pulse" : "text-stone-400"}
            `}
          >
            {count} {count === 1 ? "prayer" : "prayers"}
          </span>
        </div>

        {/* Thank you message + verse */}
        {thankYouVisible && (
          <div className="mt-3 text-center animate-fade-out">
            <p className="text-xs text-amber-600">
              Thank you for praying. They are not alone.
            </p>
            <p className="font-serif text-[11px] text-stone-400 italic mt-1.5 leading-relaxed">
              &ldquo;{verse.text}&rdquo; — {verse.reference}
            </p>
          </div>
        )}
      </div>

      {/* Guided Prayer bottom sheet */}
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
