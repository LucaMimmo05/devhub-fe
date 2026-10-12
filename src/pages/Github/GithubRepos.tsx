import { useState } from "react";
import { Link } from "react-router-dom";
import { Archive, ArrowDown, CircleDot, FolderKanban, GitFork, Lock, Plus, Search, Star, X } from "lucide-react";
import GithubShell from "@/components/github/GithubShell";
import { InlinePicker } from "@/components/projects/InlineEdit";
import { useRepoLink } from "@/components/github/useRepoLink";
import { ago, compactNumber, languageColor } from "@/components/github/githubUtils";
import { useGithubRepos } from "@/hooks/queries/useGithub";
import { apiErrorMessage } from "@/utils/githubAuth";
import type { GithubRepo } from "@/types/githubType";
import { cn } from "@/lib/utils";

type Filter = "all" | "linked" | "unlinked" | "private" | "forks" | "archived";
type Sort = "pushed" | "name" | "stars" | "issues";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "linked", label: "Linked" },
  { value: "unlinked", label: "Not linked" },
  { value: "private", label: "Private" },
  { value: "forks", label: "Forks" },
  { value: "archived", label: "Archived" },
];

const COMPARE: Record<Sort, (a: GithubRepo, b: GithubRepo) => number> = {
  pushed: (a, b) => (b.pushedAt ?? "").localeCompare(a.pushedAt ?? ""),
  name: (a, b) => a.name.localeCompare(b.name),
  stars: (a, b) => b.stars - a.stars,
  issues: (a, b) => b.openIssues - a.openIssues,
};

const COLS = "grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1fr)_7rem_4rem_4rem_6.5rem_11rem]";

const SortHeader = ({ label, value, sort, onSort, className }: { label: string; value: Sort; sort: Sort; onSort: (s: Sort) => void; className?: string }) => (
  <button
    type="button"
    onClick={() => onSort(value)}
    aria-pressed={sort === value}
    className={cn("flex items-center gap-1 transition-colors hover:text-foreground", sort === value && "text-foreground", className)}
  >
    {label}
    {sort === value && <ArrowDown className="h-3 w-3" />}
  </button>
);

