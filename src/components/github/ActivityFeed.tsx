import { useState } from "react";
import { Link } from "react-router-dom";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { GitCommitHorizontal } from "lucide-react";
import type { GithubCommit } from "@/types/githubType";
import { ago, repoName } from "./githubUtils";
import ShowMoreButton from "./ShowMoreButton";

const dayLabel = (iso: string | null) => {
  if (!iso) return "Earlier";
  const d = parseISO(iso);
  return isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : format(d, "EEEE d MMM");
};

type Push = { key: string; repo: string; commits: GithubCommit[] };

/** Commits → days → runs of consecutive commits to the same repo ("pushes"). */
const group = (commits: GithubCommit[]) => {
  const days: { label: string; pushes: Push[] }[] = [];
  for (const c of commits) {
    const label = dayLabel(c.date);
    let day = days[days.length - 1];
    if (day?.label !== label) days.push((day = { label, pushes: [] }));
    const last = day.pushes[day.pushes.length - 1];
    if (last?.repo === c.repo) last.commits.push(c);
    else day.pushes.push({ key: `${label}-${c.repo}-${c.sha}`, repo: c.repo, commits: [c] });
  }
  return days;
};

const PREVIEW = 2;

const PushItem = ({ push }: { push: Push }) => {
  const [open, setOpen] = useState(false);
  const shown = open ? push.commits : push.commits.slice(0, PREVIEW);
  const n = push.commits.length;
  return (
    <li className="relative pl-6">
      <span className="absolute left-0 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-card ring-1 ring-border">
        <GitCommitHorizontal className="h-3 w-3 text-muted-foreground" />
      </span>
      <p className="flex items-baseline justify-between gap-3 text-xs">
        <span className="text-muted-foreground">
          {n} commit{n === 1 ? "" : "s"} to{" "}
          <Link to={`/github/repos/${push.repo}`} className="font-semibold text-foreground transition-colors hover:text-primary">
            {repoName(push.repo)}
          </Link>
        </span>
        <span className="shrink-0 tabular-nums text-muted-foreground">{ago(push.commits[0].date)}</span>
      </p>
      <ul className="mt-1.5 flex flex-col">
        {shown.map((c) => (
          <li key={c.sha}>
            <a
              href={c.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group -mx-2 flex items-baseline gap-2 rounded-md px-2 py-1 transition-colors hover:bg-muted/50"
            >
              <code className="shrink-0 font-mono text-[11px] text-muted-foreground/80">{c.shortSha}</code>
              <span className="truncate text-[13px] group-hover:text-primary">{c.message}</span>
            </a>
          </li>
        ))}
      </ul>
      {n > PREVIEW && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {open ? "Show less" : `${n - PREVIEW} more`}
        </button>
      )}
    </li>
  );
};

/** Keeps the first `limit` pushes, dropping days left empty. */
const take = (days: ReturnType<typeof group>, limit: number) => {
  let left = limit;
  return days
    .map((d) => {
      const pushes = d.pushes.slice(0, Math.max(0, left));
      left -= pushes.length;
      return { ...d, pushes };
    })
    .filter((d) => d.pushes.length > 0);
};

/**
 * The user's recent commits as a timeline of pushes per repository. With `preview`, only that
 * many pushes show until "Show more".
 */
const ActivityFeed = ({ commits, preview }: { commits: GithubCommit[]; preview?: number }) => {
  const [expanded, setExpanded] = useState(false);
  const days = group(commits);
  const total = days.reduce((n, d) => n + d.pushes.length, 0);
  const cut = preview !== undefined && !expanded && total > preview;

  return (
    <>
      <div className="flex flex-col gap-5 px-4 py-4">
        {(cut ? take(days, preview) : days).map((day) => (
          <section key={day.label}>
            <h3 className="mb-2.5 text-[11px] font-medium text-muted-foreground">{day.label}</h3>
            {/* Rail behind the dots */}
            <ul className="relative flex flex-col gap-4 before:absolute before:bottom-1 before:left-2 before:top-2 before:w-px before:bg-border/70">
              {day.pushes.map((p) => (
                <PushItem key={p.key} push={p} />
              ))}
            </ul>
          </section>
        ))}
      </div>
      {preview !== undefined && total > preview && (
        <ShowMoreButton hidden={total - preview} expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
      )}
    </>
  );
};

export default ActivityFeed;
