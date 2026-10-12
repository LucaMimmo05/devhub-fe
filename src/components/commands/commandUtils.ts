import { CATEGORIES } from "@/types/commandType";

const DOTS: Record<string, string> = {
  Bash: "bg-yellow-400",
  Git: "bg-orange-400",
  Docker: "bg-sky-400",
  SQL: "bg-violet-400",
  NPM: "bg-red-400",
};

/** Small colour dot per known category; custom ones share a neutral dot. */
export const categoryDot = (category: string) => DOTS[category] ?? "bg-muted-foreground/60";

/** Default categories first, then the user's own ones in first-seen order. */
export const allCategories = (used: string[]) => {
  const defaults = new Set<string>(CATEGORIES);
  const custom = [...new Set(used.filter((c) => c && !defaults.has(c)))];
  return [...CATEGORIES, ...custom];
};
