export const CATEGORY_COLORS = ["slate", "amber", "rose", "blue", "green", "violet"] as const;

export type CategoryColor = (typeof CATEGORY_COLORS)[number];

type CategoryColorClasses = {
  bar: string;
  dot: string;
  badge: string;
};

const CATEGORY_COLOR_CLASSES: Record<CategoryColor, CategoryColorClasses> = {
  slate: {
    bar: "bg-slate-400 dark:bg-slate-500",
    dot: "bg-slate-400 dark:bg-slate-500",
    badge:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300",
  },
  amber: {
    bar: "bg-amber-500",
    dot: "bg-amber-500",
    badge:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  },
  rose: {
    bar: "bg-rose-500",
    dot: "bg-rose-500",
    badge:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300",
  },
  blue: {
    bar: "bg-blue-500",
    dot: "bg-blue-500",
    badge:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  },
  green: {
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  },
  violet: {
    bar: "bg-violet-500",
    dot: "bg-violet-500",
    badge:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300",
  },
};

export function isCategoryColor(value: string): value is CategoryColor {
  return (CATEGORY_COLORS as readonly string[]).includes(value);
}

export function categoryColorClasses(color: string | null | undefined): CategoryColorClasses {
  if (color && isCategoryColor(color)) {
    return CATEGORY_COLOR_CLASSES[color];
  }
  return CATEGORY_COLOR_CLASSES.slate;
}
