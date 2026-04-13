"use client";

interface VerseCardProps {
  text: string;
  reference: string;
  className?: string;
}

export function VerseCard({ text, reference, className = "" }: VerseCardProps) {
  return (
    <div className={`rounded-2xl bg-amber-50/40 border border-amber-100/50 px-6 py-5 ${className}`}>
      <p className="font-serif text-[15px] text-gray-700 leading-relaxed italic">
        &ldquo;{text}&rdquo;
      </p>
      <p className="text-xs text-stone-400 mt-2">
        {reference}
      </p>
    </div>
  );
}
