import type { ProjectType } from "@/types/projectType";
import type { Priority, Status } from "@/types/PriorityAndStatusType";
import type { TaskType } from "@/types/taskType";
import { differenceInCalendarDays, format } from "date-fns";
import type { SegmentedOption } from "@/components/ui/SegmentedPicker";

export const priorityLabel: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const statusLabel: Record<Status, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

const isOpenStatus = (s: Status) => s === "PENDING" || s === "IN_PROGRESS";

// Relative deadline: "in 6d", "today", "3d late". Lateness only matters while open.
export const relativeDue = (dueDate: string | undefined, status: Status) => {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  const days = differenceInCalendarDays(date, new Date());
  const sameYear = date.getFullYear() === new Date().getFullYear();
  const label = format(date, sameYear ? "d MMM" : "d MMM yyyy");
  if (!isOpenStatus(status)) return { label, rel: null, late: false, days };
  if (days < 0) return { label, rel: `${-days}d late`, late: true, days };
  if (days === 0) return { label, rel: "today", late: false, days };
  return { label, rel: `in ${days}d`, late: false, days };
};

export type TaskStats = {
  total: number;
  done: number;
  inProgress: number;
  /** Open tasks past their due date. */
  overdue: number;
  next?: TaskType;
};

export const taskStats = (tasks: TaskType[] | undefined): TaskStats | undefined => {
  if (!tasks) return undefined;
  const relevant = tasks.filter((t) => t.status !== "ARCHIVED");
  const open = relevant.filter((t) => isOpenStatus(t.status));
  const next = [...open].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  })[0];
  return {
    total: relevant.length,
    done: relevant.filter((t) => t.status === "COMPLETED").length,
    inProgress: relevant.filter((t) => t.status === "IN_PROGRESS").length,
    overdue: open.filter((t) => t.dueDate && differenceInCalendarDays(new Date(t.dueDate), new Date()) < 0).length,
    next,
  };
};

export const STATUS_SEGMENTS: SegmentedOption<"PENDING" | "IN_PROGRESS" | "COMPLETED">[] = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In progress", activeClassName: "bg-primary/15 text-primary" },
  { value: "COMPLETED", label: "Done", activeClassName: "bg-emerald-500/15 text-emerald-400" },
];

export const PRIORITY_SEGMENTS: SegmentedOption<"LOW" | "MEDIUM" | "HIGH">[] = [
  { value: "LOW", label: "Low", activeClassName: "bg-emerald-500/15 text-emerald-400" },
  { value: "MEDIUM", label: "Medium", activeClassName: "bg-yellow-500/15 text-yellow-400" },
  { value: "HIGH", label: "High", activeClassName: "bg-red-500/15 text-red-400" },
];

export type Health = "done" | "overdue" | "at-risk" | "on-track" | "idle";

/**
 * A one-word read of a project: overdue (deadline passed), at risk (late tasks, or the deadline
 * is within a week with less than 70% done), on track, idle (no tasks yet) or done.
 */
export const projectHealth = (project: ProjectType, stats?: TaskStats): Health => {
  if (project.status === "COMPLETED" || project.status === "ARCHIVED") return "done";
  const days = project.dueDate ? differenceInCalendarDays(new Date(project.dueDate), new Date()) : null;
  if (days !== null && days < 0) return "overdue";
  if (!stats) return "on-track";
  if (stats.total === 0) return "idle";
  const pct = stats.done / stats.total;
  if (stats.overdue > 0 || (days !== null && days <= 7 && pct < 0.7)) return "at-risk";
  return "on-track";
};

export const HEALTH: Record<Health, { label: string; className: string; dot: string }> = {
  "on-track": { label: "On track", className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
  "at-risk": { label: "At risk", className: "text-amber-400 bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400" },
  overdue: { label: "Overdue", className: "text-red-400 bg-red-500/10 border-red-500/20", dot: "bg-red-400" },
  idle: { label: "No tasks", className: "text-muted-foreground bg-muted/40 border-border", dot: "bg-muted-foreground" },
  done: { label: "Done", className: "text-muted-foreground bg-muted/40 border-border", dot: "bg-muted-foreground" },
};

// Muted identity colours: enough to tell projects apart at a glance without shouting.
const ACCENTS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#f97316", "#14b8a6"];

/** A stable colour per project, derived from its id. */
export const projectAccent = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return ACCENTS[h % ACCENTS.length];
};
