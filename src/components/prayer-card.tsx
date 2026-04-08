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
}: {
  prayer: PrayerRequest;
  initialPrayed: boolean;
}) {
  const [prayed, setPrayed] = useState(initialPrayed);
  const [count, setCount] = useState(prayer.prayer_count);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
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
    setTimeout(() => setThankYouVisible(false), 4000);

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
        className={`bg-white/80 backdrop-blur-sm rounded-2xl p-7 shadow-sm border-l-[3px] ${
          isUrgent ? "border-l-amber-400" : primaryStyle.borderColor
        }`}
      >
        {/* Category tags + time + urgent badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-wrap gap-1.5 items-center">
            {isUrgent && (
              <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wide">
                Urgent
              </span>
            )}
            {prayer.category.map((cat) => {
              const style = getCategoryStyle(cat);
              const Icon = CATEGORY_ICONS[cat] ?? Sparkle;
              return (
                <span
                  key={cat}
                  className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${style.chipBg} ${style.chipText}`}
                >
                  <Icon size={14} weight="thin" />
                  {style.label}
                </span>
              );
            })}
          </div>
          <span className="text-xs text-warm-gray-light shrink-0 ml-2">
            {timeLeft(prayer.expires_at)}
          </span>
        </div>

        {/* Prayer text — the human story */}
        <div className="mb-3">
          {showFullText ? (
            <p className="text-base text-gray-800 leading-relaxed">
              {prayer.text}
            </p>
          ) : (
            <>
              <p className="text-base text-gray-800 leading-relaxed">
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

        {/* Divider + "What to pray for" section */}
        {prayerPoints.length > 0 && (
          <>
            <div className="border-t border-stone-200/50 my-4" />
            <div className={`mb-4 ${primaryStyle.tintBg} rounded-xl px-4 py-3`}>
              <p className={`font-serif text-xs font-medium ${primaryStyle.chipText} mb-2 flex items-center gap-1.5`}>
                <HandsPraying size={13} weight="thin" />
                What to pray for
              </p>
              <ul className="space-y-1">
                {prayerPoints.map((point, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-700 leading-snug"
                  >
                    <span className={`${primaryStyle.bulletColor} mt-0.5 shrink-0`}>•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Divider before action row */}
        <div className="border-t border-stone-200/50 my-4" />

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
                  ? "bg-amber-100/80 text-amber-700 cursor-default"
                  : `${primaryStyle.tintBg} ${primaryStyle.chipText} hover:opacity-80 active:scale-95 border border-stone-200/60`
              }
            `}
          >
            <HandsPraying size={18} weight={prayed ? "duotone" : "thin"} />
            {prayed ? "Prayed" : "I Prayed"}
          </button>

          <span
            className={`
              text-sm font-medium tabular-nums rounded-full px-2 py-0.5
              transition-all duration-300
              ${animating ? "text-amber-500 scale-110 animate-count-pulse" : "text-warm-gray"}
            `}
          >
            {count} {count === 1 ? "prayer" : "prayers"}
          </span>
        </div>

        {/* Thank you message + verse */}
        {thankYouVisible && (
          <div className="mt-4 text-center animate-fade-out">
            <p className="text-xs text-amber-600">
              Thank you for praying. They are not alone.
            </p>
            <p className="font-serif text-[11px] text-warm-gray italic mt-2 leading-relaxed">
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
