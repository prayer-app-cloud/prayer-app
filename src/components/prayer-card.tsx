"use client";

import { useState, useMemo } from "react";
import { recordPrayerTap } from "@/app/actions";
import { GuidedPrayerSheet } from "@/components/guided-prayer-sheet";
import { getCategoryStyle } from "@/lib/category-config";
import { getRandomVerse } from "@/lib/verses";
import {
  Heart,
  Users,
  CloudRain,
  Wallet,
  Brain,
  Briefcase,
  Sparkles,
} from "lucide-react";
import type { PrayerRequest } from "@/lib/types/database";
import type { LucideIcon } from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  health: Heart,
  family: Users,
  grief: CloudRain,
  finances: Wallet,
  inner_struggle: Brain,
  work: Briefcase,
  school: Briefcase,
  work_school: Briefcase,
  other: Sparkles,
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

  // Pick a verse once when the component mounts (stable across re-renders)
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

    // Optimistic update
    setPrayed(true);
    setCount((c) => c + 1);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);

    // Show thank you message
    setThankYouVisible(true);
    setTimeout(() => setThankYouVisible(false), 3000);

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
        className={`bg-white rounded-2xl p-6 shadow-sm border border-cream-dark border-l-[3px] ${
          isUrgent ? "border-l-amber-400" : primaryStyle.borderColor
        }`}
      >
        {/* Category tags + time + urgent badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-wrap gap-1.5 items-center">
            {isUrgent && (
              <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wide">
                Urgent
              </span>
            )}
            {prayer.category.map((cat) => {
              const style = getCategoryStyle(cat);
              const Icon = CATEGORY_ICONS[cat] ?? Sparkles;
              return (
                <span
                  key={cat}
                  className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full ${style.chipBg} ${style.chipText}`}
                >
                  <Icon size={14} />
                  {style.label}
                </span>
              );
            })}
          </div>
          <span className="text-xs text-warm-gray-light shrink-0 ml-2">
            {timeLeft(prayer.expires_at)}
          </span>
        </div>

        {/* Raw prayer text first — the human story */}
        <div className="mb-3">
          {showFullText ? (
            <p className="text-sm text-gray-800 leading-relaxed">
              {prayer.text}
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-800 leading-relaxed">
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

        {/* Divider before prayer points */}
        {prayerPoints.length > 0 && (
          <>
            <div className="border-t border-cream-dark/50 my-3" />
            <div className="mb-4 bg-amber-50/50 rounded-xl px-4 py-3">
              <p className="text-[11px] font-medium text-amber-600 mb-2">
                What to pray for
              </p>
              <ul className="space-y-1">
                {prayerPoints.map((point, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-2 text-sm text-gray-700 leading-snug`}
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
        <div className="border-t border-cream-dark/50 my-3" />

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
                  ? "bg-amber-100 text-amber-700 cursor-default"
                  : "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 active:scale-95 border border-amber-200"
              }
            `}
          >
            <span className="text-base">{prayed ? "🙏" : "🤲"}</span>
            {prayed ? "Prayed" : "I Prayed"}
          </button>

          <span
            className={`
              text-sm font-medium tabular-nums
              transition-all duration-300
              ${animating ? "text-amber-500 scale-110" : "text-warm-gray"}
            `}
          >
            {count} {count === 1 ? "prayer" : "prayers"}
          </span>
        </div>

        {/* Thank you message + verse after praying */}
        {thankYouVisible && (
          <div className="mt-3 text-center animate-fade-out">
            <p className="text-xs text-amber-600">
              Thank you for praying. They are not alone.
            </p>
            <p className="text-[11px] text-warm-gray italic mt-1.5 leading-relaxed">
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
