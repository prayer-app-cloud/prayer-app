"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HandsPraying, BookmarkSimple, CheckCircle } from "@phosphor-icons/react";
import { GuidedPrayerSheet } from "@/components/guided-prayer-sheet";
import { recordPrayerTap, fetchDailyPrayer } from "@/app/actions";
import { logEvent } from "@/lib/events";
import { getCategoryStyle, ANSWERED_GRADIENT } from "@/lib/category-config";
import { getRandomVerse } from "@/lib/verses";
import { VerseCard } from "@/components/verse-card";
import type { PrayerRequest } from "@/lib/types/database";

function timeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 24) return `${Math.floor(hours / 24)}d left`;
  if (hours >= 1) return `${hours}h left`;
  return `${Math.floor(diff / (1000 * 60))}m left`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function TodayTab({
  featuredPrayer,
  initialPrayed,
  myActivePrayers,
  dailyPrayer: initialDailyPrayer,
  dailyPrayerPrayed: initialDailyPrayed,
  followedWithUpdates,
  recentAnswered,
  onSwitchTab,
}: {
  featuredPrayer: PrayerRequest | null;
  initialPrayed: boolean;
  myActivePrayers: PrayerRequest[];
  dailyPrayer: PrayerRequest | null;
  dailyPrayerPrayed: boolean;
  followedWithUpdates: PrayerRequest[];
  recentAnswered: PrayerRequest | null;
  onSwitchTab: (tab: "today" | "room" | "me") => void;
}) {
  const router = useRouter();

  // Daily prayer state
  const [dailyPrayer, setDailyPrayer] = useState(initialDailyPrayer);
  const [dailyPrayed, setDailyPrayed] = useState(initialDailyPrayed);
  const [dailyCount, setDailyCount] = useState(initialDailyPrayer?.prayer_count ?? 0);
  const [dailyAnimating, setDailyAnimating] = useState(false);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailySheet, setDailySheet] = useState(false);
  const [dailyThankYou, setDailyThankYou] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);

  const dailyCategory = dailyPrayer?.category[0] ?? "other";
  const dailyStyle = getCategoryStyle(dailyCategory);
  const dailyVerse = useMemo(() => getRandomVerse(dailyCategory), [dailyCategory]);
  const dailyDisplayName = dailyPrayer?.display_name_snapshot || "Anonymous";

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // Most recent active prayer for "Your prayer" module
  const myPrayer = myActivePrayers[0] ?? null;

  function handleDailyPrayClick() {
    if (dailyPrayed || dailyLoading || !dailyPrayer) return;
    if (dailyPrayer.guided_prayer) setDailySheet(true);
    else confirmDailyPray();
  }

  async function confirmDailyPray() {
    if (!dailyPrayer || dailyPrayed || dailyLoading) return;
    setDailySheet(false);
    setDailyLoading(true);
    setDailyPrayed(true);
    setDailyCount((c) => c + 1);
    setDailyAnimating(true);
    setTimeout(() => setDailyAnimating(false), 700);
    setDailyThankYou(true);

    const totalPrayed = parseInt(localStorage.getItem("totalPrayed") ?? "0", 10) + 1;
    localStorage.setItem("totalPrayed", String(totalPrayed));

    const result = await recordPrayerTap(dailyPrayer.id);
    if (!result.success && !result.alreadyPrayed) {
      setDailyPrayed(false);
      setDailyCount((c) => c - 1);
    }
    logEvent(null, "pray_tapped", { request_id: dailyPrayer.id });
    setDailyLoading(false);
  }

  async function loadNextPrayer() {
    setLoadingNext(true);
    setDailyThankYou(false);
    const excludeIds = dailyPrayer ? [dailyPrayer.id] : [];
    if (featuredPrayer) excludeIds.push(featuredPrayer.id);
    const next = await fetchDailyPrayer(excludeIds);
    if (next) {
      setDailyPrayer(next);
      setDailyPrayed(false);
      setDailyCount(next.prayer_count);
    }
    setLoadingNext(false);
  }

  return (
    <div className="px-5 pb-24">
      {/* A. Header */}
      <h1 className="font-serif text-xl font-semibold text-gray-900">Today</h1>
      <p className="text-xs text-stone-400 mt-1">{dateStr}</p>
      <p className="text-sm text-stone-500 mt-2">You don&apos;t have to carry it alone today.</p>

      {/* B. Hero image */}
      <div className="relative w-full h-[100px] rounded-xl overflow-hidden mt-5">
        <Image
          src="/images/categories/other.png"
          alt="Prayer"
          fill
          className="object-cover"
        />
      </div>

      {/* C. "Your prayer" module */}
      <div className="mt-6">
        {myPrayer ? (
          <div
            onClick={() => router.push(`/r/${myPrayer.share_slug}`)}
            className="bg-white rounded-2xl shadow-sm p-5 cursor-pointer hover:bg-stone-50/30 transition-colors"
          >
            <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-2">Your prayer</p>
            <p className="font-serif text-base font-semibold text-gray-900 leading-relaxed">
              {myPrayer.title || myPrayer.text.slice(0, 60)}
            </p>
            <p className="text-sm text-stone-500 mt-2">
              {myPrayer.prayer_count} {myPrayer.prayer_count === 1 ? "person" : "people"} prayed for you
            </p>
            <div className="flex gap-2 mt-3">
              <Link
                href={`/update/${myPrayer.id}`}
                onClick={(e) => e.stopPropagation()}
                className="px-4 py-2 rounded-full text-xs font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
              >
                Share an update
              </Link>
              <Link
                href={`/update/${myPrayer.id}?type=answered`}
                onClick={(e) => e.stopPropagation()}
                className="px-4 py-2 rounded-full text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
              >
                Mark as answered
              </Link>
            </div>
          </div>
        ) : (
          <Link
            href="/post"
            className="block bg-white rounded-2xl shadow-sm p-5 text-center hover:bg-stone-50/30 transition-colors"
          >
            <p className="text-sm font-medium text-gray-800">Need prayer?</p>
            <p className="text-xs text-stone-400 mt-1">Share what&apos;s on your heart</p>
          </Link>
        )}
      </div>

      {/* D. "Pray for someone" module */}
      {dailyPrayer && (
        <div className="mt-6">
          <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-3">Pray for someone</p>

          {dailyThankYou ? (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="text-center">
                <p className="text-sm text-amber-600 mb-3">
                  Thank you for praying. They are not alone.
                </p>
                <VerseCard text={dailyVerse.text} reference={dailyVerse.reference} />
                <button
                  onClick={loadNextPrayer}
                  disabled={loadingNext}
                  className="mt-4 px-5 py-2 rounded-full text-sm font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                >
                  {loadingNext ? "Loading..." : "Pray for another"}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div
                onClick={() => router.push(`/r/${dailyPrayer.share_slug}`)}
                className="p-5 pb-3 cursor-pointer hover:bg-stone-50/30 transition-colors"
              >
                <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${dailyStyle.dotColor}`} />
                  <span className={dailyStyle.chipText}>{dailyStyle.label}</span>
                  <span>·</span>
                  <span className="text-stone-500 font-medium">{dailyDisplayName}</span>
                  <span>·</span>
                  <span>{timeLeft(dailyPrayer.expires_at)}</span>
                </div>
                <p className="font-serif text-lg font-semibold text-gray-900 leading-relaxed mb-1">
                  {dailyPrayer.title || dailyPrayer.text.slice(0, 60)}
                </p>
                <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">
                  {dailyPrayer.text}
                </p>
              </div>

              <div className="flex items-center gap-3 px-5 pb-4 pt-2">
                <button
                  onClick={handleDailyPrayClick}
                  disabled={dailyPrayed}
                  className={`
                    flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all
                    ${dailyPrayed
                      ? "bg-stone-100 text-stone-400 cursor-default"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 shadow-sm active:scale-[0.96]"
                    }
                  `}
                >
                  <HandsPraying size={16} weight={dailyPrayed ? "duotone" : "thin"} />
                  {dailyPrayed ? "Prayed \u2713" : "Pray"}
                </button>
                <span className={`text-sm tabular-nums transition-all duration-300 ${dailyAnimating ? "text-amber-500 scale-110" : "text-stone-400"}`}>
                  {dailyCount} {dailyCount === 1 ? "prayer" : "prayers"}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* E. "Followed prayers" module */}
      {followedWithUpdates.length > 0 && (
        <div className="mt-6">
          <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-3">Prayers you&apos;re following</p>
          <div className="space-y-3">
            {followedWithUpdates.map((prayer) => {
              const isAnswered = prayer.status === "answered";
              const catStyle = getCategoryStyle(prayer.category[0] ?? "other");
              return (
                <div
                  key={prayer.id}
                  onClick={() => router.push(`/r/${prayer.share_slug}`)}
                  className={`rounded-2xl shadow-sm p-4 cursor-pointer hover:bg-stone-50/30 transition-colors ${
                    isAnswered ? "bg-amber-50/30 border-l-2 border-amber-300" : "bg-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-1">
                    <span className={`w-2 h-2 rounded-full ${catStyle.dotColor}`} />
                    <span className={catStyle.chipText}>{catStyle.label}</span>
                    {isAnswered && (
                      <span className="inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 ml-1">
                        Answered
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{prayer.title || prayer.text.slice(0, 50)}</p>
                  {prayer.update_text && (
                    <p className="text-xs text-stone-500 italic mt-1 truncate">
                      {isAnswered ? "\u2713 " : ""}{prayer.update_text}
                    </p>
                  )}
                  <p className="text-xs text-stone-400 mt-1">
                    {prayer.prayer_count} {prayer.prayer_count === 1 ? "prayer" : "prayers"} · Updated {timeAgo(prayer.updated_at)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* F. "Answered prayers" teaser */}
      {recentAnswered && (
        <div className="mt-6">
          <p className="text-xs text-stone-400 uppercase tracking-wide font-medium mb-3">Answered prayer</p>
          <div
            onClick={() => router.push(`/r/${recentAnswered.share_slug}`)}
            className={`rounded-2xl shadow-sm p-5 cursor-pointer hover:bg-amber-50/40 transition-colors bg-gradient-to-br ${ANSWERED_GRADIENT} border border-amber-100/40`}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle size={14} weight="duotone" className="text-amber-600" />
              <span className="text-[10px] font-medium text-amber-700 uppercase tracking-wide">Answered</span>
            </div>
            <p className="font-serif text-base font-semibold text-gray-900 leading-relaxed">
              {recentAnswered.title || recentAnswered.text.slice(0, 60)}
            </p>
            {recentAnswered.update_text && (
              <p className="text-sm text-stone-600 mt-2 italic leading-relaxed">
                &ldquo;{recentAnswered.update_text}&rdquo;
              </p>
            )}
            <p className="text-xs text-stone-400 mt-2">
              {recentAnswered.prayer_count} people prayed
            </p>
          </div>
        </div>
      )}

      {/* Navigate to Prayer Room */}
      <div className="mt-8 text-center">
        <button
          onClick={() => onSwitchTab("room")}
          className="text-sm text-amber-600 font-medium"
        >
          See all prayers →
        </button>
      </div>

      {/* Guided prayer sheet */}
      {dailySheet && dailyPrayer?.guided_prayer && (
        <GuidedPrayerSheet
          guidedPrayer={dailyPrayer.guided_prayer}
          category={dailyCategory}
          requestId={dailyPrayer.id}
          onDone={confirmDailyPray}
          onClose={() => setDailySheet(false)}
        />
      )}
    </div>
  );
}
