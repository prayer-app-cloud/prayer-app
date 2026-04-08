import type { CategoryEnum } from "@/lib/types/database";

export interface CategoryStyle {
  label: string;
  chipBg: string;
  chipText: string;
  borderColor: string;
  bulletColor: string;
}

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  health: {
    label: "Health",
    chipBg: "bg-rose-50",
    chipText: "text-rose-600",
    borderColor: "border-l-rose-300",
    bulletColor: "text-rose-400",
  },
  family: {
    label: "Family",
    chipBg: "bg-amber-50",
    chipText: "text-amber-600",
    borderColor: "border-l-amber-300",
    bulletColor: "text-amber-400",
  },
  grief: {
    label: "Grief",
    chipBg: "bg-blue-50",
    chipText: "text-blue-600",
    borderColor: "border-l-blue-300",
    bulletColor: "text-blue-400",
  },
  finances: {
    label: "Finances",
    chipBg: "bg-emerald-50",
    chipText: "text-emerald-600",
    borderColor: "border-l-emerald-300",
    bulletColor: "text-emerald-400",
  },
  inner_struggle: {
    label: "Inner Struggle",
    chipBg: "bg-purple-50",
    chipText: "text-purple-600",
    borderColor: "border-l-purple-300",
    bulletColor: "text-purple-400",
  },
  work: {
    label: "Work",
    chipBg: "bg-teal-50",
    chipText: "text-teal-600",
    borderColor: "border-l-teal-300",
    bulletColor: "text-teal-400",
  },
  school: {
    label: "School",
    chipBg: "bg-teal-50",
    chipText: "text-teal-600",
    borderColor: "border-l-teal-300",
    bulletColor: "text-teal-400",
  },
  work_school: {
    label: "Work & School",
    chipBg: "bg-teal-50",
    chipText: "text-teal-600",
    borderColor: "border-l-teal-300",
    bulletColor: "text-teal-400",
  },
  other: {
    label: "Other",
    chipBg: "bg-stone-50",
    chipText: "text-stone-600",
    borderColor: "border-l-stone-300",
    bulletColor: "text-stone-400",
  },
};

const DEFAULT_STYLE: CategoryStyle = CATEGORY_STYLES.other;

export function getCategoryStyle(cat: string): CategoryStyle {
  return CATEGORY_STYLES[cat] ?? DEFAULT_STYLE;
}

// Icon name mapping — resolved to Lucide component names
export const CATEGORY_ICON_NAME: Record<string, string> = {
  health: "Heart",
  family: "Users",
  grief: "CloudRain",
  finances: "Wallet",
  inner_struggle: "Brain",
  work: "Briefcase",
  school: "Briefcase",
  work_school: "Briefcase",
  other: "Sparkles",
};