const Repositories = ({ login }: { login: string | null }) => {
  const { data: repos, isLoading, error } = useGithubRepos();
  const { projectFor, canEdit, link, options, ownedProjects } = useRepoLink();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("pushed");

  const all = repos ?? [];
  const test: Record<Filter, (r: GithubRepo) => boolean> = {
    all: (r) => !r.archived,
    linked: (r) => !!projectFor(r.fullName),
    unlinked: (r) => !r.archived && !projectFor(r.fullName),
    private: (r) => r.isPrivate,
    forks: (r) => r.fork,
    archived: (r) => r.archived,
  };
  const counts = Object.fromEntries(FILTERS.map((f) => [f.value, all.filter(test[f.value]).length])) as Record<Filter, number>;

  const q = query.trim().toLowerCase();
  const rows = all
    .filter(test[filter])
    .filter((r) => !q || [r.fullName, r.description, r.language, ...r.topics].some((s) => s?.toLowerCase().includes(q)))
    .sort(COMPARE[sort]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Filter repositories" className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
          {FILTERS.filter((f) => f.value === "all" || counts[f.value] > 0).map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                filter === f.value ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
              <span className="tabular-nums text-muted-foreground/70">{counts[f.value]}</span>
            </button>
          ))}
        </div>
        <label className="relative ml-auto w-full sm:w-72">
          <span className="sr-only">Search repositories</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, language, topic…"
            className="h-9 w-full rounded-lg border border-border bg-card/60 pl-8 pr-8 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </label>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card/60">
        <div className={cn("hidden h-10 items-center gap-x-4 border-b border-border/60 px-4 text-xs font-medium text-muted-foreground md:grid", COLS)}>
          <SortHeader label="Repository" value="name" sort={sort} onSort={setSort} />
          <span>Language</span>
          <SortHeader label="Stars" value="stars" sort={sort} onSort={setSort} className="justify-end" />
          <SortHeader label="Issues" value="issues" sort={sort} onSort={setSort} className="justify-end" />
          <SortHeader label="Pushed" value="pushed" sort={sort} onSort={setSort} className="justify-end" />
          <span>DevHub project</span>
        </div>

        {isLoading ? (
          <div className="flex flex-col" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex h-14 items-center gap-4 border-b border-border/40 px-4 last:border-0">
                <div className="h-3 animate-pulse rounded bg-primary/10" style={{ width: `${40 - i * 4}%` }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">{apiErrorMessage(error, "Couldn't load your repositories.")}</p>
        ) : rows.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm font-medium">{q ? `No repositories match “${query.trim()}”` : "Nothing here"}</p>
            {(q || filter !== "all") && (
              <button type="button" onClick={() => { setQuery(""); setFilter("all"); }} className="mt-1 text-xs font-medium text-primary hover:underline">
                Show all repositories
              </button>
            )}
          </div>
        ) : (
          <ul>
            {rows.map((r) => {
              const project = projectFor(r.fullName);
              const editable = canEdit(r.fullName) && ownedProjects.length > 0;
              return (
                <li key={r.id} className={cn("group relative grid items-center gap-x-4 gap-y-1 border-b border-border/40 px-4 py-3 transition-colors last:border-0 hover:bg-muted/30", COLS)}>
                  <div className="min-w-0">
                    <Link
                      to={`/github/repos/${r.fullName}`}
                      className="flex min-w-0 items-center gap-1.5 text-sm font-medium after:absolute after:inset-0 hover:text-primary focus-visible:outline-none"
                    >
                      <span className="truncate">
                        {r.owner !== login && <span className="font-normal text-muted-foreground">{r.owner}/</span>}
                        {r.name}
                      </span>
                      {r.isPrivate && <Lock className="h-3 w-3 shrink-0 text-muted-foreground" aria-label="Private" />}
                      {r.fork && <GitFork className="h-3 w-3 shrink-0 text-muted-foreground" aria-label="Fork" />}
                      {r.archived && <Archive className="h-3 w-3 shrink-0 text-muted-foreground" aria-label="Archived" />}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {r.description ?? <span className="italic text-muted-foreground/60">No description</span>}
                    </p>
                    {/* Small screens: the numbers move under the name */}
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[11px] tabular-nums text-muted-foreground md:hidden">
                      {r.language && (
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: languageColor(r.language) }} /> {r.language}
                        </span>
                      )}
                      {r.stars > 0 && <span className="flex items-center gap-1"><Star className="h-3 w-3" /> {compactNumber(r.stars)}</span>}
                      {r.openIssues > 0 && <span className="flex items-center gap-1"><CircleDot className="h-3 w-3" /> {r.openIssues}</span>}
                      {r.pushedAt && <span>{ago(r.pushedAt)}</span>}
                    </p>
                  </div>
                  <span className="hidden min-w-0 items-center gap-1.5 truncate text-xs text-muted-foreground md:flex">
                    {r.language && <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: languageColor(r.language) }} />}
                    <span className="truncate">{r.language ?? "—"}</span>
                  </span>
                  <span className="hidden text-right text-xs tabular-nums text-muted-foreground md:block">{r.stars > 0 ? compactNumber(r.stars) : "—"}</span>
                  <span className="hidden text-right text-xs tabular-nums text-muted-foreground md:block">{r.openIssues > 0 ? r.openIssues : "—"}</span>
                  <span className="hidden text-right text-xs tabular-nums text-muted-foreground md:block">{ago(r.pushedAt) || "—"}</span>
                  <div className="relative z-10 flex min-w-0 justify-end md:justify-start">
                    {editable ? (
                      <InlinePicker
                        label={`DevHub project for ${r.name}`}
                        value={project?.id ?? ""}
                        options={options(r.fullName)}
                        onChange={(id) => link(r.fullName, id || null)}
                        triggerClassName={cn(
                          "flex h-7 max-w-full items-center gap-1.5 rounded-md px-2 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                          project
                            ? "bg-primary/10 text-primary hover:bg-primary/15"
                            : "border border-dashed border-border text-muted-foreground opacity-100 hover:border-primary/50 hover:text-foreground md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 data-[state=open]:opacity-100"
                        )}
                      >
                        {project ? (
                          <>
                            <FolderKanban className="h-3 w-3 shrink-0" /> <span className="truncate">{project.title}</span>
                          </>
                        ) : (
                          <><Plus className="h-3 w-3" /> Link project</>
                        )}
                      </InlinePicker>
                    ) : project ? (
                      <Link to={`/projects/${project.id}`} className="flex max-w-full items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        <FolderKanban className="h-3 w-3 shrink-0" /> <span className="truncate">{project.title}</span>
                      </Link>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {repos && rows.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {rows.length} of {all.length} repositories{filter === "all" && counts.archived > 0 && ` · ${counts.archived} archived hidden`}
        </p>
      )}
    </div>
  );
};

const GithubRepos = () => <GithubShell>{(status) => <Repositories login={status.login} />}</GithubShell>;

export default GithubRepos;
