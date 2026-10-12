import type { ProjectType } from "@/types/projectType";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import PriorityBadge from "@/components/ui/PriorityBadge";
import {
  MemberStack,
  ProjectAvatar,
  ProjectMenu,
  TaskProgress,
  type ProjectActions,
} from "./projectParts";
import { priorityLabel, relativeDue, statusLabel, type TaskStats } from "./projectUtils";

// Shared column template for the header and every row. From @3xl the row becomes
// a table (project, status, tasks, due); priority and team join from @5xl.
export const ROW_GRID =
  "@3xl:grid @3xl:items-center @3xl:gap-4 @3xl:grid-cols-[minmax(0,1fr)_7rem_9rem_8.5rem_2rem] @5xl:grid-cols-[minmax(0,1fr)_7rem_5.5rem_10rem_9rem_5rem_2rem]";

export const ProjectListHeader = () => (
  <div
    className={cn(
      "hidden border-b border-border/60 px-4 py-2.5 text-xs font-medium text-muted-foreground",
      ROW_GRID
    )}
  >
    <span>Project</span>
    <span>Status</span>
    <span className="hidden @5xl:block">Priority</span>
    <span>Tasks</span>
    <span>Due</span>
    <span className="hidden @5xl:block">Team</span>
    <span />
  </div>
);

type ProjectRowProps = ProjectActions & { project: ProjectType; stats?: TaskStats };

const ProjectRow = ({ project, stats, ...actions }: ProjectRowProps) => {
  const due = relativeDue(project.dueDate, project.status);

  const dueNode = due ? (
    <span className="tabular-nums">
      {due.label}
      {due.rel && (
        <span className={cn(due.late ? "font-medium text-red-400" : "text-muted-foreground/70")}> · {due.rel}</span>
      )}
    </span>
  ) : (
    <span className="text-muted-foreground/60">—</span>
  );

  return (
    <div
      className={cn(
        "group relative border-b border-border/60 px-4 py-3 transition-colors last:border-0 hover:bg-muted/40 focus-within:bg-muted/40",
        project.status === "ARCHIVED" && "opacity-70",
        ROW_GRID
      )}
    >
      {/* Project: always visible; on narrow containers the menu sits on this line */}
      <div className="flex min-w-0 items-center gap-3">
        <ProjectAvatar project={project} size="sm" />
        <div className="min-w-0 flex-1">
          <Link
            to={`/projects/${project.id}`}
            className="block truncate text-sm font-semibold after:absolute after:inset-0 focus-visible:outline-none"
          >
            {project.title}
          </Link>
          <p className="truncate text-xs text-muted-foreground">{project.description || "No description"}</p>
        </div>
        <ProjectMenu project={project} {...actions} className="-mr-2 @3xl:hidden" />
      </div>

      {/* Wide: one cell per column */}
      <div className="hidden @3xl:block">
        <PriorityBadge data={project.status}>{statusLabel[project.status] ?? project.status}</PriorityBadge>
      </div>
      <div className="hidden @5xl:block">
        <PriorityBadge data={project.priority}>{priorityLabel[project.priority] ?? project.priority}</PriorityBadge>
      </div>
      <TaskProgress stats={stats} className="hidden @3xl:flex" />
      <div className="hidden truncate text-sm @3xl:block">{dueNode}</div>
      <div className="hidden @5xl:block">
        <MemberStack members={project.members ?? []} />
      </div>
      <ProjectMenu project={project} {...actions} className="hidden @3xl:inline-flex" />

      {/* Narrow: badges, progress and due stacked under the title */}
      <div className="mt-2.5 flex flex-col gap-2.5 pl-11 @3xl:hidden">
        <div className="flex flex-wrap items-center gap-1.5">
          <PriorityBadge data={project.status} className="px-1.5 text-[10px]">
            {statusLabel[project.status] ?? project.status}
          </PriorityBadge>
          <PriorityBadge data={project.priority} className="px-1.5 text-[10px]">
            {priorityLabel[project.priority] ?? project.priority}
          </PriorityBadge>
          <span className="ml-auto text-xs text-muted-foreground">{dueNode}</span>
        </div>
        <TaskProgress stats={stats} />
      </div>
    </div>
  );
};

export default ProjectRow;
