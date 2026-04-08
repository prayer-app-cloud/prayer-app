"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
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
  ShareNetwork,
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
  const [thankYouVisible, setThankYouVisible] = useState(false);

  const prayerPoints = parsePrayerPoints(prayer.prayer_points);
  const hasGuidedPrayer = !!prayer.guided_prayer;
  const isExpired = prayer.status === "expired";

  const primaryCategory = prayer.category[0] ?? "other";
  const verse = useMemo(() => getRandomVerse(primaryCategory), [primaryCategory]);

  const displayName = prayer.display_name_snapshot ?? (prayer.anonymous ? "Anonymous" : null);

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

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const shareData = {
      title: "Someone needs prayer",
      text: "Someone needs prayer. Tap to pray for them.",
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard");
    }
  }, []);

  return (
    <>
      <Link
        href="/"
        className="text-sm text-warm-gray hover:text-amber-600 transition-colors mb-6"
      >
        ← Back to prayers
      </Link>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-sm">
        {/* Category chips + time */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-wrap gap-1.5">
            {prayer.category.map((cat) => {
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
          </div>
          <span className="text-[11px] text-stone-400 shrink-0 ml-2">
            {timeLeft(prayer.expires_at)}
          </span>
        </div>

        {/* Display name */}
        {displayName && (
          <p className="text-xs text-stone-400 mb-1">{displayName}</p>
        )}

        {/* Prayer Points — all expanded on detail page */}
        {prayerPoints.length > 0 && (
          <div className="mb-4">
            <p className="font-serif text-xs text-stone-500 mb-1.5 flex items-center gap-1">
              <HandsPraying size={12} weight="thin" />
              What to pray for
            </p>
            <ul className="space-y-1">
              {prayerPoints.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-600 leading-snug"
                >
                  <span className="text-stone-300 mt-0.5 shrink-0">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Full text */}
        {prayerPoints.length > 0 ? (
          <div className="mb-4">
            {showFullText ? (
              <div>
                <p className="text-xs text-stone-500 mb-1.5">Full story</p>
                <p className="text-base font-medium text-gray-800 leading-relaxed">
                  {prayer.text}
                </p>
              </div>
            ) : (
              <button
                onClick={() => setShowFullText(true)}
                className="text-xs text-amber-600 hover:text-amber-700 transition-colors"
              >
                Full story
              </button>
            )}
          </div>
        ) : (
          <p className="text-base font-medium text-gray-800 leading-relaxed mb-4">
            {prayer.text}
          </p>
        )}

        {/* Update text */}
        {prayer.update_text && (
          <div className="rounded-xl bg-amber-50/40 p-4 mb-4">
            <p className="text-xs text-stone-500 mb-1">Update</p>
            <p className="text-sm text-gray-700">{prayer.update_text}</p>
          </div>
        )}

        {/* Prayer count */}
        <div className="flex items-center justify-center mb-4">
          <span
            className={`
              text-2xl font-semibold tabular-nums transition-all duration-300
              ${animating ? "text-amber-500 scale-110 animate-count-pulse" : "text-gray-800"}
            `}
          >
            {count}
          </span>
          <span className="text-xs text-stone-400 ml-2">
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
                  ? "bg-stone-100 text-stone-400 cursor-default"
                  : "bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.98] shadow-sm"
              }
            `}
          >
            <HandsPraying size={20} weight={prayed ? "duotone" : "thin"} />
            {prayed ? "Prayed \u2713" : "I Prayed"}
          </button>
        )}

        {isExpired && (
          <div className="text-center py-3 text-sm text-stone-400">
            This prayer request has expired.
          </div>
        )}

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

      {/* Action buttons below card */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
        >
          <ShareNetwork size={16} weight="thin" />
          Share
        </button>

        {!reported ? (
          <button
            onClick={() => setReported(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-stone-100 text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            Report
          </button>
        ) : (
          <span className="flex items-center px-5 py-2.5 text-sm text-stone-400">
            Reported
          </span>
        )}
      </div>

      {/* Owner actions */}
      {isOwner && (
        <div className="mt-4">
          <Link
            href={`/update/${prayer.id}`}
            className="block text-center py-2.5 rounded-full text-sm font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
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
