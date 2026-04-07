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

  const prayerPoints = parsePrayerPoints(prayer.prayer_points);
  const hasGuidedPrayer = !!prayer.guided_prayer;

  // Open guided prayer sheet (or record tap directly if no guided prayer)
  function handlePrayClick() {
    if (prayed || loading) return;

    if (hasGuidedPrayer) {
      setShowSheet(true);
    } else {
      confirmPrayer();
    }
  }

  // Called after "Done" in guided prayer sheet, or directly if no guided prayer
  async function confirmPrayer() {
    setShowSheet(false);
    if (prayed || loading) return;
    setLoading(true);

    // Optimistic update
    setPrayed(true);
    setCount((c) => c + 1);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);

    const result = await recordPrayerTap(prayer.id);

    if (!result.success && !result.alreadyPrayed) {
      setPrayed(false);
      setCount((c) => c - 1);
    }

    setLoading(false);
  }

  // Show Prayer Points if available, otherwise fall back to text preview
  const preview =
    prayer.text.length > 120
      ? prayer.text.slice(0, 120) + "…"
      : prayer.text;

  return (
    <>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark">
        {/* Category tags + time */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-wrap gap-1.5">
            {prayer.category.map((cat) => (
              <span
                key={cat}
                className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-600"
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </span>
            ))}
          </div>
          <span className="text-xs text-warm-gray-light shrink-0 ml-2">
            {timeLeft(prayer.expires_at)}
          </span>
        </div>

        {/* Prayer Points or text preview */}
        {prayerPoints.length > 0 ? (
          <div className="mb-3">
            <ul className="space-y-1.5">
              {prayerPoints.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-800 leading-snug"
                >
                  <span className="text-amber-400 mt-0.5 shrink-0">•</span>
                  {point}
                </li>
              ))}
            </ul>
            {/* Toggle full text */}
            {showFullText ? (
              <p className="text-xs text-warm-gray mt-3 leading-relaxed">
                {prayer.text}
              </p>
            ) : (
              <button
                onClick={() => setShowFullText(true)}
                className="text-xs text-amber-600 hover:text-amber-700 mt-2"
              >
                View full request
              </button>
            )}
          </div>
        ) : (
          <Link href={`/r/${prayer.share_slug}`}>
            <p className="text-gray-800 text-sm leading-relaxed mb-4">
              {preview}
            </p>
          </Link>
        )}

        {/* I Prayed button + count */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrayClick}
            disabled={prayed}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-200
              ${
                prayed
                  ? "bg-amber-100 text-amber-700 cursor-default"
                  : "bg-cream-dark text-gray-700 hover:bg-amber-50 hover:text-amber-700 active:scale-95"
              }
            `}
          >
            <span className="text-base">{prayed ? "🙏" : "🤲"}</span>
            {prayed ? "Prayed" : "I prayed"}
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
