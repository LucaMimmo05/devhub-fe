import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CircleDot,
  ExternalLink,
  Eye,
  FolderKanban,
  GitBranch,
  GitFork,
  GitPullRequest,
  Globe,
  Link2,
  Loader2,
  Lock,
  MessageSquare,
  Plus,
  Scale,
  Star,
} from "lucide-react";
import PageContainer from "@/layouts/PageContainer";
import CommitList from "@/components/github/CommitList";
import ConnectGithubCard from "@/components/github/ConnectGithubCard";
import { InlinePicker } from "@/components/projects/InlineEdit";
import { ago, compactNumber, languageColor } from "@/components/github/githubUtils";
import { useGithubRepo, useGithubStatus } from "@/hooks/queries/useGithub";
import { useProjects, useUpdateProject } from "@/hooks/queries/useProjects";
import { useCreateTask } from "@/hooks/queries/useTasks";
import { useAuth } from "@/context/AuthContext";
import { apiErrorMessage } from "@/utils/githubAuth";
import type { GithubIssue } from "@/types/githubType";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Section = ({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) => (
  <section className="min-w-0 rounded-xl border border-border bg-card/60">
    <header className="flex h-11 items-center gap-2 border-b border-border/60 px-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      {count !== undefined && <span className="text-xs tabular-nums text-muted-foreground">{count}</span>}
    </header>
    <div className="p-1.5">{children}</div>
  </section>
);

const Empty = ({ text }: { text: string }) => <p className="px-3 py-6 text-center text-sm text-muted-foreground">{text}</p>;

/** GitHub label colours are hex without "#": tint the chip with them. */
const LabelChip = ({ name, color }: { name: string; color: string | null }) => (
  <span
    className="rounded-full border px-1.5 py-px text-[10px] font-medium"
    style={color ? { borderColor: `#${color}66`, backgroundColor: `#${color}22`, color: `#${color}` } : undefined}
  >
    {name}
  </span>
);

const GithubRepo = () => {
  const { owner = "", name = "" } = useParams();
  const fullName = `${owner}/${name}`;
  const { user } = useAuth();
  const { data: status, isLoading: statusLoading } = useGithubStatus();
  const { data, isLoading, error } = useGithubRepo(fullName);
  const { data: projects = [] } = useProjects();
  const updateProject = useUpdateProject();
  const createTask = useCreateTask();
  const [importing, setImporting] = useState<number | null>(null);
  const [imported, setImported] = useState<Set<number>>(new Set());
  const [showAllCommits, setShowAllCommits] = useState(false);

  const linkedProject = projects.find((p) => p.githubRepo?.toLowerCase() === fullName.toLowerCase());
  // Only the project owner can change its settings (the backend enforces this too).
  const ownedProjects = projects.filter((p) => p.ownerUsername === user?.username && p.status !== "ARCHIVED");
  const canEditLink = !linkedProject || linkedProject.ownerUsername === user?.username;

  const link = async (projectId: string | null) => {
    try {
      if (linkedProject && linkedProject.id !== projectId) {
        await updateProject.mutateAsync({ id: linkedProject.id, data: { githubRepo: "" } });
      }
      if (projectId) {
        await updateProject.mutateAsync({ id: projectId, data: { githubRepo: fullName } });
        toast.success("Repository linked");
      } else {
        toast.success("Repository unlinked");
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't update the link."));
    }
  };

  const importIssue = async (issue: GithubIssue) => {
    if (!linkedProject) return;
    setImporting(issue.number);
    try {
      await createTask.mutateAsync({
        title: `#${issue.number} ${issue.title}`.slice(0, 100),
        description: `Imported from GitHub: ${issue.htmlUrl}`,
        projectId: linkedProject.id,
      });
      setImported((s) => new Set(s).add(issue.number));
      toast.success(`Added #${issue.number} to ${linkedProject.title}`);
    } catch {
      toast.error("Couldn't create the task.");
    } finally {
      setImporting(null);
    }
  };

  if (!statusLoading && !status?.connected) {
    return (
      <PageContainer className="justify-center py-10">
        <ConnectGithubCard configured={!!status?.configured} />
      </PageContainer>
    );
  }

  const repo = data?.repo;
  const languageTotal = data ? Object.values(data.languages).reduce((a, b) => a + b, 0) : 0;
  const languages = data
    ? Object.entries(data.languages)
        .map(([lang, bytes]) => ({ lang, pct: languageTotal ? (bytes / languageTotal) * 100 : 0 }))
        .filter((l) => l.pct >= 0.1)
    : [];

  return (
    <PageContainer className="gap-5">
      <Link to="/github" className="-ml-1 flex w-fit items-center gap-1.5 rounded-md px-1 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> GitHub
      </Link>

      {isLoading || statusLoading ? (
        <div className="flex flex-col gap-4" aria-hidden>
          <div className="h-16 animate-pulse rounded-xl bg-primary/10" />
          <div className="h-64 animate-pulse rounded-xl bg-primary/10" />
        </div>
      ) : error || !repo || !data ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm font-medium">Couldn't open {fullName}</p>
          <p className="mt-1 text-sm text-muted-foreground">{apiErrorMessage(error, "The repository may be private to another account.")}</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-wrap items-start gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="flex flex-wrap items-center gap-2 text-xl font-semibold tracking-tight">
                <span className="text-muted-foreground">{repo.owner}/</span>
                {repo.name}
                {repo.isPrivate && (
                  <span className="flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                    <Lock className="h-3 w-3" /> Private
                  </span>
                )}
                {repo.archived && <span className="rounded-md border border-yellow-500/40 px-1.5 py-0.5 text-[11px] font-medium text-yellow-400">Archived</span>}
              </h1>
              {repo.description && <p className="mt-1 max-w-[70ch] text-sm text-muted-foreground">{repo.description}</p>}
              {repo.topics.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {repo.topics.map((t) => (
                    <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{t}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {repo.homepage && (
                <a href={repo.homepage} target="_blank" rel="noopener noreferrer" className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium hover:bg-muted">
                  <Globe className="h-3.5 w-3.5" /> Website
                </a>
              )}
              <a href={repo.htmlUrl} target="_blank" rel="noopener noreferrer" className="flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                Open on GitHub <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
            {[
              { icon: Star, label: "Stars", value: compactNumber(repo.stars) },
              { icon: GitFork, label: "Forks", value: compactNumber(repo.forks) },
              { icon: Eye, label: "Watchers", value: compactNumber(repo.watchers) },
              { icon: CircleDot, label: "Open issues", value: String(data.issues.length) },
              { icon: GitBranch, label: "Default branch", value: repo.defaultBranch ?? "—" },
              { icon: Scale, label: "License", value: repo.license && repo.license !== "NOASSERTION" ? repo.license : "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-card/60 px-4 py-3">
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</dt>
                <dd className="mt-1 truncate text-base font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="flex min-w-0 flex-col gap-5">
              <Section title="Open issues" count={data.issues.length}>
                {data.issues.length === 0 ? (
                  <Empty text="No open issues." />
                ) : (
                  <ul>
                    {data.issues.map((i) => (
                      <li key={i.number} className="group flex items-start gap-3 rounded-lg px-2.5 py-2 hover:bg-muted/50">
                        <CircleDot className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        <a href={i.htmlUrl} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1">
                          <span className="block text-sm font-medium leading-snug group-hover:text-primary">
                            {i.title} <span className="font-normal text-muted-foreground">#{i.number}</span>
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                            {i.labels.map((l) => <LabelChip key={l.name} {...l} />)}
                            <span>opened {ago(i.createdAt)} by {i.authorLogin}</span>
                            {i.comments > 0 && (
                              <span className="flex items-center gap-0.5"><MessageSquare className="h-3 w-3" /> {i.comments}</span>
                            )}
                          </span>
                        </a>
                        {linkedProject && (
                          <button
                            type="button"
                            onClick={() => importIssue(i)}
                            disabled={importing === i.number || imported.has(i.number)}
                            title={`Add as a task in ${linkedProject.title}`}
                            className="flex h-7 shrink-0 items-center gap-1 rounded-md border border-border px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-70"
                          >
                            {importing === i.number ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : imported.has(i.number) ? (
                              <><Check className="h-3 w-3 text-emerald-400" /> Added</>
                            ) : (
                              <><Plus className="h-3 w-3" /> Task</>
                            )}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <Section title="Latest commits" count={data.commits.length}>
                {data.commits.length ? (
                  <>
                    <CommitList commits={showAllCommits ? data.commits : data.commits.slice(0, 8)} showRepo={false} />
                    {data.commits.length > 8 && (
                      <button
                        type="button"
                        onClick={() => setShowAllCommits((v) => !v)}
                        className="w-full rounded-lg px-3 py-2 text-left text-xs font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      >
                        {showAllCommits ? "Show fewer" : `Show all ${data.commits.length}`}
                      </button>
                    )}
                  </>
                ) : (
                  <Empty text="No commits yet." />
                )}
              </Section>
            </div>

            <div className="flex min-w-0 flex-col gap-5">
              {/* Project link */}
              <section className="rounded-xl border border-border bg-card/60 p-4">
                <h2 className="flex items-center gap-1.5 text-sm font-semibold"><Link2 className="h-4 w-4" /> DevHub project</h2>
                {linkedProject ? (
                  <Link to={`/projects/${linkedProject.id}`} className="mt-3 flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:border-primary/40">
                    <FolderKanban className="h-4 w-4 text-primary" /> {linkedProject.title}
                  </Link>
                ) : (
                  <p className="mt-1.5 text-xs text-muted-foreground">Link it to a project to see commits and issues there, and turn issues into tasks.</p>
                )}
                {canEditLink && ownedProjects.length > 0 && (
                  <div className="mt-3">
                    <InlinePicker
                      label="linked project"
                      value={linkedProject?.id ?? ""}
                      options={[
                        ...ownedProjects.map((p) => ({ value: p.id, label: p.title, hint: p.githubRepo && p.githubRepo !== fullName ? p.githubRepo : undefined })),
                        ...(linkedProject ? [{ value: "", label: "Unlink" }] : []),
                      ]}
                      onChange={(id) => link(id || null)}
                      triggerClassName="flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background/40 px-2.5 text-xs font-medium outline-none hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {updateProject.isPending ? "Saving…" : linkedProject ? "Change project" : "Link to a project"}
                    </InlinePicker>
                  </div>
                )}
              </section>

              {/* Languages */}
              {languages.length > 0 && (
                <section className="rounded-xl border border-border bg-card/60 p-4">
                  <h2 className="text-sm font-semibold">Languages</h2>
                  <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted">
                    {languages.map((l) => (
                      <span key={l.lang} style={{ width: `${l.pct}%`, backgroundColor: languageColor(l.lang) }} title={`${l.lang} ${l.pct.toFixed(1)}%`} />
                    ))}
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
                    {languages.map((l) => (
                      <li key={l.lang} className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: languageColor(l.lang) }} />
                        <span className="font-medium">{l.lang}</span>
                        <span className="tabular-nums text-muted-foreground">{l.pct.toFixed(1)}%</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <Section title="Open pull requests" count={data.pulls.length}>
                {data.pulls.length === 0 ? (
                  <Empty text="No open pull requests." />
                ) : (
                  <ul>
                    {data.pulls.map((p) => (
                      <li key={p.number}>
                        <a href={p.htmlUrl} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/50">
                          <GitPullRequest className={cn("mt-0.5 h-4 w-4 shrink-0", p.draft ? "text-muted-foreground" : "text-emerald-400")} />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium leading-snug group-hover:text-primary">{p.title}</span>
                            <span className="text-xs text-muted-foreground">
                              #{p.number} · {p.draft ? "draft · " : ""}{ago(p.createdAt)} by {p.authorLogin}
                            </span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              <p className="px-1 text-xs text-muted-foreground">
                Created {ago(repo.createdAt)} · last push {ago(repo.pushedAt)}
              </p>
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
};

export default GithubRepo;
