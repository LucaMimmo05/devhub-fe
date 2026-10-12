import { GitCommitHorizontal } from "lucide-react";
import type { GithubCommit } from "@/types/githubType";
import { ago } from "./githubUtils";

/** Compact commit rows: message, repo (optional), short sha, time. Each row opens the commit on GitHub. */
const CommitList = ({ commits, showRepo = true }: { commits: GithubCommit[]; showRepo?: boolean }) => (
  <ul className="flex flex-col">
    {commits.map((c) => (
      <li key={`${c.repo}-${c.sha}`}>
        <a
          href={c.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-start gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring"
        >
          {c.authorAvatarUrl ? (
            <img src={c.authorAvatarUrl} alt="" className="mt-0.5 h-6 w-6 shrink-0 rounded-full" />
          ) : (
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
              <GitCommitHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium leading-snug group-hover:text-primary">{c.message}</span>
            <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              {showRepo && <span className="truncate">{c.repo}</span>}
              <code className="shrink-0 font-mono text-[11px] text-muted-foreground/80">{c.shortSha}</code>
            </span>
          </span>
          <span className="shrink-0 pt-0.5 text-xs tabular-nums text-muted-foreground">{ago(c.date)}</span>
        </a>
      </li>
    ))}
  </ul>
);

export default CommitList;
