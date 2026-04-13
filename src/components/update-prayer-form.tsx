"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitPrayerUpdate } from "@/app/actions";
import { HandsPraying, ArrowLeft } from "@phosphor-icons/react";
import type { UpdateTypeEnum } from "@/lib/types/database";

const MAX_LENGTH = 280;

export function UpdatePrayerForm({
  requestId,
  shareSlug,
  title,
  initialType,
}: {
  requestId: string;
  shareSlug: string;
  title: string | null;
  initialType?: UpdateTypeEnum;
}) {
  const router = useRouter();
  const [type, setType] = useState<UpdateTypeEnum>(initialType ?? "update");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charCount = text.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || charCount === 0 || charCount > MAX_LENGTH) return;

    setSubmitting(true);
    setError(null);

    const result = await submitPrayerUpdate({
      requestId,
      type,
      text,
    });

    if (result.success) {
      router.push(`/r/${result.shareSlug ?? shareSlug}`);
    } else {
      setError(result.error ?? "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back link */}
      <button
        type="button"
        onClick={() => router.push(`/r/${shareSlug}`)}
        className="text-sm text-stone-400 hover:text-amber-600 transition-colors inline-flex items-center gap-1"
      >
        <ArrowLeft size={14} weight="thin" />
        Back to prayer
      </button>

      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold text-gray-900 leading-snug">
          Share an update
        </h1>
        {title && (
          <p className="text-sm text-stone-400 mt-1 truncate">{title}</p>
        )}
      </div>

      {/* Type toggle */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          What happened?
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType("update")}
            className={`
              flex-1 py-2.5 rounded-full text-sm font-medium transition-colors
              ${
                type === "update"
                  ? "bg-stone-100 text-stone-700 ring-1 ring-stone-300 shadow-sm"
                  : "bg-stone-50 text-stone-500 hover:bg-stone-100"
              }
            `}
          >
            Still need prayer
          </button>
          <button
            type="button"
            onClick={() => setType("answered")}
            className={`
              flex-1 py-2.5 rounded-full text-sm font-medium transition-colors
              ${
                type === "answered"
                  ? "bg-amber-50 text-amber-800 ring-1 ring-amber-200 shadow-sm"
                  : "bg-stone-50 text-stone-500 hover:bg-stone-100"
              }
            `}
          >
            Prayer answered
          </button>
        </div>
      </div>

      {/* Note textarea */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {type === "answered"
            ? "Share what happened"
            : "What would you like others to know?"}
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_LENGTH + 10}
          rows={4}
          placeholder={
            type === "answered"
              ? "God answered this prayer..."
              : "Here's what's been happening..."
          }
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-base text-gray-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300 resize-none transition-colors"
        />
        <div className="flex justify-end mt-1">
          <span
            className={`text-xs tabular-nums ${
              charCount > MAX_LENGTH ? "text-red-500" : "text-stone-400"
            }`}
          >
            {charCount}/{MAX_LENGTH}
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || charCount === 0 || charCount > MAX_LENGTH}
        className={`
          w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-base font-medium
          transition-all duration-200
          ${
            submitting || charCount === 0 || charCount > MAX_LENGTH
              ? "bg-stone-100 text-stone-400 cursor-not-allowed"
              : type === "answered"
                ? "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60 shadow-sm active:scale-[0.98]"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200/60 shadow-sm active:scale-[0.98]"
          }
        `}
      >
        <HandsPraying size={20} weight="thin" />
        {submitting
          ? "Submitting..."
          : type === "answered"
            ? "Share answered prayer"
            : "Share update"}
      </button>
    </form>
  );
}
