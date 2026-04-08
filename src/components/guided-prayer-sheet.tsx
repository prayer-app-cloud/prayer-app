"use client";

import { useEffect, useRef } from "react";

export function GuidedPrayerSheet({
  guidedPrayer,
  onDone,
  onClose,
}: {
  guidedPrayer: string;
  onDone: () => void;
  onClose: () => void;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Prevent body scroll while sheet is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="relative w-full max-w-lg bg-white rounded-t-2xl px-6 pt-6 pb-8 animate-slide-up"
      >
        {/* Handle */}
        <div className="flex justify-center mb-5">
          <div className="w-10 h-1 rounded-full bg-cream-dark" />
        </div>

        {/* Header */}
        <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-2">
          Pause and pray
        </p>
        <p className="text-xs text-warm-gray-light mb-5">
          Words to pray
        </p>

        {/* Prayer text */}
        <div className="bg-cream rounded-xl p-5 mb-6">
          <p className="text-gray-800 text-base leading-relaxed italic">
            {guidedPrayer}
          </p>
        </div>

        {/* Done button */}
        <button
          onClick={onDone}
          className="w-full py-3 rounded-full text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors active:scale-[0.98]"
        >
          Done ✓
        </button>
      </div>
    </div>
  );
}
