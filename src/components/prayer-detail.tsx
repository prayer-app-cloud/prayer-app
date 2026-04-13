"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { recordPrayerTap, followPrayer, unfollowPrayer } from "@/app/actions";
import type { Update } from "@/lib/types/database";

import { GuidedPrayerSheet } from "@/components/guided-prayer-sheet";
import { VerseCard } from "@/components/verse-card";
import { getCategoryStyle, ANSWERED_GRADIENT } from "@/lib/category-config";
import { getCategoryArt } from "@/components/category-art";
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
  BookmarkSimple,
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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function PrayerDetail({
  prayer,
  isOwner,
  initialPrayed,
  initialFollowed,
  updates,
}: {
  prayer: PrayerRequest;
  isOwner: boolean;
  initialPrayed: boolean;
  initialFollowed: boolean;
  updates: Update[];
}) {
  const [prayed, setPrayed] = useState(initialPrayed);
  const [followed, setFollowed] = useState(initialFollowed);
  const [count, setCount] = useState(prayer.prayer_count);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [reported, setReported] = useState(false);
  const [thankYouVisible, setThankYouVisible] = useState(false);
  const [showFollowPrompt, setShowFollowPrompt] = useState(false);

  const prayerPoints = parsePrayerPoints(prayer.prayer_points);
  const hasGuidedPrayer = !!prayer.guided_prayer;
  const isExpired = prayer.status === "expired";
  const isAnswered = prayer.status === "answered";
  const titleDuplicatesBody = !!prayer.title && prayer.text.startsWith(prayer.title);

  const primaryCategory = prayer.category[0] ?? "other";
  const primaryStyle = getCategoryStyle(primaryCategory);
  const CategoryArt = getCategoryArt(primaryCategory);
  const verse = useMemo(() => getRandomVerse(primaryCategory), [primaryCategory]);

  const displayName = prayer.display_name_snapshot || (prayer.anonymous ? "Anonymous" : null);

  const heroGradient = isAnswered ? ANSWERED_GRADIENT : primaryStyle.heroGradient;

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
    setTimeout(() => setThankYouVisible(false), 7000);

    // Show follow prompt after praying if not already following
    if (!followed) {
      setShowFollowPrompt(true);
      setTimeout(() => setShowFollowPrompt(false), 6000);
    }

    const result = await recordPrayerTap(prayer.id);
    if (!result.success && !result.alreadyPrayed) {
      setPrayed(false);
      setCount((c) => c - 1);
    }
    setLoading(false);
  }

  function handleBookmark() {
    if (followed) {
      setFollowed(false);
      unfollowPrayer(prayer.id);
    } else {
      setFollowed(true);
      followPrayer(prayer.id);
    }
  }

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const shareData = {
      title: prayer.title || "Someone needs prayer",
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
  }, [prayer.title]);

  return (
    <>
      <Link
        href="/"
        className="text-sm text-stone-400 hover:text-amber-600 transition-colors mb-4 inline-block"
      >
        ← Back to prayers
      </Link>

      {/* ── Hero area with category gradient + illustration ── */}
      <div className={`rounded-t-2xl bg-gradient-to-b ${heroGradient} px-6 pt-8 pb-6 relative overflow-hidden`}>
        {/* Category illustration — subtle background */}
        <div className="absolute top-0 right-0 w-36 h-24 opacity-35 pointer-events-none">
          <CategoryArt className="w-full h-full" />
        </div>
        {/* Subtle halo decoration */}
        <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        {/* Answered badge */}
        {isAnswered && (
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium px-3 py-1 rounded-full bg-amber-100/60 text-amber-700 mb-3">
            Answered
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mb-3">
          {displayName && (
            <>
              <span className="text-stone-500 font-medium">{displayName}</span>
              <span>·</span>
            </>
          )}
          {prayer.category.map((cat, i) => {
            const style = getCategoryStyle(cat);
            const Icon = CATEGORY_ICONS[cat] ?? Sparkle;
            return (
              <span key={cat} className="inline-flex items-center gap-0.5">
                {i > 0 && <span className="mx-0.5">·</span>}
                <Icon size={12} weight="thin" className={style.chipText} />
                <span>{style.label}</span>
              </span>
            );
          })}
          <span>·</span>
          <span>{timeLeft(prayer.expires_at)}</span>
        </div>

        {/* Title */}
        {prayer.title && (
          <h1 className="font-serif text-2xl font-semibold text-gray-900 leading-snug">
            {prayer.title}
          </h1>
        )}
      </div>

      {/* ── Main content card ── */}
      <div className="bg-white/85 backdrop-blur-sm rounded-b-2xl px-6 pt-5 pb-6 shadow-[0_2px_8px_rgba(120,100,70,0.06)]">
        {/* Prayer Points */}
        {prayerPoints.length > 0 && (
          <div className="mb-5">
            <p className="font-serif text-xs text-stone-500 mb-2 flex items-center gap-1">
              <HandsPraying size={12} weight="thin" />
              What to pray for
            </p>
            <ul className="space-y-1.5">
              {prayerPoints.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-[15px] text-gray-700 leading-snug"
                >
                  <span className="text-stone-300 mt-0.5 shrink-0">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Full text */}
        {prayerPoints.length > 0 && !titleDuplicatesBody ? (
          <div className="mb-5">
            {showFullText ? (
              <div>
                <p className="text-xs text-stone-400 mb-2">Full story</p>
                <p className="text-base text-gray-800 leading-relaxed">
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
        ) : prayerPoints.length === 0 ? (
          <p className="text-base text-gray-800 leading-relaxed mb-5">
            {prayer.text}
          </p>
        ) : null}

        {/* Update timeline */}
        {updates.length > 0 && (
          <div className="mb-5 space-y-3">
            <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">Updates</p>
            {updates.map((update) => (
              <div
                key={update.id}
                className={`rounded-xl p-4 ${
                  update.type === "answered"
                    ? "bg-amber-50/50 border border-amber-100/50"
                    : "bg-stone-50/50 border border-stone-100/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium ${
                    update.type === "answered" ? "text-amber-700" : "text-stone-500"
                  }`}>
                    {update.type === "answered" ? "Answered" : "Update"}
                  </span>
                  <span className="text-xs text-stone-400">{timeAgo(update.created_at)}</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{update.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-stone-100 my-5" />

        {/* Prayer count */}
        <div className="flex items-center justify-center mb-5">
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

        {/* Pray button */}
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
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100 active:scale-[0.98] border border-amber-200/60 shadow-sm"
              }
            `}
          >
            <HandsPraying size={20} weight={prayed ? "duotone" : "thin"} />
            {prayed ? "Prayed \u2713" : "Pray"}
          </button>
        )}

        {isExpired && (
          <div className="text-center py-3 text-sm text-stone-400">
            This prayer request has expired.
          </div>
        )}

        {/* Verse card after praying */}
        {thankYouVisible && (
          <div className="mt-5 animate-fade-out">
            <p className="text-xs text-amber-600 text-center mb-3">
              Thank you for praying. They are not alone.
            </p>
            <VerseCard text={verse.text} reference={verse.reference} />
          </div>
        )}

        {/* Follow prompt after praying */}
        {showFollowPrompt && !followed && (
          <div className="mt-4 animate-fade-in">
            <button
              onClick={() => {
                setFollowed(true);
                setShowFollowPrompt(false);
                followPrayer(prayer.id);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-medium bg-stone-50 text-stone-500 hover:bg-amber-50 hover:text-amber-700 transition-colors border border-stone-200/40"
            >
              <BookmarkSimple size={14} weight="thin" />
              Follow this prayer for updates
            </button>
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

        <button
          onClick={handleBookmark}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
        >
          <BookmarkSimple size={16} weight={followed ? "duotone" : "thin"} className={followed ? "text-amber-500" : ""} />
          {followed ? "Following" : "Follow"}
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
      {isOwner && prayer.status !== "answered" && (
        <div className="mt-4 flex gap-3">
          <Link
            href={`/update/${prayer.id}`}
            className="flex-1 block text-center py-2.5 rounded-full text-sm font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
          >
            Share an update
          </Link>
          <Link
            href={`/update/${prayer.id}?type=answered`}
            className="flex-1 block text-center py-2.5 rounded-full text-sm font-medium bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60 transition-colors"
          >
            Mark as answered
          </Link>
        </div>
      )}

      {/* Guided Prayer bottom sheet */}
      {showSheet && prayer.guided_prayer && (
        <GuidedPrayerSheet
          guidedPrayer={prayer.guided_prayer}
          category={primaryCategory}
          requestId={prayer.id}
          onDone={confirmPrayer}
          onClose={() => setShowSheet(false)}
        />
      )}
    </>
  );
}
