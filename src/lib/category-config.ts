export interface CategoryStyle {
  label: string;
  chipBg: string;
  chipText: string;
  borderColor: string;
  bulletColor: string;
  tintBg: string;
}

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  health: {
    label: "Health",
    chipBg: "bg-rose-50/80",
    chipText: "text-rose-600",
    borderColor: "border-l-rose-300",
    bulletColor: "text-rose-400",
    tintBg: "bg-rose-50/30",
  },
  family: {
    label: "Family",
    chipBg: "bg-amber-50/80",
    chipText: "text-amber-600",
    borderColor: "border-l-amber-300",
    bulletColor: "text-amber-400",
    tintBg: "bg-amber-50/30",
  },
  grief: {
    label: "Grief",
    chipBg: "bg-indigo-50/80",
    chipText: "text-indigo-500",
    borderColor: "border-l-indigo-300",
    bulletColor: "text-indigo-400",
    tintBg: "bg-indigo-50/30",
  },
  finances: {
    label: "Finances",
    chipBg: "bg-emerald-50/80",
    chipText: "text-emerald-600",
    borderColor: "border-l-emerald-300",
    bulletColor: "text-emerald-400",
    tintBg: "bg-emerald-50/30",
  },
  inner_struggle: {
    label: "Inner Struggle",
    chipBg: "bg-purple-50/80",
    chipText: "text-purple-500",
    borderColor: "border-l-purple-300",
    bulletColor: "text-purple-400",
    tintBg: "bg-purple-50/30",
  },
  work: {
    label: "Work",
    chipBg: "bg-teal-50/80",
    chipText: "text-teal-600",
    borderColor: "border-l-teal-300",
    bulletColor: "text-teal-400",
    tintBg: "bg-teal-50/30",
  },
  school: {
    label: "School",
    chipBg: "bg-teal-50/80",
    chipText: "text-teal-600",
    borderColor: "border-l-teal-300",
    bulletColor: "text-teal-400",
    tintBg: "bg-teal-50/30",
  },
  work_school: {
    label: "Work & School",
    chipBg: "bg-teal-50/80",
    chipText: "text-teal-600",
    borderColor: "border-l-teal-300",
    bulletColor: "text-teal-400",
    tintBg: "bg-teal-50/30",
  },
  other: {
    label: "Other",
    chipBg: "bg-stone-50/80",
    chipText: "text-stone-500",
    borderColor: "border-l-stone-300",
    bulletColor: "text-stone-400",
    tintBg: "bg-stone-50/30",
  },
};

const DEFAULT_STYLE: CategoryStyle = CATEGORY_STYLES.other;

export function getCategoryStyle(cat: string): CategoryStyle {
  return CATEGORY_STYLES[cat] ?? DEFAULT_STYLE;
}
