import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { SiGithub } from "react-icons/si";
import {
  Check,
  ChevronRight,
  CircleCheck,
  CircleDashed,
  CircleDot,
  CircleSlash,
  CircleX,
  Eye,
  FileText,
  FolderKanban,
  GitBranch,
  GitFork,
  GitPullRequest,
  GitPullRequestDraft,
  Globe,
  Loader2,
  Lock,
  MessageSquare,
  Plus,
  Scale,
  Star,
  Tag,
} from "lucide-react";
import PageContainer from "@/layouts/PageContainer";
import CommitList from "@/components/github/CommitList";
import ConnectGithubCard from "@/components/github/ConnectGithubCard";
import RepoReadme from "@/components/github/RepoReadme";
import { InlinePicker } from "@/components/projects/InlineEdit";
import { useRepoLink } from "@/components/github/useRepoLink";
import { ago, compactNumber, labelStyle, languageColor } from "@/components/github/githubUtils";
import { useGithubRepo, useGithubStatus } from "@/hooks/queries/useGithub";
import { useCreateTask } from "@/hooks/queries/useTasks";
import { apiErrorMessage } from "@/utils/githubAuth";
import type { GithubIssue, GithubRepoDetail, GithubWorkflowRun } from "@/types/githubType";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Tab = "overview" | "issues" | "pulls" | "commits";

const formatSize = (kb: number) =>
  kb >= 1024 * 1024 ? `${(kb / 1024 / 1024).toFixed(1)} GB` : kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;

const Box = ({ title, aside, children, className }: { title?: React.ReactNode; aside?: React.ReactNode; children: React.ReactNode; className?: string }) => (
  <section className={cn("min-w-0 rounded-xl border border-border bg-card/60", className)}>
    {title && (
      <header className="flex h-10 items-center justify-between gap-2 border-b border-border/60 px-4">
        <h2 className="flex items-center gap-2 text-xs font-semibold">{title}</h2>
        {aside}
      </header>
    )}
    {children}
  </section>
);

const Empty = ({ icon: Icon = CircleCheck, text }: { icon?: typeof CircleCheck; text: string }) => (
  <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
    <Icon className="h-5 w-5 text-muted-foreground/50" />
    <p className="text-sm text-muted-foreground">{text}</p>
  </div>
);

const Label = ({ name, color }: { name: string; color: string | null }) => (
  <span className="rounded-md border px-1.5 text-[10px] font-medium leading-4" style={labelStyle(color)}>{name}</span>
);

const Initials = ({ login, url, size = "h-7 w-7" }: { login: string; url: string | null; size?: string }) =>
  url ? (
    <img src={url} alt={login} className={cn(size, "rounded-md")} />
  ) : (
    <span className={cn(size, "flex items-center justify-center rounded-md bg-muted text-[10px] font-semibold uppercase text-muted-foreground")}>
      {login.slice(0, 2)}
    </span>
  );

// ── Sidebar blocks ────────────────────────────────────────────────────────────

const RunIcon = ({ run }: { run: GithubWorkflowRun }) => {
  if (run.status !== "completed") return <CircleDashed className="h-3.5 w-3.5 animate-[spin_3s_linear_infinite] text-amber-400" aria-label="Running" />;
  if (run.conclusion === "success") return <CircleCheck className="h-3.5 w-3.5 text-emerald-400" aria-label="Passed" />;
  if (run.conclusion === "failure" || run.conclusion === "timed_out") return <CircleX className="h-3.5 w-3.5 text-red-400" aria-label="Failed" />;
  return <CircleSlash className="h-3.5 w-3.5 text-muted-foreground" aria-label={run.conclusion ?? "Skipped"} />;
};

