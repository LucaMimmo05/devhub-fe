import { Link } from "react-router-dom";
import { ArrowRight, Lock, Star } from "lucide-react";
import GithubShell from "@/components/github/GithubShell";
import ContributionGraph from "@/components/github/ContributionGraph";
import InboxPanel from "@/components/github/InboxPanel";
import ActivityFeed from "@/components/github/ActivityFeed";
import ProjectLinksPanel from "@/components/github/ProjectLinksPanel";
import { useRepoLink } from "@/components/github/useRepoLink";
import { ago, compactNumber, languageColor } from "@/components/github/githubUtils";
import { useGithubCommits, useGithubContributions, useGithubRepos } from "@/hooks/queries/useGithub";
import { apiErrorMessage } from "@/utils/githubAuth";
import { cn } from "@/lib/utils";

const Card = ({
  title,
  aside,
  children,
  className,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={cn("flex min-w-0 flex-col rounded-xl border border-border bg-card/60", className)}>
    <header className="flex h-11 items-center justify-between gap-3 border-b border-border/60 px-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      {aside}
    </header>
    {children}
  </section>
);

const Skeleton = ({ rows = 4 }: { rows?: number }) => (
  <div className="flex flex-col gap-3 p-4" aria-hidden>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-3 animate-pulse rounded bg-primary/10" style={{ width: `${80 - i * 12}%` }} />
    ))}
  </div>
);

const Failure = ({ error, fallback }: { error: unknown; fallback: string }) => (
  <p className="px-4 py-8 text-center text-sm text-muted-foreground">{apiErrorMessage(error, fallback)}</p>
);

/** Pushes shown before "Show more", so inbox + activity fit on one screen. */
const ACTIVITY_PREVIEW = 4;

const Overview = () => {
  const { data: contributions, isLoading: contribLoading, error: contribError } = useGithubContributions();
  const { data: commits, isLoading: commitsLoading, error: commitsError } = useGithubCommits();
  const { data: repos, isLoading: reposLoading } = useGithubRepos();
  const { projectFor } = useRepoLink();

  const recent = [...(repos ?? [])]
    .filter((r) => !r.archived && r.pushedAt)
    .sort((a, b) => (b.pushedAt ?? "").localeCompare(a.pushedAt ?? ""))
    .slice(0, 6);

  return (
    <>
      <section className="rounded-xl border border-border bg-card/60 p-4 sm:p-5">
        {contribLoading ? (
          <div className="h-52 animate-pulse rounded-lg bg-primary/10" aria-hidden />
        ) : contribError || !contributions ? (
          <Failure error={contribError} fallback="Couldn't load your contributions." />
        ) : (
          <ContributionGraph data={contributions} />
        )}
      </section>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          <InboxPanel projectFor={projectFor} />

          <Card title="Your activity" aside={<span className="text-xs text-muted-foreground">last 60 days</span>}>
            {commitsLoading ? (
              <Skeleton rows={5} />
            ) : commitsError ? (
              <Failure error={commitsError} fallback="Couldn't load your commits." />
            ) : commits && commits.length > 0 ? (
              <ActivityFeed commits={commits} preview={ACTIVITY_PREVIEW} />
            ) : (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">No commits by you in the last 60 days.</p>
            )}
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <ProjectLinksPanel repos={repos} />

          <Card
            title="Recently pushed"
            aside={
              repos && (
                <Link to="/github/repos" className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                  All {repos.length} <ArrowRight className="h-3 w-3" />
                </Link>
              )
            }
          >
            {reposLoading ? (
              <Skeleton />
            ) : (
              <ul className="p-1.5">
                {recent.map((r) => (
                  <li key={r.id}>
                    <Link
                      to={`/github/repos/${r.fullName}`}
                      className="group grid grid-cols-[0.5rem_minmax(0,1fr)_auto] items-center gap-x-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/40"
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: languageColor(r.language) }} title={r.language ?? undefined} />
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate text-sm font-medium group-hover:text-primary">{r.name}</span>
                        {r.isPrivate && <Lock className="h-3 w-3 shrink-0 text-muted-foreground" aria-label="Private" />}
                      </span>
                      <span className="flex items-center gap-3 text-xs tabular-nums text-muted-foreground">
                        {r.stars > 0 && (
                          <span className="hidden items-center gap-1 sm:flex"><Star className="h-3 w-3" /> {compactNumber(r.stars)}</span>
                        )}
                        <span className="w-20 text-right">{ago(r.pushedAt)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

const Github = () => <GithubShell>{() => <Overview />}</GithubShell>;

export default Github;
