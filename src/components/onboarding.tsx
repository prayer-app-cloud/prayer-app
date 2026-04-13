"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Image from "next/image";
import { HandsPraying } from "@phosphor-icons/react";
import { GuidedPrayerSheet } from "@/components/guided-prayer-sheet";
import { recordPrayerTap, quickPostPrayer, fetchOnboardingPrayer } from "@/app/actions";
import { logEvent } from "@/lib/events";
import { generateDisplayName } from "@/lib/display-names";
import { getCategoryStyle, CATEGORY_STYLES } from "@/lib/category-config";
import type { PrayerRequest, CategoryEnum } from "@/lib/types/database";

type Screen = "welcome" | "intent" | "pray" | "post" | "bridge" | "notify";
type Intent = "pray" | "post" | "both";
type PostStep = "text" | "category" | "confirm";

const CATEGORIES: { value: CategoryEnum; label: string }[] = [
  { value: "health", label: "Health" },
  { value: "family", label: "Family" },
  { value: "grief", label: "Grief" },
  { value: "finances", label: "Finances" },
  { value: "inner_struggle", label: "Inner Struggle" },
  { value: "work", label: "Work" },
  { value: "school", label: "School" },
  { value: "other", label: "Other" },
];

function timeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 24) return `${Math.floor(hours / 24)}d left`;
  if (hours >= 1) return `${hours}h left`;
  return `${Math.floor(diff / (1000 * 60))}m left`;
}