const Runs = ({ runs, htmlUrl }: { runs: GithubWorkflowRun[]; htmlUrl: string }) => {
  const latest = runs[0];
  const tone =
    latest.status !== "completed" ? "text-amber-400" : latest.conclusion === "success" ? "text-emerald-400" : latest.conclusion === "failure" ? "text-red-400" : "text-muted-foreground";
  const summary =
    latest.status !== "completed" ? "Running" : latest.conclusion === "success" ? "Passing" : latest.conclusion === "failure" ? "Failing" : "Skipped";
  return (
    <Box
      title="Actions"
      aside={<a href={`${htmlUrl}/actions`} target="_blank" rel="noopener noreferrer" className={cn("text-xs font-medium", tone)}>{summary}</a>}
    >
      <ul className="p-1.5">
        {runs.slice(0, 5).map((r) => (
          <li key={r.id}>
            <a href={r.htmlUrl} target="_blank" rel="noopener noreferrer" className="group grid grid-cols-[0.875rem_minmax(0,1fr)] gap-x-2.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-muted/40">
              <span className="pt-0.5"><RunIcon run={r} /></span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-medium group-hover:text-primary">{r.title ?? r.name}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {r.name} · {r.branch} · {ago(r.createdAt)}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </Box>
  );
};

const WeeklyActivity = ({ weeks }: { weeks: number[] }) => {
  const max = Math.max(1, ...weeks);
  const total = weeks.reduce((a, b) => a + b, 0);
  const recent = weeks.slice(-4).reduce((a, b) => a + b, 0);
  return (
    <Box title="Commit activity" aside={<span className="text-xs tabular-nums text-muted-foreground">{total.toLocaleString()} this year</span>}>
      <div className="px-4 pb-3 pt-4">
        <div className="flex h-14 items-end gap-px" role="img" aria-label={`${total} commits in the last 52 weeks`}>
          {weeks.map((n, i) => (
            <span
              key={i}
              title={`${n} commit${n === 1 ? "" : "s"}`}
              className={cn("flex-1 rounded-t-[1px]", n === 0 ? "bg-muted" : i >= weeks.length - 4 ? "bg-[#39d353]" : "bg-[#26a641]/70")}
              style={{ height: `${Math.max(6, (n / max) * 100)}%` }}
            />
          ))}
        </div>
        <p className="mt-2 flex justify-between text-[11px] text-muted-foreground">
          <span>52 weeks ago</span>
          <span><span className="font-medium tabular-nums text-foreground">{recent}</span> in the last 4 weeks</span>
        </p>
      </div>
    </Box>
  );
};

const Languages = ({ languages }: { languages: Record<string, number> }) => {
  const total = Object.values(languages).reduce((a, b) => a + b, 0);
  const list = Object.entries(languages)
    .map(([lang, bytes]) => ({ lang, pct: total ? (bytes / total) * 100 : 0 }))
    .filter((l) => l.pct >= 0.1);
  if (list.length === 0) return null;
  return (
    <Box title="Languages">
      <div className="px-4 py-3.5">
        <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
          {list.map((l) => (
            <span key={l.lang} style={{ width: `${l.pct}%`, backgroundColor: languageColor(l.lang) }} />
          ))}
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          {list.slice(0, 6).map((l) => (
            <li key={l.lang} className="flex min-w-0 items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: languageColor(l.lang) }} />
              <span className="truncate">{l.lang}</span>
              <span className="ml-auto tabular-nums text-muted-foreground">{l.pct.toFixed(1)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </Box>
  );
};

const Sidebar = ({ data }: { data: GithubRepoDetail }) => {
  const { repo } = data;
  return (
    <aside className="flex min-w-0 flex-col gap-4">
      {data.runs.length > 0 && <Runs runs={data.runs} htmlUrl={repo.htmlUrl} />}
      {data.weeklyCommits.length > 0 && <WeeklyActivity weeks={data.weeklyCommits} />}

      {data.latestRelease && (
        <a
          href={data.latestRelease.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 rounded-xl border border-border bg-card/60 px-4 py-3 transition-colors hover:border-primary/40"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
            <Tag className="h-4 w-4 text-emerald-400" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold group-hover:text-primary">{data.latestRelease.name ?? data.latestRelease.tag}</span>
            <span className="block text-[11px] text-muted-foreground">Latest release · {ago(data.latestRelease.publishedAt)}</span>
          </span>
        </a>
      )}

      <Languages languages={data.languages} />

      {data.contributors.length > 0 && (
        <Box title={<>Contributors <span className="font-normal tabular-nums text-muted-foreground">{data.contributors.length}</span></>}>
          <ul className="grid grid-cols-1 gap-0.5 p-1.5">
            {data.contributors.slice(0, 6).map((c) => (
              <li key={c.login}>
                <a href={`https://github.com/${c.login}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-muted/40">
                  <Initials login={c.login} url={c.avatarUrl} size="h-6 w-6" />
                  <span className="min-w-0 flex-1 truncate text-xs font-medium">{c.login}</span>
                  <span className="text-[11px] tabular-nums text-muted-foreground">{c.contributions.toLocaleString()} commits</span>
                </a>
              </li>
            ))}
          </ul>
        </Box>
      )}

      <Box title="About">
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 px-4 py-3.5 text-xs">
          {[
            { icon: GitBranch, label: "Default branch", value: repo.defaultBranch ?? "—" },
            { icon: Scale, label: "License", value: repo.license && repo.license !== "NOASSERTION" ? repo.license : "None" },
            { icon: Eye, label: "Watching", value: compactNumber(repo.watchers) },
            { icon: FileText, label: "Size", value: formatSize(repo.sizeKb) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="contents">
              <dt className="flex items-center gap-1.5 text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</dt>
              <dd className="truncate text-right font-medium tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        {repo.createdAt && (
          <p className="border-t border-border/60 px-4 py-2.5 text-[11px] text-muted-foreground">
            Created {format(new Date(repo.createdAt), "d MMM yyyy")}
          </p>
        )}
      </Box>
    </aside>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const GithubRepo = () => {
  const { owner = "", name = "" } = useParams();
  const fullName = `${owner}/${name}`;
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get("tab") as Tab | null) ?? "overview";
  const { data: status, isLoading: statusLoading } = useGithubStatus();
  const { data, isLoading, error } = useGithubRepo(fullName);
  const { projectFor, canEdit, link, options, ownedProjects, pending } = useRepoLink();
  const createTask = useCreateTask();
  const [imports, setImports] = useState<Record<number, "busy" | "done">>({});
  const [allCommits, setAllCommits] = useState(false);

  const project = projectFor(fullName);

  const importIssue = async (issue: GithubIssue) => {
    if (!project) return;
    setImports((s) => ({ ...s, [issue.number]: "busy" }));
    try {
      await createTask.mutateAsync({
        title: `#${issue.number} ${issue.title}`.slice(0, 100),
        description: `Imported from GitHub: ${issue.htmlUrl}`,
        projectId: project.id,
      });
      setImports((s) => ({ ...s, [issue.number]: "done" }));
      toast.success(`Added #${issue.number} to ${project.title}`);
    } catch (err) {
      setImports((s) => {
        const next = { ...s };
        delete next[issue.number];
        return next;
      });
      toast.error(apiErrorMessage(err, "Couldn't create the task."));
    }
  };

  if (!statusLoading && !status?.connected) {
    return (
      <PageContainer className="justify-center py-10">
        <ConnectGithubCard configured={!!status?.configured} />
      </PageContainer>
    );
  }

  const setTab = (t: Tab) => setSearchParams(t === "overview" ? {} : { tab: t }, { replace: true });
  const repo = data?.repo;

  return (
    <PageContainer className="gap-5">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
        <Link to="/github" className="rounded px-1 py-0.5 transition-colors hover:text-foreground">GitHub</Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <Link to="/github/repos" className="rounded px-1 py-0.5 transition-colors hover:text-foreground">Repositories</Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <span className="truncate px-1 text-foreground">{name}</span>
      </nav>

      {isLoading || statusLoading ? (
        <div className="flex flex-col gap-4" aria-hidden>
          <div className="h-6 w-64 animate-pulse rounded bg-primary/10" />
          <div className="h-4 w-96 max-w-full animate-pulse rounded bg-primary/10" />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="h-96 animate-pulse rounded-xl bg-primary/10" />
            <div className="h-64 animate-pulse rounded-xl bg-primary/10" />
          </div>
        </div>
      ) : error || !repo || !data ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm font-medium">Couldn't open {fullName}</p>
          <p className="mt-1 text-sm text-muted-foreground">{apiErrorMessage(error, "The repository may be private to another account.")}</p>
          <Link to="/github/repos" className="mt-3 inline-block text-xs font-medium text-primary hover:underline">Back to repositories</Link>
        </div>
      ) : (
        <>
          {/* Header */}
          <header className="flex flex-wrap items-start gap-x-6 gap-y-4">
            <div className="min-w-0 flex-1 basis-80">
              <h1 className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-2xl font-semibold tracking-tight">
                <span className="min-w-0 break-words">
                  <span className="font-normal text-muted-foreground">{repo.owner}/</span>
                  {repo.name}
                </span>
                {repo.isPrivate && (
                  <span className="flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[11px] font-medium tracking-normal text-muted-foreground">
                    <Lock className="h-3 w-3" /> Private
                  </span>
                )}
                {repo.fork && <span className="rounded-md border border-border px-1.5 py-0.5 text-[11px] font-medium tracking-normal text-muted-foreground">Fork</span>}
                {repo.archived && <span className="rounded-md border border-amber-500/40 px-1.5 py-0.5 text-[11px] font-medium tracking-normal text-amber-400">Archived</span>}
              </h1>
              {repo.description && <p className="mt-1.5 max-w-[70ch] text-pretty text-sm text-muted-foreground">{repo.description}</p>}
              <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                {repo.language && (
                  <li className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: languageColor(repo.language) }} />
                    <span className="text-foreground">{repo.language}</span>
                  </li>
                )}
                <li className="flex items-center gap-1"><Star className="h-3.5 w-3.5" /> <span className="font-semibold tabular-nums text-foreground">{compactNumber(repo.stars)}</span> stars</li>
                <li className="flex items-center gap-1"><GitFork className="h-3.5 w-3.5" /> <span className="font-semibold tabular-nums text-foreground">{compactNumber(repo.forks)}</span> forks</li>
                {repo.pushedAt && <li>Pushed {ago(repo.pushedAt)}</li>}
                {repo.topics.length > 0 && (
                  <li className="flex flex-wrap gap-1">
                    {repo.topics.map((t) => (
                      <span key={t} className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">{t}</span>
                    ))}
                  </li>
                )}
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {canEdit(fullName) && ownedProjects.length > 0 ? (
                <InlinePicker
                  label="linked DevHub project"
                  value={project?.id ?? ""}
                  options={options(fullName)}
                  onChange={(id) => link(fullName, id || null)}
                  triggerClassName={cn(
                    "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    project ? "bg-primary/10 text-primary hover:bg-primary/15" : "border border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {pending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : project ? (
                    <FolderKanban className="h-3.5 w-3.5" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  {project ? project.title : "Link to a project"}
                </InlinePicker>
              ) : (
                project && (
                  <Link to={`/projects/${project.id}`} className="flex h-8 items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 text-xs font-medium text-primary">
                    <FolderKanban className="h-3.5 w-3.5" /> {project.title}
                  </Link>
                )
              )}
              {repo.homepage && (
                <a href={repo.homepage} target="_blank" rel="noopener noreferrer" className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium transition-colors hover:bg-muted active:scale-[0.98]">
                  <Globe className="h-3.5 w-3.5" /> Website
                </a>
              )}
              <a href={repo.htmlUrl} target="_blank" rel="noopener noreferrer" className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium transition-colors hover:bg-muted active:scale-[0.98]">
                <SiGithub className="h-3.5 w-3.5" /> GitHub
              </a>
            </div>
          </header>

          {project && (
            <Link
              to={`/projects/${project.id}`}
              className="-mt-1 flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Linked to <span className="font-medium text-foreground">{project.title}</span> — issues can be added to it as tasks
              <ChevronRight className="h-3 w-3" />
            </Link>
          )}

          {/* Tabs */}
          <div role="tablist" aria-label="Repository sections" className="-mb-1 flex gap-1 overflow-x-auto border-b border-border/60 [scrollbar-width:none]">
            {([
              { value: "overview", label: "Overview", icon: FileText },
              { value: "issues", label: "Issues", icon: CircleDot, count: data.issues.length },
              { value: "pulls", label: "Pull requests", icon: GitPullRequest, count: data.pulls.length },
              { value: "commits", label: "Commits", icon: GitBranch, count: data.commits.length },
            ] as const).map((t) => (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={tab === t.value}
                onClick={() => setTab(t.value)}
                className={cn(
                  "-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                  tab === t.value ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
                {"count" in t && <span className="rounded bg-muted px-1.5 text-[11px] tabular-nums text-muted-foreground">{t.count}</span>}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_19rem] 2xl:grid-cols-[minmax(0,1fr)_22rem]">
              <Box title={<><FileText className="h-3.5 w-3.5 text-muted-foreground" /> README</>}>
                {data.readme ? (
                  <div className="px-5 py-5 sm:px-7 sm:py-6">
                    <RepoReadme markdown={data.readme} fullName={fullName} branch={repo.defaultBranch ?? "HEAD"} />
                  </div>
                ) : (
                  <div className="px-4 py-4">
                    <p className="pb-3 text-sm text-muted-foreground">This repository has no README. Latest commits:</p>
                    <CommitList commits={data.commits.slice(0, 6)} showRepo={false} />
                  </div>
                )}
              </Box>
              <Sidebar data={data} />
            </div>
          )}

          {tab === "issues" && (
            <Box>
              {data.issues.length === 0 ? (
                <Empty text="No open issues." />
              ) : (
                <ul className="p-1.5">
                  {data.issues.map((i) => (
                    <li key={i.number} className="group grid grid-cols-[1rem_minmax(0,1fr)_auto] items-start gap-x-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/40">
                      <CircleDot className="mt-0.5 h-4 w-4 text-emerald-400" />
                      <a href={i.htmlUrl} target="_blank" rel="noopener noreferrer" className="min-w-0 focus-visible:outline-2 focus-visible:outline-ring">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-sm font-medium leading-snug group-hover:text-primary">{i.title}</span>
                          {i.labels.map((l) => <Label key={l.name} {...l} />)}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          <span className="tabular-nums">#{i.number}</span> · opened {ago(i.createdAt)} by {i.authorLogin}
                        </span>
                      </a>
                      <span className="flex items-center gap-3">
                        {i.comments > 0 && (
                          <span className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground"><MessageSquare className="h-3 w-3" /> {i.comments}</span>
                        )}
                        {project && (
                          <button
                            type="button"
                            onClick={() => importIssue(i)}
                            disabled={!!imports[i.number]}
                            title={`Add as a task in ${project.title}`}
                            className={cn(
                              "flex h-7 items-center gap-1 rounded-md border border-border bg-background/60 px-2 text-[11px] font-medium text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground active:scale-[0.97] disabled:opacity-80",
                              !imports[i.number] && "sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                            )}
                          >
                            {imports[i.number] === "busy" ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : imports[i.number] === "done" ? (
                              <><Check className="h-3 w-3 text-emerald-400" /> Added</>
                            ) : (
                              <><Plus className="h-3 w-3" /> Task</>
                            )}
                          </button>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Box>
          )}

          {tab === "pulls" && (
            <Box>
              {data.pulls.length === 0 ? (
                <Empty icon={GitPullRequest} text="No open pull requests." />
              ) : (
                <ul className="p-1.5">
                  {data.pulls.map((p) => (
                    <li key={p.number}>
                      <a href={p.htmlUrl} target="_blank" rel="noopener noreferrer" className="group grid grid-cols-[1rem_minmax(0,1fr)_auto] items-start gap-x-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/40">
                        {p.draft ? <GitPullRequestDraft className="mt-0.5 h-4 w-4 text-muted-foreground" /> : <GitPullRequest className="mt-0.5 h-4 w-4 text-emerald-400" />}
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-sm font-medium leading-snug group-hover:text-primary">{p.title}</span>
                            {p.draft && <span className="rounded-md border border-border px-1.5 text-[10px] font-medium leading-4 text-muted-foreground">Draft</span>}
                            {p.labels.map((l) => <Label key={l.name} {...l} />)}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            <span className="tabular-nums">#{p.number}</span> · opened {ago(p.createdAt)} by {p.authorLogin}
                          </span>
                        </span>
                        {p.branch && (
                          <code className="hidden max-w-48 truncate rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground sm:block">{p.branch}</code>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Box>
          )}

          {tab === "commits" && (
            <Box>
              {data.commits.length === 0 ? (
                <Empty icon={GitBranch} text="No commits yet." />
              ) : (
                <div className="p-1.5">
                  <CommitList commits={allCommits ? data.commits : data.commits.slice(0, 15)} showRepo={false} />
                  {data.commits.length > 15 && (
                    <button
                      type="button"
                      onClick={() => setAllCommits((v) => !v)}
                      className="mt-1 w-full rounded-lg px-2.5 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                    >
                      {allCommits ? "Show fewer" : `Show all ${data.commits.length}`}
                    </button>
                  )}
                </div>
              )}
            </Box>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default GithubRepo;
