import type { ProjectType } from "@/types/projectType";
import { ArrowRight, Calendar, CircleCheck, Signal } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  MemberStack,
  ProjectAvatar,
  ProjectMenu,
  type ProjectActions,
} from "@/components/projects/projectParts";
import {
  HEALTH,
  priorityLabel,
  projectAccent,
  projectHealth,
  relativeDue,
  statusLabel,
  type TaskStats,
} from "@/components/projects/projectUtils";

export type ProjectProps = ProjectActions & {
  project: ProjectType;
  stats?: TaskStats;
};

const priorityTone: Record<string, string> = { HIGH: "text-red-400", MEDIUM: "text-amber-400", LOW: "text-emerald-400" };
const statusDot: Record<string, string> = {
  PENDING: "bg-muted-foreground",
  IN_PROGRESS: "bg-primary",
  COMPLETED: "bg-emerald-400",
  ARCHIVED: "bg-muted-foreground/50",
};

/** Done / in progress / to do as one segmented bar, with the share done as a number. */
export const ProgressBreakdown = ({ stats, accent }: { stats?: TaskStats; accent: string }) => {
  if (!stats) {
    return (
      <div className="flex flex-col gap-2" aria-hidden>
        <div className="h-6 w-14 animate-pulse rounded bg-primary/10" />
        <div className="h-1.5 animate-pulse rounded-full bg-primary/10" />
      </div>
    );
  }
  const { total, done, inProgress, overdue } = stats;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const w = (n: number) => `${total ? (n / total) * 100 : 0}%`;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-semibold leading-none tracking-tight tabular-nums">
          {pct}
          <span className="ml-0.5 text-sm font-medium text-muted-foreground">%</span>
        </span>
        <span className="text-xs tabular-nums text-muted-foreground">
          {total ? <>{done} of {total} tasks</> : "No tasks yet"}
          {overdue > 0 && <span className="font-medium text-red-400"> · {overdue} late</span>}
        </span>
      </div>
      <div
        className="flex h-1.5 gap-px overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${done} done, ${inProgress} in progress, ${total - done - inProgress} to do`}
      >
        <span className="h-full transition-[width] duration-500" style={{ width: w(done), backgroundColor: accent }} />
        <span className="h-full transition-[width] duration-500" style={{ width: w(inProgress), backgroundColor: `${accent}66` }} />
      </div>
    </div>
  );
};

const ProjectCard = ({ project, stats, ...actions }: ProjectProps) => {
  const isArchived = project.status === "ARCHIVED";
  const accent = projectAccent(project.id);
  const due = relativeDue(project.dueDate, project.status);
  const nextDue = stats?.next ? relativeDue(stats.next.dueDate, stats.next.status) : null;
  const health = HEALTH[projectHealth(project, stats)];

  return (
    // The title link stretches over the whole card; the menu sits above it.
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card/60 transition-[border-color,background-color,transform] duration-200",
        "hover:-translate-y-px hover:border-foreground/15 hover:bg-card focus-within:border-foreground/20",
        isArchived && "opacity-70"
      )}
    >
      {/* Identity: a hairline and a soft glow in the project's colour */}
      <span className="absolute inset-x-0 top-0 h-px" style={{ backgroundImage: `linear-gradient(90deg, ${accent}, transparent 70%)` }} />
      <span
        className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundColor: `${accent}26` }}
      />

      <div className="relative flex items-start gap-3.5 p-5 pb-3">
        <ProjectAvatar project={project} />
        <div className="min-w-0 flex-1">
          <Link
            to={`/projects/${project.id}`}
            className="block truncate text-base font-semibold leading-snug tracking-tight after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none"
          >
            {project.title}
          </Link>
          <p className="mt-0.5 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
            {project.description || "No description"}
          </p>
        </div>
        <ProjectMenu project={project} {...actions} className="-mr-2 -mt-1" />
      </div>

      <div className="relative flex flex-wrap items-center gap-x-3.5 gap-y-1.5 px-5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[project.status])} />
          {statusLabel[project.status] ?? project.status}
        </span>
        <span className={cn("flex items-center gap-1", priorityTone[project.priority])}>
          <Signal className="h-3.5 w-3.5" /> {priorityLabel[project.priority] ?? project.priority}
        </span>
        {project.githubRepo && (
          <span className="flex min-w-0 items-center gap-1.5">
            <SiGithub className="h-3 w-3 shrink-0" />
            <span className="truncate">{project.githubRepo.split("/")[1]}</span>
          </span>
        )}
      </div>

      <div className="relative flex flex-col gap-3 px-5 pb-4 pt-4">
        <ProgressBreakdown stats={stats} accent={accent} />
        <div className="flex h-5 items-center gap-2 text-sm">
          {stats === undefined ? (
            <span className="h-3 w-1/2 animate-pulse rounded bg-primary/10" aria-hidden />
          ) : stats.next ? (
            <>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{stats.next.title}</span>
              {nextDue?.rel && (
                <span className={cn("shrink-0 text-xs tabular-nums", nextDue.late ? "font-medium text-red-400" : "text-muted-foreground")}>
                  {nextDue.rel}
                </span>
              )}
            </>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CircleCheck className="h-3.5 w-3.5" />
              {stats.total ? "All tasks done" : "Add the first task to get going"}
            </span>
          )}
        </div>
      </div>

      <footer className="relative mt-auto flex h-12 items-center gap-3 border-t border-border/60 px-5 text-sm">
        <span className={cn("flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[11px] font-medium", health.className)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", health.dot)} />
          {health.label}
        </span>
        <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          {due ? (
            <span className="truncate text-xs tabular-nums">
              {due.label}
              {due.rel && <span className={cn(due.late ? "font-medium text-red-400" : "text-muted-foreground/70")}> · {due.rel}</span>}
            </span>
          ) : (
            <span className="text-xs">No due date</span>
          )}
        </span>
        <span className="ml-auto">
          <MemberStack members={project.members ?? []} />
        </span>
      </footer>
    </article>
  );
};

export const ProjectCardSkeleton = () => (
  <div className="flex flex-col rounded-xl border border-border bg-card/60" aria-hidden>
    <div className="flex items-start gap-3.5 p-5 pb-3">
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-primary/10" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-4 w-2/5 animate-pulse rounded bg-primary/10" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-primary/10" />
      </div>
    </div>
    <div className="flex gap-3 px-5">
      <div className="h-3 w-20 animate-pulse rounded bg-primary/10" />
      <div className="h-3 w-14 animate-pulse rounded bg-primary/10" />
    </div>
    <div className="space-y-3 px-5 pb-4 pt-4">
      <div className="h-6 w-14 animate-pulse rounded bg-primary/10" />
      <div className="h-1.5 animate-pulse rounded-full bg-primary/10" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-primary/10" />
    </div>
    <div className="h-12 border-t border-border/60" />
  </div>
);

export default ProjectCard;
