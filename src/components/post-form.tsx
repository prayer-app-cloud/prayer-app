"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPrayerRequest } from "@/app/actions";
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

export function PostForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [categories, setCategories] = useState<CategoryEnum[]>([]);
  const [anonymous, setAnonymous] = useState(true);
  const [urgency, setUrgency] = useState<UrgencyEnum>("normal");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selfHarm, setSelfHarm] = useState(false);
  const [successSlug, setSuccessSlug] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const charCount = text.length;
  const canSubmit =
    charCount >= MIN_LENGTH &&
    charCount <= MAX_LENGTH &&
    categories.length >= 1 &&
    categories.length <= 3 &&
    consent &&
    !isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || categories.length === 0) return;

    setError(null);
    setSelfHarm(false);

    startTransition(async () => {
      const result = await createPrayerRequest({
        text,
        categories,
        anonymous,
        urgency,
      });

      if (result.selfHarm) {
        setSelfHarm(true);
        return;
      }

      if (!result.success) {
        setError(result.error ?? "Something went wrong.");
        return;
      }

      setSuccessSlug(result.shareSlug ?? null);
    });
  }

  if (successSlug) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🕊️</div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Your prayer is live.
        </h2>
        <p className="text-sm text-warm-gray mb-6">
          We'll let you know when someone prays.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push(`/r/${successSlug}`)}
            className="px-6 py-2.5 rounded-full text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors"
          >
            View your prayer
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2.5 rounded-full text-sm font-medium bg-cream-dark text-gray-700 hover:bg-amber-50 transition-colors"
          >
            Pray for others
          </button>
        </div>
      </div>
    );
  }

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
          placeholder="What do you need prayer for?"
          maxLength={MAX_LENGTH}
          rows={5}
          className="w-full rounded-xl border border-cream-dark bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-warm-gray-light focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent resize-none"
        />
        <div className="flex justify-end mt-1">
          <span
            className={`text-xs tabular-nums ${
              charCount > MAX_LENGTH
                ? "text-red-500"
                : charCount >= MIN_LENGTH
                  ? "text-warm-gray-light"
                  : "text-warm-gray-light"
            }`}
          >
            {charCount}/{MAX_LENGTH}
          </span>
        </div>
      </div>

      {/* Category pills (1-3) */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">Category</p>
        <p className="text-xs text-warm-gray-light mb-2">Choose up to 3</p>
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
                  px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                  ${
                    selected
                      ? "bg-amber-500 text-white"
                      : atMax
                        ? "bg-cream-dark text-gray-400 cursor-not-allowed"
                        : "bg-cream-dark text-gray-600 hover:bg-amber-50 hover:text-amber-700"
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
        {/* Anonymous toggle */}
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

        {/* Urgency toggle */}
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
        {isPending ? "Posting…" : "Post prayer"}
      </button>
    </form>
  );
}
