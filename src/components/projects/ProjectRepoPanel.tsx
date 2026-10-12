import { Link } from "react-router-dom";
import { SiGithub } from "react-icons/si";
import { CircleDot, ExternalLink, GitPullRequest, Star, Unlink } from "lucide-react";
import ConnectGithubCard from "@/components/github/ConnectGithubCard";
import { InlinePicker } from "@/components/projects/InlineEdit";
import { ago, compactNumber, languageColor } from "@/components/github/githubUtils";
import { useGithubRepo, useGithubRepos, useGithubStatus } from "@/hooks/queries/useGithub";
import { apiErrorMessage } from "@/utils/githubAuth";
import type { ProjectType } from "@/types/projectType";

type Props = {
  project: ProjectType;
  isOwner: boolean;
  /** "owner/name" to link, "" to unlink. */
  onChange: (githubRepo: string) => void;
};

const Shell = ({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) => (
  <section className="rounded-xl border border-border bg-card/60">
    <header className="flex h-11 items-center justify-between border-b border-border/60 px-4">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold">
        <SiGithub className="h-3.5 w-3.5" /> Repository
      </h2>
      {action}
    </header>
    <div className="p-4">{children}</div>
  </section>
);

/** The project's linked GitHub repo: key numbers and latest commits, or a way to link one. */
const ProjectRepoPanel = ({ project, isOwner, onChange }: Props) => {
  const { data: status } = useGithubStatus();
  const connected = !!status?.connected;
  const fullName = project.githubRepo ?? null;
  const { data: detail, isLoading, error } = useGithubRepo(fullName);
  const { data: repos } = useGithubRepos();

  if (!fullName) {
    if (!isOwner) return null;
    return (
      <Shell>
        <p className="text-xs text-muted-foreground">Link a GitHub repository to see its commits, issues and pull requests here.</p>
        <div className="mt-3">
          {!connected ? (
            <ConnectGithubCard configured={!!status?.configured} compact />
          ) : (
            <InlinePicker
              label="repository"
              value=""
              options={(repos ?? []).map((r) => ({ value: r.fullName, label: r.fullName, hint: r.isPrivate ? "private" : undefined }))}
              onChange={onChange}
              triggerClassName="flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background/40 px-2.5 text-xs font-medium outline-none hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring"
            >
              {repos ? "Link a repository" : "Loading repositories…"}
            </InlinePicker>
          )}
        </div>
      </Shell>
    );
  }

  const unlink = isOwner ? (
    <button
      type="button"
      onClick={() => onChange("")}
      title="Unlink repository"
      aria-label="Unlink repository"
      className="-mr-1.5 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Unlink className="h-3.5 w-3.5" />
    </button>
  ) : undefined;

  const repo = detail?.repo;

  return (
    <Shell action={unlink}>
      <div className="flex items-center gap-2">
        <Link to={`/github/repos/${fullName}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:text-primary">
          <span className="font-normal text-muted-foreground">{fullName.split("/")[0]}/</span>
          {fullName.split("/")[1]}
        </Link>
        <a href={`https://github.com/${fullName}`} target="_blank" rel="noopener noreferrer" aria-label="Open on GitHub" className="text-muted-foreground hover:text-foreground">
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {!connected ? (
        <p className="mt-2 text-xs text-muted-foreground">Connect GitHub to see this repository's activity.</p>
      ) : isLoading ? (
        <div className="mt-3 space-y-2" aria-hidden>
          <div className="h-3 w-2/3 animate-pulse rounded bg-primary/10" />
          <div className="h-3 w-full animate-pulse rounded bg-primary/10" />
          <div className="h-3 w-4/5 animate-pulse rounded bg-primary/10" />
        </div>
      ) : error || !detail || !repo ? (
        <p className="mt-2 text-xs text-muted-foreground">{apiErrorMessage(error, "Couldn't load the repository.")}</p>
      ) : (
        <>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {repo.language && (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: languageColor(repo.language) }} />
                {repo.language}
              </span>
            )}
            <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {compactNumber(repo.stars)}</span>
            <span className="flex items-center gap-1" title="Open issues"><CircleDot className="h-3 w-3" /> {detail.issues.length}</span>
            <span className="flex items-center gap-1" title="Open pull requests"><GitPullRequest className="h-3 w-3" /> {detail.pulls.length}</span>
            {repo.pushedAt && <span className="ml-auto tabular-nums">pushed {ago(repo.pushedAt)}</span>}
          </div>
          {detail.commits.length > 0 && (
            <ul className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-3">
              {detail.commits.slice(0, 3).map((c) => (
                <li key={c.sha}>
                  <a href={c.htmlUrl} target="_blank" rel="noopener noreferrer" className="group block">
                    <span className="block truncate text-xs font-medium group-hover:text-primary">{c.message}</span>
                    <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <code className="font-mono text-muted-foreground/80">{c.shortSha}</code>
                      {c.authorLogin ?? c.authorName} · {ago(c.date)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
          <Link to={`/github/repos/${fullName}`} className="mt-3 inline-block text-xs font-medium text-primary hover:underline">
            Issues, pull requests and more →
          </Link>
        </>
      )}
    </Shell>
  );
};

export default ProjectRepoPanel;
