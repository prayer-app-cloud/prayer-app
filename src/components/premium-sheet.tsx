"use client";

import { useEffect, useState } from "react";
import { X, BookOpen, Star } from "@phosphor-icons/react";
import { PREMIUM_CONFIG, formatPrice } from "@/lib/premium-config";
import { logEvent } from "@/lib/events";

export function PremiumSheet({
  totalPrayed,
  followingCount,
  answeredCount,
  onClose,
}: {
  totalPrayed: number;
  followingCount: number;
  answeredCount: number;
  onClose: () => void;
}) {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    logEvent(null, "premium_preview_seen", {});
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function handleGetAccess() {
    logEvent(null, "premium_preview_tapped", {});
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  }

  function handleDismiss() {
    logEvent(null, "premium_dismissed", {});
    localStorage.setItem("premiumDismissedAt", new Date().toISOString());
    onClose();
  }

  const monthly = formatPrice(PREMIUM_CONFIG.monthlyPriceCents, PREMIUM_CONFIG.currency);
  const yearly = formatPrice(PREMIUM_CONFIG.yearlyPriceCents, PREMIUM_CONFIG.currency);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-stone-900/40 animate-fade-in" onClick={handleDismiss} />

      {/* Sheet */}
      <div className="relative w-full max-w-lg rounded-t-3xl bg-[#FAF7F2] animate-slide-up-slow overflow-hidden">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-stone-300/40" />
        </div>

        <div className="px-8 pt-4 pb-10">
          {/* Close */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-5 p-1 rounded-full text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <h2 className="font-serif text-2xl font-semibold text-gray-900 leading-snug">
            Your prayer life is growing
          </h2>

          {/* Personal stats */}
          <p className="text-sm text-stone-500 mt-3">
            You&apos;ve prayed for {totalPrayed} {totalPrayed === 1 ? "person" : "people"}
            {followingCount > 0 && ` · ${followingCount} prayers followed`}
            {answeredCount > 0 && ` · ${answeredCount} answered`}
          </p>

          {/* Feature cards */}
          <div className="mt-6 space-y-3">
            <div className="bg-white/60 rounded-2xl p-5 border border-stone-100/50">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={18} weight="duotone" className="text-amber-600" />
                <span className="text-sm font-medium text-gray-900">Prayer Journal</span>
              </div>
              <p className="text-sm text-stone-500 leading-relaxed">
                Save prayers and private reflections. A quiet place to remember what moved you.
              </p>
            </div>

            <div className="bg-white/60 rounded-2xl p-5 border border-stone-100/50">
              <div className="flex items-center gap-2 mb-2">
                <Star size={18} weight="duotone" className="text-amber-600" />
                <span className="text-sm font-medium text-gray-900">Answered Timeline</span>
              </div>
              <p className="text-sm text-stone-500 leading-relaxed">
                Revisit the prayers that changed. See answers unfold over time.
              </p>
            </div>
          </div>

          {/* Pricing note */}
          <p className="text-xs text-stone-400 text-center mt-5">
            {monthly}/month or {yearly}/year
          </p>

          {/* CTA */}
          <button
            onClick={handleGetAccess}
            className="w-full mt-4 py-3.5 rounded-full text-[15px] font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors active:scale-[0.98] shadow-sm"
          >
            Get early access
          </button>

          {/* Toast */}
          {showToast && (
            <p className="text-sm text-amber-600 text-center mt-3 animate-fade-in">
              You&apos;re on the list — we&apos;ll let you know when it&apos;s ready
            </p>
          )}

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="w-full text-center mt-3 text-xs text-stone-400 hover:text-stone-500 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

/** Check if premium sheet should show based on engagement + cooldown */
export function shouldShowPremium(): boolean {
  if (typeof window === "undefined") return false;

  // Already premium
  if (localStorage.getItem("premiumActive") === "true") return false;

  // Engagement thresholds
  const totalPrayed = parseInt(localStorage.getItem("totalPrayed") ?? "0", 10);
  const totalPosted = parseInt(localStorage.getItem("totalPosted") ?? "0", 10);
  const sessionCount = parseInt(localStorage.getItem("sessionCount") ?? "1", 10);

  const { engagementThresholds } = PREMIUM_CONFIG;
  const meetsEngagement =
    (totalPrayed >= engagementThresholds.minPrayers || totalPosted >= engagementThresholds.minPosted) &&
    sessionCount >= engagementThresholds.minSessions;

  if (!meetsEngagement) return false;

  // Cooldown check
  const dismissedAt = localStorage.getItem("premiumDismissedAt");
  if (dismissedAt) {
    const elapsed = Date.now() - Date.parse(dismissedAt);
    if (elapsed < PREMIUM_CONFIG.dismissCooldownMs) return false;
  }

  return true;
}

/** Check if user meets engagement but not premium — for soft message */
export function meetsEngagementForPremium(): boolean {
  if (typeof window === "undefined") return false;
  if (localStorage.getItem("premiumActive") === "true") return true;

  const totalPrayed = parseInt(localStorage.getItem("totalPrayed") ?? "0", 10);
  const totalPosted = parseInt(localStorage.getItem("totalPosted") ?? "0", 10);
  const sessionCount = parseInt(localStorage.getItem("sessionCount") ?? "1", 10);

  const { engagementThresholds } = PREMIUM_CONFIG;
  return (
    (totalPrayed >= engagementThresholds.minPrayers || totalPosted >= engagementThresholds.minPosted) &&
    sessionCount >= engagementThresholds.minSessions
  );
}
