"use client";

import { useEffect, useRef, useState } from "react";
import { HandsPraying, PencilSimpleLine } from "@phosphor-icons/react";
import { getCategoryStyle } from "@/lib/category-config";
import { createJournalEntry } from "@/app/actions";

export function GuidedPrayerSheet({
  guidedPrayer,
  category,
  requestId,
  onDone,
  onClose,
}: {
  guidedPrayer: string;
  category?: string;
  requestId?: string;
  onDone: () => void;
  onClose: () => void;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const style = getCategoryStyle(category ?? "other");
  const [showJournalPrompt, setShowJournalPrompt] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [journalSaving, setJournalSaving] = useState(false);
  const [journalSaved, setJournalSaved] = useState(false);

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

  function handleDone() {
    // Show journal prompt first, defer onDone until user saves or skips
    setShowJournalPrompt(true);
  }

  function handleSkipJournal() {
    onDone(); // triggers prayer count increment + closes sheet
  }

  async function saveJournal() {
    if (journalText.trim().length === 0 || journalSaving) return;
    setJournalSaving(true);
    await createJournalEntry(journalText, requestId);
    setJournalSaved(true);
    setJournalSaving(false);
    setTimeout(() => {
      onDone(); // triggers prayer count increment + closes sheet
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop — warm dim */}
      <div
        className="absolute inset-0 bg-stone-900/40 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet — sanctuary overlay */}
      <div
        ref={sheetRef}
        className="relative w-full max-w-lg rounded-t-3xl animate-slide-up-slow overflow-hidden"
      >
        {/* Category gradient tint background */}
        <div className={`absolute inset-0 bg-gradient-to-b ${style.overlayTint} pointer-events-none`} />

        {/* Base background */}
        <div className="relative bg-[#FAF7F2] px-8 pt-8 pb-10">
          {/* Halo decoration */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-amber-200/8 blur-3xl pointer-events-none" />

          {/* Handle */}
          <div className="flex justify-center mb-8">
            <div className="w-10 h-1 rounded-full bg-stone-300/40" />
          </div>

          {!showJournalPrompt ? (
            <>
              {/* Header */}
              <p className="font-serif text-2xl text-gray-800 mb-1 relative">
                Pause and pray
              </p>
              <p className="text-[13px] text-stone-400 mb-8 relative">
                Words to pray
              </p>

              {/* Prayer text — the sacred moment */}
              <div className="bg-white/60 rounded-2xl p-7 mb-8 relative">
                {/* Subtle ring motif */}
                <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full border border-amber-200/15 pointer-events-none" />
                <p className="font-serif text-gray-800 text-lg leading-[1.7] italic relative">
                  {guidedPrayer}
                </p>
              </div>

              {/* Done button */}
              <button
                onClick={handleDone}
                className="w-full py-4 rounded-full text-[15px] font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm relative"
              >
                <HandsPraying size={18} weight="duotone" />
                Done
              </button>

              {/* Subtle close text */}
              <button
                onClick={onClose}
                className="w-full text-center mt-3 text-xs text-stone-400 hover:text-stone-500 transition-colors relative"
              >
                Close
              </button>
            </>
          ) : (
            <>
              {/* Journal prompt — shown after Done */}
              {journalSaved ? (
                <div className="text-center py-8 animate-fade-in">
                  <p className="text-sm text-amber-600">Saved to your journal</p>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <PencilSimpleLine size={16} weight="thin" className="text-stone-400" />
                    <p className="text-sm text-stone-500">Write a note about this prayer</p>
                  </div>
                  <textarea
                    value={journalText}
                    onChange={(e) => setJournalText(e.target.value)}
                    maxLength={500}
                    rows={3}
                    placeholder="What moved you about this prayer?"
                    autoFocus
                    className="w-full rounded-xl border border-stone-200 bg-white/80 px-4 py-3 text-sm text-gray-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 resize-none"
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={saveJournal}
                      disabled={journalText.trim().length === 0 || journalSaving}
                      className="flex-1 py-2.5 rounded-full text-sm font-medium bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60 transition-colors disabled:opacity-50"
                    >
                      {journalSaving ? "Saving..." : "Save to journal"}
                    </button>
                    <button
                      onClick={handleSkipJournal}
                      className="px-5 py-2.5 rounded-full text-sm text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
