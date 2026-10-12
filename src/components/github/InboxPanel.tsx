import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  CircleCheck,
  CircleDashed,
  CircleDot,
  CircleX,
  GitPullRequest,
  GitPullRequestDraft,
  Inbox,
  Loader2,
  MessageSquare,
  Plus,
} from "lucide-react";
import { useGithubInbox } from "@/hooks/queries/useGithub";
import { useCreateTask } from "@/hooks/queries/useTasks";
import { apiErrorMessage } from "@/utils/githubAuth";
import type { GithubInboxItem } from "@/types/githubType";
import type { ProjectType } from "@/types/projectType";
import { ago, labelStyle, repoName } from "./githubUtils";
import ShowMoreButton from "@/components/ui/ShowMoreButton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Tab = "reviewRequests" | "pullRequests" | "issues";

/** Rows shown before "Show more", so the panel fits on screen next to the rest of the page. */
const PREVIEW = 4;

const TABS: { value: Tab; label: string; empty: string }[] = [
  { value: "reviewRequests", label: "Review requests", empty: "Nobody is waiting on your review." },
  { value: "pullRequests", label: "Your pull requests", empty: "You have no open pull requests." },
  { value: "issues", label: "Assigned issues", empty: "No open issues assigned to you." },
];

const REVIEW: Record<string, { label: string; className: string }> = {
  APPROVED: { label: "Approved", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
  CHANGES_REQUESTED: { label: "Changes requested", className: "border-red-500/30 bg-red-500/10 text-red-400" },
  REVIEW_REQUIRED: { label: "Review required", className: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
};

const Checks = ({ state }: { state: GithubInboxItem["checks"] }) => {
  if (!state) return null;
  const { icon: Icon, className, label } =
    state === "SUCCESS"
      ? { icon: CircleCheck, className: "text-emerald-400", label: "Checks passed" }
      : state === "FAILURE"
        ? { icon: CircleX, className: "text-red-400", label: "Checks failed" }
        : { icon: CircleDashed, className: "text-amber-400 animate-[spin_3s_linear_infinite]", label: "Checks running" };
  return (
    <span title={label} className="flex items-center">
      <Icon className={cn("h-3.5 w-3.5", className)} aria-label={label} />
    </span>
  );
};

const ItemIcon = ({ item }: { item: GithubInboxItem }) =>
  item.kind === "ISSUE" ? (
    <CircleDot className="h-4 w-4 text-emerald-400" />
  ) : item.draft ? (
    <GitPullRequestDraft className="h-4 w-4 text-muted-foreground" />
  ) : (
    <GitPullRequest className="h-4 w-4 text-emerald-400" />
  );

const InboxRow = ({
  item,
  project,
  onImport,
  importState,
}: {
  item: GithubInboxItem;
  project?: ProjectType;
  onImport?: () => void;
  importState?: "busy" | "done";
}) => {
  const review = item.reviewDecision ? REVIEW[item.reviewDecision] : null;
  return (
    <li className="group relative grid grid-cols-[1rem_minmax(0,1fr)_auto] items-start gap-x-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/40">
      <span className="pt-0.5"><ItemIcon item={item} /></span>
      <div className="min-w-0">
        <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <a
            href={item.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium leading-snug after:absolute after:inset-0 hover:text-primary focus-visible:outline-none group-focus-within:text-primary"
          >
            {item.title}
          </a>
          {item.draft && <span className="rounded-md border border-border px-1.5 text-[10px] font-medium text-muted-foreground">Draft</span>}
          {item.labels.slice(0, 3).map((l) => (
            <span key={l.name} className="rounded-md border px-1.5 text-[10px] font-medium" style={labelStyle(l.color)}>
              {l.name}
            </span>
          ))}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <Link
            to={`/github/repos/${item.repo}`}
            className="relative z-10 font-medium text-foreground/80 hover:text-primary hover:underline"
          >
            {repoName(item.repo)}
          </Link>
          <span className="tabular-nums">#{item.number}</span>
          {item.authorLogin && item.kind === "PR" && <span>by {item.authorLogin}</span>}
          <span>· updated {ago(item.updatedAt)}</span>
          {item.comments > 0 && (
            <span className="flex items-center gap-0.5 tabular-nums"><MessageSquare className="h-3 w-3" /> {item.comments}</span>
          )}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        {item.kind === "PR" ? (
          <>
            <span className="flex items-center gap-2">
              <Checks state={item.checks} />
              {review && (
                <span className={cn("rounded-md border px-1.5 py-px text-[10px] font-medium", review.className)}>{review.label}</span>
              )}
            </span>
            {(item.additions > 0 || item.deletions > 0) && (
              <span className="font-mono text-[11px] tabular-nums">
                <span className="text-emerald-400">+{item.additions}</span>{" "}
                <span className="text-red-400">−{item.deletions}</span>
              </span>
            )}
          </>
        ) : (
          project &&
          onImport && (
            <button
              type="button"
              onClick={onImport}
              disabled={!!importState}
              title={`Add as a task in ${project.title}`}
              className={cn(
                "relative z-10 flex h-7 items-center gap-1 rounded-md border border-border bg-background/60 px-2 text-[11px] font-medium text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground active:scale-[0.97] disabled:opacity-80",
                !importState && "sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
              )}
            >
              {importState === "busy" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : importState === "done" ? (
                <><Check className="h-3 w-3 text-emerald-400" /> Added</>
              ) : (
                <><Plus className="h-3 w-3" /> Task in {project.title}</>
              )}
            </button>
          )
        )}
      </div>
    </li>
  );
};

/** Open PRs and issues that need the user: review requests, their own PRs, assigned issues. */
const InboxPanel = ({ projectFor }: { projectFor: (fullName: string) => ProjectType | undefined }) => {
  const { data, isLoading, error } = useGithubInbox();
  const createTask = useCreateTask();
  const [tab, setTab] = useState<Tab | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [imports, setImports] = useState<Record<string, "busy" | "done">>({});

  // Open on the first tab with something in it.
  const active = tab ?? TABS.find((t) => (data?.[t.value].length ?? 0) > 0)?.value ?? "reviewRequests";
  const items = data?.[active] ?? [];
  const total = data ? data.reviewRequests.length + data.pullRequests.length + data.issues.length : 0;

  const importIssue = async (item: GithubInboxItem, project: ProjectType) => {
    const key = `${item.repo}#${item.number}`;
    setImports((s) => ({ ...s, [key]: "busy" }));
    try {
      await createTask.mutateAsync({
        title: `#${item.number} ${item.title}`.slice(0, 100),
        description: `Imported from GitHub: ${item.htmlUrl}`,
        projectId: project.id,
      });
      setImports((s) => ({ ...s, [key]: "done" }));
      toast.success(`Added #${item.number} to ${project.title}`);
    } catch (err) {
      setImports((s) => {
        const next = { ...s };
        delete next[key];
        return next;
      });
      toast.error(apiErrorMessage(err, "Couldn't create the task."));
    }
  };

  return (
    <section className="flex min-w-0 flex-col rounded-xl border border-border bg-card/60">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border/60 px-4 pt-3">
        <h2 className="flex items-center gap-2 pb-3 text-sm font-semibold">
          <Inbox className="h-4 w-4 text-muted-foreground" /> Inbox
          {data && <span className="text-xs font-normal tabular-nums text-muted-foreground">{total} open</span>}
        </h2>
        <div role="tablist" aria-label="Inbox" className="-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none] sm:ml-auto">
          {TABS.map((t) => {
            const count = data?.[t.value].length;
            const selected = active === t.value;
            return (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => { setTab(t.value); setExpanded(false); }}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 border-b-2 px-2 pb-2.5 pt-0.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                  selected ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
                {count !== undefined && (
                  <span
                    className={cn(
                      "min-w-4 rounded px-1 text-center text-[10px] tabular-nums",
                      count > 0 && t.value === "reviewRequests" ? "bg-amber-500/15 text-amber-400" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      <div className="p-1.5 pb-0">
        {isLoading ? (
          <div className="flex flex-col gap-1 p-1.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex h-12 items-center gap-3 px-2">
                <div className="h-4 w-4 animate-pulse rounded-full bg-primary/10" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="h-3 animate-pulse rounded bg-primary/10" style={{ width: `${60 - i * 10}%` }} />
                  <div className="h-2.5 w-1/4 animate-pulse rounded bg-primary/10" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="px-3 py-8 text-center text-sm text-muted-foreground">{apiErrorMessage(error, "Couldn't load your inbox from GitHub.")}</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 px-3 py-10 text-center">
            <CircleCheck className="h-5 w-5 text-emerald-400/70" />
            <p className="text-sm text-muted-foreground">{TABS.find((t) => t.value === active)?.empty}</p>
          </div>
        ) : (
          <ul className="flex flex-col pb-1.5">
            {(expanded ? items : items.slice(0, PREVIEW)).map((item) => {
              const project = item.kind === "ISSUE" ? projectFor(item.repo) : undefined;
              return (
                <InboxRow
                  key={`${item.repo}#${item.number}`}
                  item={item}
                  project={project}
                  onImport={project ? () => importIssue(item, project) : undefined}
                  importState={imports[`${item.repo}#${item.number}`]}
                />
              );
            })}
          </ul>
        )}
      </div>
      {items.length > PREVIEW && (
        <ShowMoreButton hidden={items.length - PREVIEW} expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
      )}
    </section>
  );
};

export default InboxPanel;
