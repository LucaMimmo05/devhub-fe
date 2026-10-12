import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { SiGithub } from "react-icons/si";
import { Archive, ExternalLink, FolderKanban, GitFork, Lock, RefreshCw, Search, Star, X } from "lucide-react";
import PageContainer from "@/layouts/PageContainer";
import { Button } from "@/components/ui/button";
import ConnectGithubCard from "@/components/github/ConnectGithubCard";
import ContributionGraph from "@/components/github/ContributionGraph";
import CommitList from "@/components/github/CommitList";
import { ago, compactNumber, languageColor } from "@/components/github/githubUtils";
import {
  useDisconnectGithub,
  useGithubCommits,
  useGithubContributions,
  useGithubRepos,
  useGithubStatus,
} from "@/hooks/queries/useGithub";
import { useProjects } from "@/hooks/queries/useProjects";
import { queryKeys } from "@/hooks/queries/keys";
import { apiErrorMessage } from "@/utils/githubAuth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Panel = ({ title, action, children, className }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) => (
  <section className={cn("min-w-0 rounded-xl border border-border bg-card/60", className)}>
    <header className="flex h-11 items-center justify-between gap-3 border-b border-border/60 px-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      {action}
    </header>
    <div className="p-1.5">{children}</div>
  </section>
);

const Rows = ({ n = 5 }: { n?: number }) => (
  <div className="flex flex-col gap-1 p-1.5" aria-hidden>
    {Array.from({ length: n }).map((_, i) => (
      <div key={i} className="flex h-10 items-center gap-3 px-1">
        <div className="h-6 w-6 animate-pulse rounded-full bg-primary/10" />
        <div className="h-3 flex-1 animate-pulse rounded bg-primary/10" style={{ maxWidth: `${70 - i * 8}%` }} />
      </div>
    ))}
  </div>
);

const ErrorLine = ({ error }: { error: unknown }) => (
  <p className="px-3 py-6 text-center text-sm text-muted-foreground">{apiErrorMessage(error, "Couldn't load this from GitHub.")}</p>
);

