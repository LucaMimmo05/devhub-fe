import type { ProjectType } from "@/types/projectType";
import { Calendar, CircleCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import PriorityBadge from "./PriorityBadge";
import {
  MemberStack,
  ProjectAvatar,
  ProjectMenu,
  TaskProgress,
  type ProjectActions,
} from "@/components/projects/projectParts";
import { priorityLabel, relativeDue, statusLabel, type TaskStats } from "@/components/projects/projectUtils";

export type ProjectProps = ProjectActions & {
  project: ProjectType;
  stats?: TaskStats;
};

const ProjectCard = ({ project, stats, ...actions }: ProjectProps) => {
  const isArchived = project.status === "ARCHIVED";
  const due = relativeDue(project.dueDate, project.status);
  const nextDue = stats?.next ? relativeDue(stats.next.dueDate, stats.next.status) : null;

  return (
    // The title link stretches over the whole card; the menu sits above it.
    <article
      className={cn(
        "group relative flex flex-col rounded-xl border border-border bg-card/60 transition-colors",
        "hover:border-primary/40 hover:bg-card focus-within:border-primary/40",
        isArchived && "opacity-70"
      )}
    >
      <div className="flex items-start gap-3.5 p-5 pb-4">
        <ProjectAvatar project={project} />
        <div className="min-w-0 flex-1">
          <Link
            to={`/projects/${project.id}`}
            className="block truncate text-base font-semibold leading-snug tracking-tight after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none"
          >
            {project.title}
          </Link>
          <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
            {project.description || "No description"}
          </p>
        </div>
        <ProjectMenu project={project} {...actions} className="-mr-2 -mt-1" />
      </div>

      <div className="flex flex-wrap items-center gap-1.5 px-5">
        <PriorityBadge data={project.status}>{statusLabel[project.status] ?? project.status}</PriorityBadge>
        <PriorityBadge data={project.priority}>{priorityLabel[project.priority] ?? project.priority}</PriorityBadge>
      </div>

      {/* Task progress + the next open task */}
      <div className="flex flex-col gap-2.5 px-5 pb-5 pt-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Tasks</span>
          <TaskProgress stats={stats} />
        </div>
        <div className="flex h-5 items-center gap-2 text-sm">
          {stats === undefined ? (
            <span className="h-3 w-1/2 animate-pulse rounded bg-primary/10" aria-hidden />
          ) : stats.next ? (
            <>
              <span className="shrink-0 text-xs text-muted-foreground">Next</span>
              <span className="min-w-0 flex-1 truncate">{stats.next.title}</span>
              {nextDue?.rel && (
                <span
                  className={cn(
                    "shrink-0 text-xs tabular-nums",
                    nextDue.late ? "font-medium text-red-400" : "text-muted-foreground"
                  )}
                >
                  {nextDue.rel}
                </span>
              )}
            </>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CircleCheck className="h-3.5 w-3.5" />
              {stats.total ? "All tasks done" : "No tasks yet"}
            </span>
          )}
        </div>
      </div>

      <footer className="mt-auto flex h-12 items-center gap-3 border-t border-border/60 px-5 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4 shrink-0" />
        {due ? (
          <span className="min-w-0 truncate tabular-nums">
            {due.label}
            {due.rel && (
              <span className={cn(due.late ? "font-medium text-red-400" : "text-muted-foreground/70")}>
                {" "}· {due.rel}
              </span>
            )}
          </span>
        ) : (
          <span>No due date</span>
        )}
        <span className="ml-auto">
          <MemberStack members={project.members ?? []} />
        </span>
      </footer>
    </article>
  );
};

export const ProjectCardSkeleton = () => (
  <div className="flex flex-col rounded-xl border border-border bg-card/60" aria-hidden>
    <div className="flex items-start gap-3.5 p-5 pb-4">
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-primary/10" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-4 w-2/5 animate-pulse rounded bg-primary/10" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-primary/10" />
      </div>
    </div>
    <div className="flex gap-1.5 px-5">
      <div className="h-5 w-20 animate-pulse rounded bg-primary/10" />
      <div className="h-5 w-14 animate-pulse rounded bg-primary/10" />
    </div>
    <div className="space-y-3 px-5 pb-5 pt-5">
      <div className="h-1.5 animate-pulse rounded-full bg-primary/10" />
      <div className="h-3 w-1/2 animate-pulse rounded bg-primary/10" />
    </div>
    <div className="h-12 border-t border-border/60" />
  </div>
);

export default ProjectCard;
