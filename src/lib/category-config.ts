export interface CategoryStyle {
  label: string;
  chipBg: string;
  chipText: string;
  borderColor: string;
  bulletColor: string;
  tintBg: string;
  /** 8px colored dot for feed cards */
  dotColor: string;
  /** Filter pill colors (active state) */
  filterBg: string;
  filterText: string;
  filterBorder: string;
  /** Category tile image path */
  image: string;
  /** Gradient for detail page hero area */
  heroGradient: string;
  /** Tint for guided prayer overlay background */
  overlayTint: string;
}

export const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  health: {
    label: "Health",
    chipBg: "bg-emerald-50/80",
    chipText: "text-emerald-600",
    borderColor: "border-l-emerald-400",
    bulletColor: "text-emerald-400",
    tintBg: "bg-emerald-50/30",
    dotColor: "bg-emerald-500",
    filterBg: "bg-emerald-50",
    filterText: "text-emerald-700",
    filterBorder: "border-emerald-200",
    image: "/images/categories/health.png",
    heroGradient: "from-emerald-50/60 via-amber-50/30 to-cream",
    overlayTint: "from-emerald-50/20 to-transparent",
  },
  family: {
    label: "Marriage & Family",
    chipBg: "bg-sky-50/80",
    chipText: "text-sky-600",
    borderColor: "border-l-sky-400",
    bulletColor: "text-sky-400",
    tintBg: "bg-sky-50/30",
    dotColor: "bg-sky-500",
    filterBg: "bg-sky-50",
    filterText: "text-sky-700",
    filterBorder: "border-sky-200",
    image: "/images/categories/family.png",
    heroGradient: "from-sky-50/60 via-amber-50/30 to-cream",
    overlayTint: "from-sky-50/20 to-transparent",
  },
  grief: {
    label: "Grief & Loss",
    chipBg: "bg-violet-50/80",
    chipText: "text-violet-500",
    borderColor: "border-l-violet-400",
    bulletColor: "text-violet-400",
    tintBg: "bg-violet-50/30",
    dotColor: "bg-violet-500",
    filterBg: "bg-violet-50",
    filterText: "text-violet-700",
    filterBorder: "border-violet-200",
    image: "/images/categories/grief.png",
    heroGradient: "from-violet-50/60 via-slate-50/30 to-cream",
    overlayTint: "from-violet-50/20 to-transparent",
  },
  finances: {
    label: "Money",
    chipBg: "bg-amber-50/80",
    chipText: "text-amber-600",
    borderColor: "border-l-amber-400",
    bulletColor: "text-amber-400",
    tintBg: "bg-amber-50/30",
    dotColor: "bg-amber-500",
    filterBg: "bg-amber-50",
    filterText: "text-amber-700",
    filterBorder: "border-amber-200",
    image: "/images/categories/finances.png",
    heroGradient: "from-amber-50/70 via-orange-50/30 to-cream",
    overlayTint: "from-amber-50/15 to-transparent",
  },
  inner_struggle: {
    label: "Overwhelm",
    chipBg: "bg-rose-50/80",
    chipText: "text-rose-500",
    borderColor: "border-l-rose-400",
    bulletColor: "text-rose-400",
    tintBg: "bg-rose-50/30",
    dotColor: "bg-rose-500",
    filterBg: "bg-rose-50",
    filterText: "text-rose-700",
    filterBorder: "border-rose-200",
    image: "/images/categories/inner_struggle.png",
    heroGradient: "from-rose-50/50 via-pink-50/30 to-cream",
    overlayTint: "from-rose-50/15 to-transparent",
  },
  work: {
    label: "Work",
    chipBg: "bg-slate-50/80",
    chipText: "text-slate-600",
    borderColor: "border-l-slate-400",
    bulletColor: "text-slate-400",
    tintBg: "bg-slate-50/30",
    dotColor: "bg-slate-500",
    filterBg: "bg-slate-50",
    filterText: "text-slate-700",
    filterBorder: "border-slate-200",
    image: "/images/categories/work.png",
    heroGradient: "from-slate-50/50 via-stone-50/30 to-cream",
    overlayTint: "from-slate-50/15 to-transparent",
  },
  school: {
    label: "Kids & School",
    chipBg: "bg-indigo-50/80",
    chipText: "text-indigo-500",
    borderColor: "border-l-indigo-400",
    bulletColor: "text-indigo-400",
    tintBg: "bg-indigo-50/30",
    dotColor: "bg-indigo-500",
    filterBg: "bg-indigo-50",
    filterText: "text-indigo-700",
    filterBorder: "border-indigo-200",
    image: "/images/categories/school.png",
    heroGradient: "from-indigo-50/50 via-blue-50/30 to-cream",
    overlayTint: "from-indigo-50/20 to-transparent",
  },
  work_school: {
    label: "Work & Kids",
    chipBg: "bg-slate-50/80",
    chipText: "text-slate-600",
    borderColor: "border-l-slate-400",
    bulletColor: "text-slate-400",
    tintBg: "bg-slate-50/30",
    dotColor: "bg-slate-500",
    filterBg: "bg-slate-50",
    filterText: "text-slate-700",
    filterBorder: "border-slate-200",
    image: "/images/categories/work.png",
    heroGradient: "from-slate-50/50 via-stone-50/30 to-cream",
    overlayTint: "from-slate-50/15 to-transparent",
  },
  other: {
    label: "Other",
    chipBg: "bg-stone-50/80",
    chipText: "text-stone-500",
    borderColor: "border-l-stone-300",
    bulletColor: "text-stone-400",
    tintBg: "bg-stone-50/30",
    dotColor: "bg-stone-500",
    filterBg: "bg-stone-50",
    filterText: "text-stone-600",
    filterBorder: "border-stone-200",
    image: "/images/categories/other.png",
    heroGradient: "from-amber-50/50 via-stone-50/30 to-cream",
    overlayTint: "from-amber-50/15 to-transparent",
  },
};

/** Answered prayer gradient — sunrise warmth */
export const ANSWERED_GRADIENT = "from-amber-50/70 via-orange-50/30 to-cream";

const DEFAULT_STYLE: CategoryStyle = CATEGORY_STYLES.other;

export function getCategoryStyle(cat: string): CategoryStyle {
  return CATEGORY_STYLES[cat] ?? DEFAULT_STYLE;
}
