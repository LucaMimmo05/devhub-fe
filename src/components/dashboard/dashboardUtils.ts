import { addDays, differenceInCalendarDays, isSameDay, startOfDay } from "date-fns";
import type { TaskType } from "@/types/taskType";

export const isOpen = (t: TaskType) => t.status === "PENDING" || t.status === "IN_PROGRESS";
export const daysUntil = (d?: string) => (d ? differenceInCalendarDays(new Date(d), new Date()) : null);

const PRIORITY_RANK = { HIGH: 0, MEDIUM: 1, LOW: 2 } as const;

/** Most urgent first: overdue, today, soonest; then in-progress before pending; then priority. */
export const byUrgency = (a: TaskType, b: TaskType) => {
  const da = daysUntil(a.dueDate) ?? Infinity;
  const db = daysUntil(b.dueDate) ?? Infinity;
  if (da !== db) return da - db;
  if (a.status !== b.status) return a.status === "IN_PROGRESS" ? -1 : 1;
  return (PRIORITY_RANK[a.priority as keyof typeof PRIORITY_RANK] ?? 3) - (PRIORITY_RANK[b.priority as keyof typeof PRIORITY_RANK] ?? 3);
};

export type TaskGroup = { label: string; tasks: TaskType[]; tone?: "danger" };

export const groupTasks = (open: TaskType[]): TaskGroup[] => {
  const groups: TaskGroup[] = [
    { label: "Overdue", tasks: [], tone: "danger" },
    { label: "Today", tasks: [] },
    { label: "This week", tasks: [] },
    { label: "Later", tasks: [] },
    { label: "No due date", tasks: [] },
  ];
  for (const t of open) {
    const d = daysUntil(t.dueDate);
    groups[d === null ? 4 : d < 0 ? 0 : d === 0 ? 1 : d <= 7 ? 2 : 3].tasks.push(t);
  }
  return groups.filter((g) => g.tasks.length > 0);
};

/** The next 7 days with the open tasks due on each. */
export const weekAhead = (open: TaskType[]) => {
  const today = startOfDay(new Date());
  return Array.from({ length: 7 }, (_, i) => {
    const day = addDays(today, i);
    return { day, tasks: open.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), day)) };
  });
};

/** Completed tasks touched within the last `days` days: the API has no completedAt, updatedAt is the closest. */
export const doneWithin = (tasks: TaskType[], days: number) =>
  tasks.filter((t) => t.status === "COMPLETED" && differenceInCalendarDays(new Date(), new Date(t.updatedAt)) < days).length;
