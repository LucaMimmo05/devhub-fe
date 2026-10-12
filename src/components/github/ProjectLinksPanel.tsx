import { Link } from "react-router-dom";
import { CircleDot, FolderKanban, Link2, Plus } from "lucide-react";
import { InlinePicker } from "@/components/projects/InlineEdit";
import { useRepoLink } from "./useRepoLink";
import { ago, languageColor, repoName } from "./githubUtils";
import type { GithubRepo } from "@/types/githubType";

/**
 * DevHub projects next to their GitHub repositories: what's linked, how it's doing, and a one-click
 * way to link the projects that aren't.
 */
const ProjectLinksPanel = ({ repos }: { repos: GithubRepo[] | undefined }) => {
  const { projects, ownedProjects, link, pending } = useRepoLink();
  const byName = new Map((repos ?? []).map((r) => [r.fullName.toLowerCase(), r]));
  const linked = projects.filter((p) => p.githubRepo && p.status !== "ARCHIVED");
  const unlinked = ownedProjects.filter((p) => !p.githubRepo && p.status !== "COMPLETED");
  const taken = new Set(linked.map((p) => p.githubRepo!.toLowerCase()));
  const repoOptions = (repos ?? [])
    .filter((r) => !r.archived && !taken.has(r.fullName.toLowerCase()))
    .map((r) => ({ value: r.fullName, label: r.fullName, hint: r.isPrivate ? "private" : undefined }));

  return (
    <section className="flex min-w-0 flex-col rounded-xl border border-border bg-card/60">
      <header className="flex h-11 items-center gap-2 border-b border-border/60 px-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Link2 className="h-4 w-4 text-muted-foreground" /> Projects on GitHub
        </h2>
        <span className="text-xs tabular-nums text-muted-foreground">
          {linked.length}/{linked.length + unlinked.length} linked
        </span>
      </header>

      <div className="flex flex-col p-1.5">
        {linked.length === 0 && unlinked.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Create a project to link it to a repository.
          </p>
        )}

        {linked.map((p) => {
          const repo = byName.get(p.githubRepo!.toLowerCase());
          return (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/40"
            >
              <span className="min-w-0">
                <span className="flex items-center gap-2">
                  <FolderKanban className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="truncate text-sm font-medium group-hover:text-primary">{p.title}</span>
                </span>
                <span className="mt-0.5 flex items-center gap-1.5 pl-5.5 text-xs text-muted-foreground">
                  {repo?.language && (
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: languageColor(repo.language) }} />
                  )}
                  <span className="truncate">{repoName(p.githubRepo!)}</span>
                  {repo?.pushedAt && <span className="shrink-0">· pushed {ago(repo.pushedAt)}</span>}
                </span>
              </span>
              {repo && repo.openIssues > 0 && (
                <span className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground" title="Open issues and pull requests">
                  <CircleDot className="h-3 w-3" /> {repo.openIssues}
                </span>
              )}
            </Link>
          );
        })}

        {unlinked.length > 0 && (
          <>
            {linked.length > 0 && <div className="mx-2.5 my-1.5 h-px bg-border/60" />}
            <p className="px-2.5 pb-1 pt-1 text-[11px] font-medium text-muted-foreground">Not linked yet</p>
            {unlinked.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5">
                <FolderKanban className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <Link to={`/projects/${p.id}`} className="min-w-0 flex-1 truncate text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {p.title}
                </Link>
                {repoOptions.length > 0 && (
                  <InlinePicker
                    label={`repository for ${p.title}`}
                    value=""
                    options={repoOptions}
                    onChange={(fullName) => link(fullName, p.id)}
                    triggerClassName="flex h-7 shrink-0 items-center gap-1 rounded-md border border-dashed border-border px-2 text-[11px] font-medium text-muted-foreground outline-none transition-colors hover:border-primary/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                  >
                    <Plus className="h-3 w-3" /> {pending ? "Linking…" : "Link repo"}
                  </InlinePicker>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
};

export default ProjectLinksPanel;