const Github = () => {
  const queryClient = useQueryClient();
  const { data: status, isLoading: statusLoading } = useGithubStatus();
  const { data: repos, isLoading: reposLoading, error: reposError } = useGithubRepos();
  const { data: commits, isLoading: commitsLoading, error: commitsError } = useGithubCommits();
  const { data: contributions, isLoading: contribLoading, error: contribError } = useGithubContributions();
  const { data: projects = [] } = useProjects();
  const disconnect = useDisconnectGithub();
  const [query, setQuery] = useState("");
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  // Repo → DevHub project it's linked to.
  const linked = useMemo(() => {
    const map = new Map<string, { id: string; title: string }>();
    projects.forEach((p) => p.githubRepo && map.set(p.githubRepo.toLowerCase(), { id: p.id, title: p.title }));
    return map;
  }, [projects]);

  const q = query.trim().toLowerCase();
  const visibleRepos = (repos ?? []).filter(
    (r) => !q || r.fullName.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q) || r.language?.toLowerCase().includes(q)
  );

  if (statusLoading) {
    return (
      <PageContainer>
        <div className="h-24 animate-pulse rounded-xl bg-primary/10" />
      </PageContainer>
    );
  }

  if (!status?.connected) {
    return (
      <PageContainer className="justify-center py-10">
        <ConnectGithubCard configured={!!status?.configured} />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="gap-5">
      {/* Account */}
      <div className="flex flex-wrap items-center gap-4">
        {status.avatarUrl ? (
          <img src={status.avatarUrl} alt="" className="h-12 w-12 rounded-full ring-2 ring-border" />
        ) : (
          <SiGithub className="h-10 w-10" />
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold leading-tight">{status.name || status.login}</h1>
          <a
            href={status.profileUrl ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            @{status.login} <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 gap-1.5 text-muted-foreground"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: queryKeys.github.all });
              toast.success("Refreshing from GitHub…");
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          {!confirmDisconnect ? (
            <Button size="sm" variant="outline" className="h-8" onClick={() => setConfirmDisconnect(true)}>
              Disconnect
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="destructive"
                className="h-8"
                disabled={disconnect.isPending}
                onClick={() =>
                  disconnect.mutate(undefined, {
                    onSuccess: () => toast.success("GitHub disconnected"),
                    onError: (err) => toast.error(apiErrorMessage(err, "Couldn't disconnect GitHub.")),
                  })
                }
              >
                Disconnect
              </Button>
              <Button size="sm" variant="ghost" className="h-8" onClick={() => setConfirmDisconnect(false)}>
                Keep
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Contribution graph */}
      <section className="rounded-xl border border-border bg-card/60 p-4 sm:p-5">
        {contribLoading ? (
          <div className="h-36 animate-pulse rounded-lg bg-primary/10" aria-hidden />
        ) : contribError || !contributions ? (
          <ErrorLine error={contribError} />
        ) : (
          <ContributionGraph data={contributions} />
        )}
      </section>

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <Panel title="Recent commits" action={<span className="text-xs text-muted-foreground">last 60 days</span>}>
          {commitsLoading ? (
            <Rows />
          ) : commitsError ? (
            <ErrorLine error={commitsError} />
          ) : commits && commits.length > 0 ? (
            <CommitList commits={commits.slice(0, 15)} />
          ) : (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No commits by you in the last 60 days.</p>
          )}
        </Panel>

        <Panel
          title={`Repositories${repos ? ` · ${repos.length}` : ""}`}
          action={
            <label className="relative w-44 sm:w-56">
              <span className="sr-only">Filter repositories</span>
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter…"
                className="h-7 w-full rounded-md border border-border bg-background/40 pl-8 pr-7 text-xs outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear filter" className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </label>
          }
        >
          {reposLoading ? (
            <Rows n={6} />
          ) : reposError ? (
            <ErrorLine error={reposError} />
          ) : visibleRepos.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">{q ? "No repositories match." : "No repositories yet."}</p>
          ) : (
            <ul className="flex max-h-[38rem] flex-col overflow-y-auto">
              {visibleRepos.map((r) => {
                const project = linked.get(r.fullName.toLowerCase());
                return (
                  <li key={r.id}>
                    <Link
                      to={`/github/repos/${r.fullName}`}
                      className="group flex flex-col gap-1.5 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-sm font-medium group-hover:text-primary">
                          {r.owner !== status.login && <span className="text-muted-foreground">{r.owner}/</span>}
                          {r.name}
                        </span>
                        {r.isPrivate && <Lock className="h-3 w-3 shrink-0 text-muted-foreground" aria-label="Private" />}
                        {r.fork && <GitFork className="h-3 w-3 shrink-0 text-muted-foreground" aria-label="Fork" />}
                        {r.archived && <Archive className="h-3 w-3 shrink-0 text-muted-foreground" aria-label="Archived" />}
                        {project && (
                          <span className="ml-auto flex shrink-0 items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            <FolderKanban className="h-3 w-3" /> {project.title}
                          </span>
                        )}
                      </span>
                      {r.description && <span className="line-clamp-1 text-xs text-muted-foreground">{r.description}</span>}
                      <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                        {r.language && (
                          <span className="flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: languageColor(r.language) }} />
                            {r.language}
                          </span>
                        )}
                        {r.stars > 0 && (
                          <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {compactNumber(r.stars)}</span>
                        )}
                        {r.forks > 0 && (
                          <span className="flex items-center gap-1"><GitFork className="h-3 w-3" /> {compactNumber(r.forks)}</span>
                        )}
                        {r.openIssues > 0 && <span>{r.openIssues} open</span>}
                        {r.pushedAt && <span className="ml-auto">pushed {ago(r.pushedAt)}</span>}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </PageContainer>
  );
};

export default Github;
