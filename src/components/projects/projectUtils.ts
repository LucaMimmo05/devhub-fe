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
