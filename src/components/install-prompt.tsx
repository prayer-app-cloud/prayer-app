"use client";

import { useState, useEffect } from "react";
import { X } from "@phosphor-icons/react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function shouldShow(): boolean {
  const sessionCount = parseInt(localStorage.getItem("sessionCount") ?? "0", 10);
  const totalPrayed = parseInt(localStorage.getItem("totalPrayed") ?? "0", 10);
  const dismissed = localStorage.getItem("installDismissed") === "true";
  return !dismissed && sessionCount >= 2 && totalPrayed >= 1;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    setEligible(shouldShow());

    function handlePrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handlePrompt);
    return () => window.removeEventListener("beforeinstallprompt", handlePrompt);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    handleDismiss();
  }

  function handleDismiss() {
    setDismissed(true);
    setDeferredPrompt(null);
    localStorage.setItem("installDismissed", "true");
  }

  if (!deferredPrompt || dismissed || !eligible) return null;

  return (
    <div className="fixed bottom-16 left-4 right-4 max-w-lg mx-auto z-40 animate-fade-in">
      <div className="rounded-2xl bg-white border border-stone-200 shadow-lg px-5 py-4 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">Add Prayer to your home screen</p>
          <p className="text-xs text-stone-400 mt-0.5">Quick access anytime.</p>
        </div>
        <button
          onClick={handleInstall}
          className="px-4 py-2 rounded-full text-sm font-medium bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60 transition-colors shrink-0"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="text-stone-300 hover:text-stone-500 transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X size={18} weight="bold" />
        </button>
      </div>
    </div>
  );
}
