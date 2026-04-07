"use client";

import { useState } from "react";
import Link from "next/link";
import { recordPrayerTap } from "@/app/actions";
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

  async function handlePray() {
    if (prayed || loading) return;
    setLoading(true);

    // Optimistic update
    setPrayed(true);
    setCount((c) => c + 1);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 600);

    const result = await recordPrayerTap(prayer.id);

    if (!result.success && !result.alreadyPrayed) {
      // Revert on actual error
      setPrayed(false);
      setCount((c) => c - 1);
    }

    setLoading(false);
  }

  const preview =
    prayer.text.length > 120
      ? prayer.text.slice(0, 120) + "…"
      : prayer.text;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-cream-dark">
      <div className="flex items-center justify-between mb-3">
        <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
          {CATEGORY_LABELS[prayer.category] ?? prayer.category}
        </span>
        <span className="text-xs text-warm-gray-light">
          {timeLeft(prayer.expires_at)}
        </span>
      </div>

      <Link href={`/r/${prayer.share_slug}`}>
        <p className="text-gray-800 text-sm leading-relaxed mb-4">
          {preview}
        </p>
      </Link>

      <div className="flex items-center justify-between">
        <button
          onClick={handlePray}
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
  );
}
