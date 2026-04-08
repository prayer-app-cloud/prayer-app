"use client";

import { useState, useCallback } from "react";
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

export function PrayerDetail({
  prayer,
  isOwner,
  initialPrayed,
}: {
  prayer: PrayerRequest;
  isOwner: boolean;
  initialPrayed: boolean;
}) {
  const [prayed, setPrayed] = useState(initialPrayed);
  const [count, setCount] = useState(prayer.prayer_count);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [reported, setReported] = useState(false);

  const prayerPoints = parsePrayerPoints(prayer.prayer_points);
  const hasGuidedPrayer = !!prayer.guided_prayer;
  const isExpired = prayer.status === "expired";

  function handlePrayClick() {
    if (prayed || loading || isExpired) return;
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
    setTimeout(() => setAnimating(false), 600);

    const result = await recordPrayerTap(prayer.id);

    if (!result.success && !result.alreadyPrayed) {
      setPrayed(false);
      setCount((c) => c - 1);
    }

    setLoading(false);
  }

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const shareData = {
      title: "Someone needs prayer",
      text: "Would you pray for this person?",
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard");
    }
  }, []);

  return (
    <>
      {/* Back link */}
      <Link
        href="/"
        className="text-sm text-warm-gray hover:text-amber-600 transition-colors mb-6"
      >
        ← Back to prayers
      </Link>

      {/* Main card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-cream-dark">
        {/* Category tags + time */}
        <div className="flex items-center justify-between mb-4">
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

        {/* Prayer Points */}
        {prayerPoints.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-2">
              How others can pray
            </p>
            <ul className="space-y-2">
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
          </div>
        )}

        {/* Full text */}
        {prayerPoints.length > 0 ? (
          <div className="mb-5">
            {showFullText ? (
              <div>
                <p className="text-xs font-medium text-warm-gray uppercase tracking-wide mb-2">
                  Full story
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {prayer.text}
                </p>
              </div>
            ) : (
              <button
                onClick={() => setShowFullText(true)}
                className="text-xs text-amber-600 hover:text-amber-700 transition-colors"
              >
                Read full story
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-800 leading-relaxed mb-5">
            {prayer.text}
          </p>
        )}

        {/* Update text if exists */}
        {prayer.update_text && (
          <div className="rounded-xl bg-amber-50 p-4 mb-5">
            <p className="text-xs font-medium text-amber-600 mb-1">Update</p>
            <p className="text-sm text-gray-700">{prayer.update_text}</p>
          </div>
        )}

        {/* Prayer count */}
        <div className="flex items-center justify-center mb-5">
          <span
            className={`
              text-2xl font-semibold tabular-nums transition-all duration-300
              ${animating ? "text-amber-500 scale-110" : "text-gray-800"}
            `}
          >
            {count}
          </span>
          <span className="text-sm text-warm-gray ml-2">
            {count === 1 ? "person has prayed" : "people have prayed"}
          </span>
        </div>

        {/* I Prayed button */}
        {!isExpired && (
          <button
            onClick={handlePrayClick}
            disabled={prayed}
            className={`
              w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-base font-medium
              transition-all duration-200
              ${
                prayed
                  ? "bg-amber-100 text-amber-700 cursor-default"
                  : "bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.98] shadow-md"
              }
            `}
          >
            <span className="text-lg">{prayed ? "🙏" : "🤲"}</span>
            {prayed ? "You prayed for this" : "I prayed"}
          </button>
        )}

        {isExpired && (
          <div className="text-center py-3 text-sm text-warm-gray">
            This prayer request has expired.
          </div>
        )}
      </div>

      {/* Action buttons below card */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium bg-cream-dark text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Share
        </button>

        {!reported ? (
          <button
            onClick={() => setReported(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-cream-dark text-warm-gray hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            Report
          </button>
        ) : (
          <span className="flex items-center px-5 py-2.5 text-sm text-warm-gray-light">
            Reported
          </span>
        )}
      </div>

      {/* Owner actions */}
      {isOwner && (
        <div className="mt-4">
          <Link
            href={`/update/${prayer.id}`}
            className="block text-center py-2.5 rounded-full text-sm font-medium bg-cream-dark text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
          >
            Share an update
          </Link>
        </div>
      )}

      {/* Answered status */}
      {prayer.status === "answered" && (
        <div className="mt-4 rounded-2xl bg-green-50 border border-green-200 p-5 text-center">
          <p className="text-sm font-medium text-green-800">
            This prayer has been answered.
          </p>
        </div>
      )}

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
