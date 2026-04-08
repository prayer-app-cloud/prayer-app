"use client";

import { useState } from "react";
import Link from "next/link";
import { recordPrayerTap } from "@/app/actions";
import { GuidedPrayerSheet } from "@/components/guided-prayer-sheet";
import type { PrayerRequest } from "@/lib/types/database";

const CATEGORY_LABELS: Record<string, string> = {
  health: "Health",
  family: "Family",
  grief: "Grief",
  finances: "Finances",
  inner_struggle: "Inner Struggle",
  work: "Work",
  school: "School",
  other: "Other",
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
        className={`bg-white rounded-2xl p-6 shadow-sm border border-cream-dark ${
          isUrgent ? "border-l-[3px] border-l-amber-400" : ""
        }`}
      >
        {/* Category tags + time + urgent badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-wrap gap-1.5 items-center">
            {isUrgent && (
              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wide">
                Urgent
              </span>
            )}
            {prayer.category.map((cat) => (
              <span
                key={cat}
                className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-amber-50/70 text-amber-600"
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </span>
            ))}
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

        {/* AI prayer points — secondary supporting section */}
        {prayerPoints.length > 0 && (
          <div className="mb-4 bg-amber-50/50 rounded-xl px-4 py-3">
            <p className="text-[11px] font-medium text-amber-600 uppercase tracking-wide mb-2">
              How others can pray
            </p>
            <ul className="space-y-1">
              {prayerPoints.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-700 leading-snug"
                >
                  <span className="text-amber-400 mt-0.5 shrink-0">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

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

        {/* Thank you message after praying */}
        {thankYouVisible && (
          <p className="text-xs text-amber-600 mt-3 text-center animate-fade-out">
            Thank you for praying. They are not alone.
          </p>
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
