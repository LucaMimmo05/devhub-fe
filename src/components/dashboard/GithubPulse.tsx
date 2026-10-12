import { Link } from "react-router-dom";
import { SiGithub } from "react-icons/si";
import { GitPullRequest, GitPullRequestDraft } from "lucide-react";
import { useGithubContributions, useGithubInbox, useGithubStatus } from "@/hooks/queries/useGithub";
import { ago, repoName } from "@/components/github/githubUtils";
import { cn } from "@/lib/utils";

const LEVELS = ["bg-white/[0.05]", "bg-[#0e4429]", "bg-[#006d32]", "bg-[#26a641]", "bg-[#39d353]"];
const WEEKS = 30;

/** GitHub at a glance: who's waiting on you, your open PRs, and the last few months of activity. */
const GithubPulse = () => {
  const { data: status } = useGithubStatus();
  const { data: inbox } = useGithubInbox();
  const { data: contributions } = useGithubContributions();

  if (!status?.connected) {
    return (
      <div className="flex items-center gap-3 px-2.5 py-3">
        <SiGithub className="h-5 w-5 shrink-0 text-muted-foreground" />
        <p className="flex-1 text-sm text-muted-foreground">See review requests and your activity here.</p>
        <Link to="/github" className="shrink-0 rounded-md border border-border px-2 py-1 text-xs font-medium transition-colors hover:bg-muted">
          Connect
        </Link>
      </div>
    );
  }

  const weeks = contributions?.weeks.slice(-WEEKS) ?? [];
  const recent = weeks.reduce((n, w) => n + w.days.reduce((m, d) => m + d.count, 0), 0);
  const waiting = [...(inbox?.reviewRequests ?? []), ...(inbox?.pullRequests.filter((p) => p.reviewDecision === "CHANGES_REQUESTED" || p.checks === "FAILURE") ?? [])].slice(0, 3);

  return (
    <div className="flex flex-col gap-3 p-2.5">
      <div className="grid grid-cols-2 gap-2">
        <Link to="/github" className="rounded-lg bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50">
          <p className={cn("text-xl font-semibold leading-none tabular-nums", inbox?.reviewRequests.length ? "text-amber-400" : "")}>
            {inbox?.reviewRequests.length ?? "–"}
          </p>
          <p className="mt-1.5 text-[11px] text-muted-foreground">reviews waiting</p>
        </Link>
        <Link to="/github" className="rounded-lg bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50">
          <p className="text-xl font-semibold leading-none tabular-nums">{inbox?.pullRequests.length ?? "–"}</p>
          <p className="mt-1.5 text-[11px] text-muted-foreground">your open PRs</p>
        </Link>
      </div>

      {waiting.length > 0 && (
        <ul className="flex flex-col">
          {waiting.map((item) => (
            <li key={`${item.repo}#${item.number}`}>
              <a href={item.htmlUrl} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-2 rounded-md px-1 py-1.5 transition-colors hover:bg-muted/40">
                {item.draft ? <GitPullRequestDraft className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <GitPullRequest className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", item.checks === "FAILURE" || item.reviewDecision === "CHANGES_REQUESTED" ? "text-red-400" : "text-amber-400")} />}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium group-hover:text-primary">{item.title}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {repoName(item.repo)} #{item.number} ·{" "}
                    {item.reviewDecision === "CHANGES_REQUESTED" ? "changes requested" : item.checks === "FAILURE" ? "checks failing" : `by ${item.authorLogin}`} · {ago(item.updatedAt)}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {weeks.length > 0 && (
        <div>
          <div className="grid grid-flow-col grid-rows-7 gap-[2px]" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }} aria-hidden>
            {weeks.flatMap((w, wi) =>
              Array.from({ length: 7 }, (_, di) => {
                const d = w.days.find((x) => new Date(x.date + "T12:00").getDay() === di);
                return <span key={`${wi}-${di}`} className={cn("aspect-square rounded-[2px]", d ? LEVELS[d.level] : "")} />;
              })
            )}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground">{recent.toLocaleString()}</span> contributions in the last {WEEKS} weeks
          </p>
        </div>
      )}
    </div>
  );
};

export default GithubPulse;
