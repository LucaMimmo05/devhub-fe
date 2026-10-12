import { format, isToday, isYesterday, parseISO } from "date-fns";
import { GitCommitHorizontal } from "lucide-react";
import type { GithubCommit } from "@/types/githubType";

const dayLabel = (iso: string) => {
  const d = parseISO(iso);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEEE d MMM");
};

/** Consecutive commits on the same calendar day, newest first (the API already sorts them). */
const groupByDay = (commits: GithubCommit[]) => {
  const groups: { label: string; commits: GithubCommit[] }[] = [];
  for (const c of commits) {
    const label = c.date ? dayLabel(c.date) : "Undated";
    const last = groups[groups.length - 1];
    if (last?.label === label) last.commits.push(c);
    else groups.push({ label, commits: [c] });
  }
  return groups;
};

const CommitRow = ({ c, showRepo }: { c: GithubCommit; showRepo: boolean }) => {
  // Conventional commit prefix ("feat(github):") shown muted so the subject reads first.
  const match = c.message.match(/^(\w+(?:\([^)]*\))?!?:)\s*(.*)$/);
  return (
    <li>
      <a
        href={c.htmlUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-x-3 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring"
      >
        {c.authorAvatarUrl ? (
          <img src={c.authorAvatarUrl} alt={c.authorLogin ?? c.authorName ?? "Author"} className="h-6 w-6 rounded-md" />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-muted">
            <GitCommitHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-[13px] leading-snug">
            {match ? (
              <>
                <span className="text-muted-foreground">{match[1]}</span>{" "}
                <span className="font-medium group-hover:text-primary">{match[2]}</span>
              </>
            ) : (
              <span className="font-medium group-hover:text-primary">{c.message}</span>
            )}
          </span>
          <span className="block truncate text-[11px] text-muted-foreground">
            {showRepo ? (c.repo.split("/")[1] ?? c.repo) : (c.authorLogin ?? c.authorName)}
          </span>
        </span>
        <span className="flex flex-col items-end gap-0.5 text-[11px] tabular-nums text-muted-foreground">
          <code className="font-mono text-muted-foreground/80">{c.shortSha}</code>
          {c.date && <span>{format(parseISO(c.date), "HH:mm")}</span>}
        </span>
      </a>
    </li>
  );
};

/** Commits grouped under day headings. Each row opens the commit on GitHub. */
const CommitList = ({ commits, showRepo = true }: { commits: GithubCommit[]; showRepo?: boolean }) => (
  <div className="flex flex-col gap-2">
    {groupByDay(commits).map((g) => (
      <section key={g.label}>
        <h3 className="flex items-center gap-2 px-2.5 pb-1 pt-1 text-[11px] font-medium text-muted-foreground">
          {g.label}
          <span className="tabular-nums text-muted-foreground/60">{g.commits.length}</span>
          <span className="h-px flex-1 bg-border/60" />
        </h3>
        <ul className="flex flex-col">
          {g.commits.map((c) => (
            <CommitRow key={`${c.repo}-${c.sha}`} c={c} showRepo={showRepo} />
          ))}
        </ul>
      </section>
    ))}
  </div>
);

export default CommitList;
