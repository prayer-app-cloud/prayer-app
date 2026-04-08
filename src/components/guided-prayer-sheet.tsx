"use client";

import { useEffect, useRef } from "react";
import { HandsPraying } from "@phosphor-icons/react";

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

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop — dims slowly */}
      <div
        className="absolute inset-0 bg-black/30 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet — warm ivory, generous space */}
      <div
        ref={sheetRef}
        className="relative w-full max-w-lg bg-stone-50 rounded-t-3xl px-8 pt-8 pb-10 animate-slide-up"
      >
        {/* Handle */}
        <div className="flex justify-center mb-6">
          <div className="w-10 h-1 rounded-full bg-stone-300/60" />
        </div>

        {/* Header */}
        <h2 className="font-serif text-xl text-gray-800 mb-1">
          Pause and pray
        </h2>
        <p className="text-xs text-warm-gray-light mb-6">
          Words to pray
        </p>

        {/* Prayer text — the sacred moment */}
        <div className="bg-amber-50/30 rounded-2xl p-6 mb-8">
          <p className="font-serif text-gray-800 text-lg leading-relaxed italic">
            {guidedPrayer}
          </p>
        </div>

        {/* Done button */}
        <button
          onClick={onDone}
          className="w-full py-3.5 rounded-full text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <HandsPraying size={18} weight="duotone" />
          Done
        </button>
      </div>
    </div>
  );
}