export function Onboarding({ onComplete }: { onComplete: (tab: string) => void }) {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [intent, setIntent] = useState<Intent>("pray");
  const [path, setPath] = useState<"pray-first" | "post-first">("pray-first");
  const [didPray, setDidPray] = useState(false);
  const [didPost, setDidPost] = useState(false);
  const sessionIdRef = useRef<string | null>(null);

  // Pray screen state
  const [prayer, setPrayer] = useState<PrayerRequest | null>(null);
  const [prayerLoading, setPrayerLoading] = useState(false);
  const [prayed, setPrayed] = useState(false);
  const [prayCount, setPrayCount] = useState(0);
  const [showSheet, setShowSheet] = useState(false);
  const [showPayoff, setShowPayoff] = useState(false);

  // Post screen state
  const [postStep, setPostStep] = useState<PostStep>("text");
  const [postText, setPostText] = useState("");
  const [postCategories, setPostCategories] = useState<CategoryEnum[]>([]);
  const [postLoading, startPostTransition] = useTransition();
  const [postError, setPostError] = useState<string | null>(null);
  const [postedSlug, setPostedSlug] = useState<string | null>(null);

  // Bridge state
  const [bridgeLoading, setBridgeLoading] = useState(true);

  useEffect(() => {
    logEvent(null, "onboarding_started");
  }, []);

  // Load prayer for pray-first path
  async function loadPrayer() {
    setPrayerLoading(true);
    const p = await fetchOnboardingPrayer();
    setPrayer(p);
    if (p) setPrayCount(p.prayer_count);
    setPrayerLoading(false);
  }

  function goToScreen(s: Screen) {
    setScreen(s);
    if (s === "pray" && !prayer) loadPrayer();
    if (s === "bridge") {
      setBridgeLoading(true);
      setTimeout(() => setBridgeLoading(false), 2000);
    }
  }

  // ── Intent handlers ──
  function chooseIntent(i: Intent) {
    setIntent(i);
    localStorage.setItem("userIntent", i);
    logEvent(null, "onboarding_intent_chosen", { intent: i });

    if (i === "post") {
      setPath("post-first");
      goToScreen("post");
    } else {
      setPath("pray-first");
      goToScreen("pray");
    }
  }

  // ── Pray handler ──
  function handlePrayTap() {
    if (prayed || !prayer) return;
    if (prayer.guided_prayer) {
      setShowSheet(true);
    } else {
      confirmPray();
    }
  }

  async function confirmPray() {
    if (!prayer || prayed) return;
    setShowSheet(false);
    setPrayed(true);
    setPrayCount((c) => c + 1);
    setDidPray(true);

    const totalPrayed = parseInt(localStorage.getItem("totalPrayed") ?? "0", 10) + 1;
    localStorage.setItem("totalPrayed", String(totalPrayed));

    await recordPrayerTap(prayer.id);
    logEvent(null, "onboarding_first_pray");

    // Show payoff
    setShowPayoff(true);
    setTimeout(() => {
      setShowPayoff(false);
      goToScreen("bridge");
    }, 3000);
  }

  // ── Post handler ──
  function handlePost() {
    if (postText.trim().length < 10 || postCategories.length < 1) return;
    setPostError(null);

    startPostTransition(async () => {
      const result = await quickPostPrayer({
        text: postText,
        categories: postCategories,
      });

      if (!result.success) {
        setPostError(result.error ?? "Something went wrong.");
        return;
      }

      setDidPost(true);
      setPostedSlug(result.shareSlug ?? null);

      const totalPosted = parseInt(localStorage.getItem("totalPosted") ?? "0", 10) + 1;
      localStorage.setItem("totalPosted", String(totalPosted));

      logEvent(null, "onboarding_first_post");
      setPostStep("confirm");

      // Auto-advance after 4 seconds
      setTimeout(() => goToScreen("bridge"), 4000);
    });
  }

  // ── Complete onboarding ──
  function completeOnboarding() {
    localStorage.setItem("onboarded", "true");
    localStorage.setItem("sessionCount", "1");

    const name = generateDisplayName();
    localStorage.setItem("displayName", name);

    logEvent(null, "onboarding_completed", { intent });
    onComplete("today");
  }

  async function handleNotificationAllow() {
    try {
      const result = await Notification.requestPermission();
      logEvent(null, result === "granted" ? "notification_opted_in" : "notification_opted_out");
    } catch {
      logEvent(null, "notification_opted_out");
    }
    completeOnboarding();
  }

  function handleNotificationSkip() {
    logEvent(null, "notification_opted_out");
    completeOnboarding();
  }

  // ════════════════════════════════════════════════════════════════
  // SCREEN 1: WELCOME
  // ════════════════════════════════════════════════════════════════
  if (screen === "welcome") {
    return (
      <div className="fixed inset-0 bg-[#FAF8F5] flex flex-col items-center px-6 animate-fade-in z-50">
        <div className="flex-1 flex flex-col items-center justify-center max-w-sm w-full">
          <div className="relative w-full h-[180px] rounded-2xl overflow-hidden mb-8 mt-12">
            <Image
              src="/images/categories/other.png"
              alt="Prayer"
              fill
              className="object-cover"
              priority
            />
          </div>

          <h1 className="font-serif text-2xl font-semibold text-gray-900 text-center">
            A safe place for the prayers you carry alone
          </h1>
          <p className="text-sm text-stone-500 text-center mt-2">
            You don&apos;t have to hold it all together here.
          </p>
          <p className="text-xs text-stone-400 text-center mt-6">
            Moms are praying for each other right now
          </p>

          <button
            onClick={() => goToScreen("intent")}
            className="bg-amber-400 text-amber-900 rounded-full px-8 py-3 text-sm font-semibold shadow-sm w-full max-w-xs mx-auto mt-8 active:scale-[0.97] transition-transform"
          >
            Continue
          </button>
        </div>

        <p className="text-xs text-stone-400 text-center pb-8">
          No account needed. No one sees your name.
        </p>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // SCREEN 2: INTENT SPLIT
  // ════════════════════════════════════════════════════════════════
  if (screen === "intent") {
    const cards = [
      {
        id: "post" as Intent,
        title: "I need prayer",
        sub: "Say the thing you can&apos;t say out loud",
        bg: "bg-rose-50 border-rose-200/60",
      },
      {
        id: "pray" as Intent,
        title: "Pray for someone",
        sub: "Take 30 seconds for a mom who needs it",
        bg: "bg-amber-50 border-amber-200/60",
      },
      {
        id: "both" as Intent,
        title: "Both",
        sub: "Pray for someone, then share your own request",
        bg: "bg-stone-50 border-stone-200/60",
      },
    ];

    return (
      <div className="fixed inset-0 bg-[#FAF8F5] flex flex-col items-center px-6 z-50">
        <h1 className="font-serif text-xl font-semibold text-gray-900 text-center mt-12">
          What brings you here today?
        </h1>

        <div className="flex flex-col gap-3 max-w-sm w-full mt-8">
          {cards.map((card, i) => (
            <button
              key={card.id}
              onClick={() => chooseIntent(card.id)}
              className={`border rounded-2xl p-5 text-left transition-all active:scale-[0.98] ${card.bg} animate-fade-in`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <p className="text-base font-semibold text-gray-900">{card.title}</p>
              <p className="text-sm text-stone-500 mt-1">{card.sub}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // SCREEN 3A: PRAY-FIRST
  // ════════════════════════════════════════════════════════════════
  if (screen === "pray") {
    if (showPayoff) {
      return (
        <div className="fixed inset-0 bg-[#FAF8F5] flex items-center justify-center px-6 z-50">
          <div className="text-center animate-fade-in">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 rounded-full bg-amber-200/20 blur-3xl" />
            </div>
            <p className="font-serif text-lg text-gray-900 relative">
              Thank you for praying. They are not alone.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-[#FAF8F5] overflow-y-auto px-6 z-50">
        <p className="text-sm text-stone-400 text-center mt-6 mb-4">
          Someone needs prayer right now
        </p>

        {prayerLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {prayer && !prayerLoading && (
          <>
            {/* Prayer card with category image banner */}
            <div className="rounded-xl overflow-hidden shadow-sm max-w-sm mx-auto">
              <div className="relative h-[80px] w-full">
                <Image
                  src={getCategoryStyle(prayer.category[0] ?? "other").image}
                  alt={getCategoryStyle(prayer.category[0] ?? "other").label}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="bg-white p-5">
                {/* Meta */}
                <div className="flex items-center gap-1.5 text-xs text-stone-400 mb-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${getCategoryStyle(prayer.category[0] ?? "other").dotColor}`} />
                  <span>{getCategoryStyle(prayer.category[0] ?? "other").label}</span>
                  {prayer.display_name_snapshot && (
                    <>
                      <span>·</span>
                      <span className="text-stone-500 font-medium">{prayer.display_name_snapshot}</span>
                    </>
                  )}
                  <span>·</span>
                  <span>{timeLeft(prayer.expires_at)}</span>
                </div>

                {/* Title */}
                <p className="font-serif text-lg font-semibold text-gray-900 leading-relaxed">
                  {prayer.title || prayer.text.slice(0, 60)}
                </p>

                {/* Body */}
                <p className="text-sm text-stone-600 leading-relaxed mt-1 line-clamp-3">
                  {prayer.text}
                </p>

                {/* Prayer points */}
                {prayer.prayer_points && (() => {
                  try {
                    const points = JSON.parse(prayer.prayer_points);
                    if (Array.isArray(points) && points.length > 0) {
                      return (
                        <div className="mt-3">
                          <p className="text-xs text-stone-400 font-medium">How others can pray</p>
                          <p className="text-xs text-stone-500 italic mt-1">{points[0]}</p>
                        </div>
                      );
                    }
                  } catch { /* ignore */ }
                  return null;
                })()}

                {/* Count */}
                <p className="text-sm text-stone-400 mt-3 tabular-nums">
                  {prayCount} {prayCount === 1 ? "prayer" : "prayers"}
                </p>
              </div>
            </div>

            {/* Pray button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={handlePrayTap}
                disabled={prayed}
                className={`
                  flex items-center gap-2 rounded-full px-10 py-3.5 text-sm font-semibold shadow-md transition-all
                  ${prayed
                    ? "bg-stone-100 text-stone-400 cursor-default"
                    : "bg-amber-400 text-amber-900 active:scale-[0.96]"
                  }
                `}
              >
                <HandsPraying size={18} weight={prayed ? "duotone" : "thin"} />
                {prayed ? "Prayed \u2713" : "Pray"}
              </button>
            </div>
          </>
        )}

        {showSheet && prayer?.guided_prayer && (
          <GuidedPrayerSheet
            guidedPrayer={prayer.guided_prayer}
            category={prayer.category[0] ?? "other"}
            onDone={confirmPray}
            onClose={() => setShowSheet(false)}
          />
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // SCREEN 3B: POST-FIRST
  // ════════════════════════════════════════════════════════════════
  if (screen === "post") {
    if (postStep === "confirm") {
      return (
        <div className="fixed inset-0 bg-[#FAF8F5] flex flex-col items-center justify-center px-6 z-50 animate-fade-in">
          <h1 className="font-serif text-2xl font-semibold text-gray-900 text-center">
            You are heard.
          </h1>
          <p className="text-sm text-stone-500 text-center mt-3">
            Your prayer is live. We&apos;ll let you know when someone prays.
          </p>
          <button
            onClick={() => goToScreen("bridge")}
            className="bg-amber-400 text-amber-900 rounded-full px-8 py-3 text-sm font-semibold mt-6 active:scale-[0.97] transition-transform"
          >
            Continue
          </button>
        </div>
      );
    }

    if (postStep === "category") {
      return (
        <div className="fixed inset-0 bg-[#FAF8F5] overflow-y-auto px-6 z-50 animate-fade-in">
          <div className="max-w-sm mx-auto pt-8">
            <p className="text-sm text-stone-500 mb-3">Choose a category</p>

            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const selected = postCategories.includes(cat.value);
                const atMax = postCategories.length >= 3 && !selected;
                return (
                  <button
                    key={cat.value}
                    disabled={atMax}
                    onClick={() =>
                      setPostCategories((prev) =>
                        selected
                          ? prev.filter((c) => c !== cat.value)
                          : [...prev, cat.value]
                      )
                    }
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all
                      ${selected
                        ? "ring-2 ring-amber-400 bg-amber-50 text-amber-800"
                        : atMax
                          ? "bg-white border border-stone-200/60 text-stone-300 cursor-not-allowed"
                          : "bg-white border border-stone-200/60 text-stone-600"
                      }
                    `}
                  >
                    <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0">
                      <Image
                        src={getCategoryStyle(cat.value).image}
                        alt={cat.label}
                        fill
                        className="object-cover"
                        sizes="24px"
                      />
                    </div>
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {postError && (
              <p className="text-sm text-red-600 mt-3">{postError}</p>
            )}

            <button
              onClick={handlePost}
              disabled={postCategories.length < 1 || postLoading}
              className="bg-amber-400 text-amber-900 rounded-full px-8 py-3 text-sm font-semibold w-full max-w-xs mx-auto mt-6 disabled:opacity-50 active:scale-[0.97] transition-transform block"
            >
              {postLoading ? "Posting..." : "Post prayer"}
            </button>
          </div>
        </div>
      );
    }

    // postStep === "text"
    return (
      <div className="fixed inset-0 bg-[#FAF8F5] overflow-y-auto px-6 z-50">
        <div className="max-w-sm mx-auto">
          <h1 className="font-serif text-xl font-semibold text-gray-900 text-center mt-8">
            You&apos;re safe here
          </h1>
          <p className="text-sm text-stone-500 text-center mt-2 mb-6">
            No account needed. No one will see your name.
          </p>

          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder="Say it here. No one will know it&apos;s you."
            maxLength={500}
            autoFocus
            className="w-full rounded-2xl border border-stone-200 p-4 text-base min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent bg-white"
          />
          <p className="text-xs text-stone-400 text-right mt-1">
            {postText.length}/500
          </p>

          <button
            onClick={() => setPostStep("category")}
            disabled={postText.trim().length < 10}
            className="bg-amber-400 text-amber-900 rounded-full px-8 py-3 text-sm font-semibold w-full max-w-xs mx-auto mt-4 disabled:opacity-50 active:scale-[0.97] transition-transform block"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // SCREEN 4: BRIDGE
  // ════════════════════════════════════════════════════════════════
  if (screen === "bridge") {
    if (bridgeLoading) {
      return (
        <div className="fixed inset-0 bg-[#FAF8F5] flex items-center justify-center z-50">
          <p className="text-sm text-stone-400 text-center">
            Finding prayers that need you
            <span className="inline-flex ml-1">
              <span className="animate-pulse">.</span>
              <span className="animate-pulse" style={{ animationDelay: "200ms" }}>.</span>
              <span className="animate-pulse" style={{ animationDelay: "400ms" }}>.</span>
            </span>
          </p>
        </div>
      );
    }

    if (path === "pray-first") {
      return (
        <div className="fixed inset-0 bg-[#FAF8F5] flex flex-col items-center justify-center px-6 z-50 animate-fade-in">
          <h1 className="font-serif text-xl font-semibold text-gray-900 text-center">
            You prayed for her. Who&apos;s praying for you?
          </h1>
          <p className="text-sm text-stone-500 text-center mt-2">
            You can share anonymously. No one will see your name.
          </p>
          <button
            onClick={() => {
              setPostStep("text");
              goToScreen("post");
            }}
            className="bg-amber-400 text-amber-900 rounded-full px-8 py-3 text-sm font-semibold mt-8 active:scale-[0.97] transition-transform"
          >
            Share a prayer request
          </button>
          <button
            onClick={() => goToScreen("notify")}
            className="text-sm text-stone-500 mt-3 underline"
          >
            Keep praying
          </button>
        </div>
      );
    }

    // post-first bridge
    return (
      <div className="fixed inset-0 bg-[#FAF8F5] flex flex-col items-center justify-center px-6 z-50 animate-fade-in">
        <h1 className="font-serif text-xl font-semibold text-gray-900 text-center">
          A mom just posted something heavy. Want to pray for her?
        </h1>
        <p className="text-sm text-stone-500 text-center mt-2">
          It takes 30 seconds. It matters more than you think.
        </p>
        <button
          onClick={() => goToScreen("pray")}
          className="bg-amber-400 text-amber-900 rounded-full px-8 py-3 text-sm font-semibold mt-8 active:scale-[0.97] transition-transform"
        >
          Pray for someone
        </button>
        <button
          onClick={() => goToScreen("notify")}
          className="text-sm text-stone-500 mt-3 underline"
        >
          Take me to the Prayer Room
        </button>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════
  // SCREEN 5: NOTIFICATION ASK
  // ════════════════════════════════════════════════════════════════
  if (screen === "notify") {
    const headline = (didPost || intent === "post" || intent === "both")
      ? "Get a nudge when someone prays for you"
      : "Get a nudge when a prayer you lifted is answered";

    return (
      <div className="fixed inset-0 bg-[#FAF8F5] flex flex-col items-center justify-center px-6 z-50 animate-fade-in">
        <h1 className="font-serif text-lg font-semibold text-gray-900 text-center">
          {headline}
        </h1>
        <p className="text-sm text-stone-500 text-center mt-2">
          This is how you&apos;ll know it mattered.
        </p>
        <button
          onClick={handleNotificationAllow}
          className="bg-amber-400 text-amber-900 rounded-full px-8 py-3 text-sm font-semibold mt-8 active:scale-[0.97] transition-transform"
        >
          Allow notifications
        </button>
        <button
          onClick={handleNotificationSkip}
          className="text-sm text-stone-500 mt-3 underline"
        >
          Maybe later
        </button>
      </div>
    );
  }

  return null;
}
