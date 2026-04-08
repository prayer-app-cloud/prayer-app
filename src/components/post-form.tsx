"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { validatePrayerRequest, publishPrayerRequest } from "@/app/actions";
import type { CategoryEnum, UrgencyEnum } from "@/lib/types/database";

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

const MIN_LENGTH = 10;
const MAX_LENGTH = 500;

type Step = "form" | "approval" | "success";

export function PostForm() {
  const router = useRouter();

  // Form state
  const [text, setText] = useState("");
  const [categories, setCategories] = useState<CategoryEnum[]>([]);
  const [anonymous, setAnonymous] = useState(true);
  const [urgency, setUrgency] = useState<UrgencyEnum>("normal");
  const [consent, setConsent] = useState(false);

  // Flow state
  const [step, setStep] = useState<Step>("form");
  const [error, setError] = useState<string | null>(null);
  const [selfHarm, setSelfHarm] = useState(false);
  const [isPending, startTransition] = useTransition();

  // AI-generated content (editable)
  const [prayerPoints, setPrayerPoints] = useState<string[]>([]);
  const [guidedPrayer, setGuidedPrayer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Success state
  const [successSlug, setSuccessSlug] = useState<string | null>(null);

  const charCount = text.length;
  const canSubmit =
    charCount >= MIN_LENGTH &&
    charCount <= MAX_LENGTH &&
    categories.length >= 1 &&
    categories.length <= 3 &&
    consent &&
    !isPending;

  // ── Step 1: Validate and call AI ─────────────────────────────
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setError(null);
    setSelfHarm(false);

    startTransition(async () => {
      // Server-side validation
      const validation = await validatePrayerRequest({
        text,
        categories,
      });

      if (validation.selfHarm) {
        setSelfHarm(true);
        return;
      }

      if (!validation.valid) {
        setError(validation.error ?? "Something went wrong.");
        return;
      }

      // Call AI endpoint
      setAiLoading(true);
      try {
        const res = await fetch("/api/generate-prayer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            category: categories[0],
          }),
        });

        const aiData = await res.json();

        if (aiData && aiData.prayer_points && aiData.guided_prayer) {
          setPrayerPoints(aiData.prayer_points);
          setGuidedPrayer(aiData.guided_prayer);
        } else {
          // AI failed — will publish without Prayer Points
          setPrayerPoints([]);
          setGuidedPrayer(null);
        }
      } catch {
        // AI failed gracefully
        setPrayerPoints([]);
        setGuidedPrayer(null);
      }
      setAiLoading(false);
      setStep("approval");
    });
  }

  // ── Step 2: Publish with approved content ────────────────────
  function handlePublish() {
    startTransition(async () => {
      const result = await publishPrayerRequest({
        text,
        categories,
        anonymous,
        urgency,
        prayerPoints: prayerPoints.length > 0 ? prayerPoints : null,
        guidedPrayer,
      });

      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        setStep("form");
        return;
      }

      setSuccessSlug(result.shareSlug ?? null);
      setStep("success");
    });
  }

  // ── Edit a prayer point ──────────────────────────────────────
  function updatePoint(index: number, value: string) {
    setPrayerPoints((prev) => prev.map((p, i) => (i === index ? value : p)));
  }

  function removePoint(index: number) {
    setPrayerPoints((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Success screen ───────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🕊️</div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          You are heard
        </h2>
        <p className="text-sm text-warm-gray mb-1">
          Your request is now live. Others can begin praying for you.
        </p>
        <p className="text-xs text-warm-gray-light mb-6">
          You&apos;re not carrying this alone.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push(`/r/${successSlug}`)}
            className="px-6 py-2.5 rounded-full text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors"
          >
            View my request
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 rounded-full text-sm font-medium bg-cream-dark text-gray-700 hover:bg-amber-50 transition-colors"
          >
            Back to Prayer Room
          </button>
        </div>
      </div>
    );
  }

  // ── Approval screen ──────────────────────────────────────────
  if (step === "approval") {
    return (
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {prayerPoints.length > 0 ? (
          <>
            <div>
              <h2 className="text-sm font-medium text-gray-700 mb-1">
                How others can pray
              </h2>
              <p className="text-xs text-warm-gray-light mb-3">
                Make sure this feels true to you.
              </p>
              <div className="space-y-2">
                {prayerPoints.map((point, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-amber-500 text-sm">•</span>
                    <input
                      type="text"
                      value={point}
                      onChange={(e) => updatePoint(i, e.target.value)}
                      className="flex-1 text-sm text-gray-800 bg-white border border-cream-dark rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-300"
                    />
                    <button
                      type="button"
                      onClick={() => removePoint(i)}
                      className="text-warm-gray-light hover:text-red-400 text-sm px-1"
                      aria-label="Remove point"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {guidedPrayer && (
              <div>
                <h2 className="text-sm font-medium text-gray-700 mb-1">
                  Words to Pray
                </h2>
                <p className="text-xs text-warm-gray-light mb-3">
                  This is what someone will read when they pray for you.
                </p>
                <div className="bg-amber-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed italic">
                  {guidedPrayer}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
            Prayer Points couldn't be generated. Your prayer will be
            published with the original text.
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep("form")}
            className="flex-1 py-3 rounded-full text-sm font-medium bg-cream-dark text-gray-700 hover:bg-amber-50 transition-colors"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPending}
            className="flex-1 py-3 rounded-full text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-40 active:scale-[0.98]"
          >
            {isPending ? "Publishing…" : "Looks good"}
          </button>
        </div>
      </div>
    );
  }

  // ── Form screen ──────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Self-harm resources */}
      {selfHarm && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-900">
          <p className="font-medium mb-2">You are not alone.</p>
          <p className="mb-3">
            If you or someone you know is struggling, please reach out:
          </p>
          <ul className="space-y-1">
            <li>
              <strong>988 Suicide & Crisis Lifeline:</strong> Call or text{" "}
              <strong>988</strong>
            </li>
            <li>
              <strong>Crisis Text Line:</strong> Text <strong>HOME</strong> to{" "}
              <strong>741741</strong>
            </li>
          </ul>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Text input */}
      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What would you like prayer for?"
          maxLength={MAX_LENGTH}
          rows={5}
          className="w-full rounded-xl border border-cream-dark bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-warm-gray-light focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent resize-none"
        />
        <div className="flex justify-end mt-1">
          <span
            className={`text-xs tabular-nums ${
              charCount > MAX_LENGTH ? "text-red-500" : "text-warm-gray-light"
            }`}
          >
            {charCount}/{MAX_LENGTH}
          </span>
        </div>
      </div>

      {/* Category pills (1-3) */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">Choose 1–3 areas</p>
        <p className="text-xs text-warm-gray-light mb-2">What best describes this prayer?</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const selected = categories.includes(cat.value);
            const atMax = categories.length >= 3 && !selected;
            return (
              <button
                key={cat.value}
                type="button"
                disabled={atMax}
                onClick={() =>
                  setCategories((prev) =>
                    selected
                      ? prev.filter((c) => c !== cat.value)
                      : [...prev, cat.value]
                  )
                }
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${
                    selected
                      ? "bg-amber-400 text-amber-900 shadow-sm"
                      : atMax
                        ? "bg-cream-dark text-gray-400 cursor-not-allowed"
                        : "bg-amber-50/60 text-gray-600 hover:bg-amber-100 hover:text-amber-700"
                  }
                `}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-700">Post anonymously</span>
          <button
            type="button"
            role="switch"
            aria-checked={anonymous}
            onClick={() => setAnonymous(!anonymous)}
            className={`
              relative w-10 h-6 rounded-full transition-colors
              ${anonymous ? "bg-amber-500" : "bg-cream-dark"}
            `}
          >
            <span
              className={`
                absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
                ${anonymous ? "translate-x-4" : "translate-x-0"}
              `}
            />
          </button>
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-gray-700">Urgent request</span>
          <button
            type="button"
            role="switch"
            aria-checked={urgency === "high"}
            onClick={() =>
              setUrgency(urgency === "normal" ? "high" : "normal")
            }
            className={`
              relative w-10 h-6 rounded-full transition-colors
              ${urgency === "high" ? "bg-amber-500" : "bg-cream-dark"}
            `}
          >
            <span
              className={`
                absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
                ${urgency === "high" ? "translate-x-4" : "translate-x-0"}
              `}
            />
          </button>
        </label>
      </div>

      {/* Consent */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-300"
        />
        <span className="text-xs text-warm-gray leading-relaxed">
          I understand this prayer will be shared anonymously with others who
          want to pray. No personal information will be displayed.
        </span>
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-3 rounded-full text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {isPending
          ? aiLoading
            ? "Making this easier for others to pray for..."
            : "Checking…"
          : "Post prayer"}
      </button>
    </form>
  );
}
