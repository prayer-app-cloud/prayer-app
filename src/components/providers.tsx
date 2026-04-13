"use client";

import { type ReactNode, useEffect, useState } from "react";
import { logEvent } from "@/lib/events";
import { generateDisplayName } from "@/lib/display-names";

function DisplayNamePrompt({ onDismiss }: { onDismiss: () => void }) {
  const [name, setName] = useState("");
  const [customName, setCustomName] = useState("");

  useEffect(() => {
    setName(localStorage.getItem("displayName") ?? generateDisplayName());
    setCustomName(localStorage.getItem("displayName") ?? "");
  }, []);

  function shuffle() {
    const n = generateDisplayName();
    setName(n);
    setCustomName(n);
  }

  function keep() {
    localStorage.setItem("displayName", name);
    localStorage.setItem("displayNamePrompted", "true");
    onDismiss();
  }

  function save() {
    const trimmed = customName.trim();
    if (trimmed.length > 0) {
      localStorage.setItem("displayName", trimmed);
    }
    localStorage.setItem("displayNamePrompted", "true");
    onDismiss();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-stone-900/40 animate-fade-in" onClick={onDismiss} />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl p-6 pt-8 animate-slide-up-slow">
        <div className="flex justify-center mb-6">
          <div className="w-10 h-1 rounded-full bg-stone-200" />
        </div>

        <h2 className="font-serif text-lg font-semibold text-gray-900">
          Choose your display name
        </h2>
        <p className="text-xs text-stone-400 mt-1 mb-4">
          This is how you'll appear when you post prayers.
        </p>

        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            maxLength={30}
            className="flex-1 text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
          <button onClick={shuffle} className="text-xs text-stone-400 hover:text-stone-600 shrink-0">
            Shuffle
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={keep}
            className="flex-1 py-3 rounded-full text-sm font-medium bg-stone-100 text-stone-600"
          >
            Keep &ldquo;{name}&rdquo;
          </button>
          <button
            onClick={save}
            className="flex-1 py-3 rounded-full text-sm font-medium bg-amber-400 text-amber-900"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const [showNamePrompt, setShowNamePrompt] = useState(false);

  useEffect(() => {
    // Increment session count
    const raw = localStorage.getItem("sessionCount");
    const current = parseInt(raw ?? "0", 10);
    const newCount = current + 1;
    localStorage.setItem("sessionCount", String(newCount));

    logEvent(null, "session_started", { sessionCount: newCount });

    // Show display name prompt on session 2
    if (newCount === 2 && localStorage.getItem("displayNamePrompted") !== "true") {
      setTimeout(() => setShowNamePrompt(true), 3000);
    }
  }, []);

  return (
    <>
      {children}
      {showNamePrompt && (
        <DisplayNamePrompt onDismiss={() => setShowNamePrompt(false)} />
      )}
    </>
  );
}
