import { formatDistanceToNowStrict } from "date-fns";

// GitHub's linguist colours for the languages people actually see on a dev dashboard.
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Java: "#b07219",
  Kotlin: "#A97BFF",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  "C#": "#178600",
  "C++": "#f34b7d",
  C: "#555555",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Shell: "#89e051",
  Dockerfile: "#384d54",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Swift: "#F05138",
  Dart: "#00B4AB",
  "Jupyter Notebook": "#DA5B0B",
  MDX: "#fcb32c",
  Astro: "#ff5a03",
};

export const languageColor = (language?: string | null) => (language && LANGUAGE_COLORS[language]) || "#8b949e";

/** "3 hours ago", tolerant of missing dates. */
export const ago = (iso?: string | null) =>
  iso ? `${formatDistanceToNowStrict(new Date(iso))} ago` : "";

export const compactNumber = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k` : String(n);

/** "owner/name" → "name". */
export const repoName = (fullName: string) => fullName.split("/")[1] ?? fullName;

/** GitHub label colours are hex without "#". */
export const labelStyle = (color: string | null) =>
  color ? { borderColor: `#${color}66`, backgroundColor: `#${color}1f`, color: `#${color}` } : undefined;
