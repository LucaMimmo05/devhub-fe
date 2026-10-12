import type { TaskType } from "@/types/taskType";
import { differenceInCalendarDays, format } from "date-fns";
import PriorityBadge from "./PriorityBadge";
import { cn } from "@/lib/utils";

const priorityLabel: Record<string, string> = {
  LOW: "Low", MEDIUM: "Medium", HIGH: "High",
};

const priorityDot: Record<string, string> = {
  HIGH:   "bg-red-400",
  MEDIUM: "bg-yellow-400",
  LOW:    "bg-emerald-400",
};

const statusDot: Record<string, string> = {
  PENDING:     "border-muted-foreground/60",
  IN_PROGRESS: "border-primary bg-primary/30",
  COMPLETED:   "border-emerald-400 bg-emerald-400",
};

// "Today", "Tomorrow", "3d late", or a short date for anything further out.
const dueLabel = (d?: string) => {
  if (!d) return null;
  const days = differenceInCalendarDays(new Date(d), new Date());
  if (days < 0) return { text: `${-days}d late`, late: true };
  if (days === 0) return { text: "Today", late: false };
  if (days === 1) return { text: "Tomorrow", late: false };
  return { text: format(new Date(d), "d MMM"), late: false };
};

const Task = ({ task, onClick }: { task: TaskType; onClick?: () => void }) => {
  const due = dueLabel(task.dueDate);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-10 w-full items-center gap-3 rounded-lg px-2.5 text-left transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring active:bg-muted"
    >
      <span
        className={cn(
          "h-3 w-3 shrink-0 rounded-full border-[1.5px]",
          statusDot[task.status] ?? statusDot.PENDING
        )}
        aria-label={task.status}
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm font-medium",
          task.status === "COMPLETED" && "line-through text-muted-foreground"
        )}
      >
        {task.title}
      </span>
      {task.projectTitle && (
        <span className="hidden max-w-[30%] truncate text-xs text-muted-foreground @lg:block">
          {task.projectTitle}
        </span>
      )}
      {due && (
        <span
          className={cn(
            "shrink-0 text-right text-xs tabular-nums @md:w-16",
            due.late ? "font-medium text-red-400" : "text-muted-foreground"
          )}
        >
          {due.text}
        </span>
      )}
      {/* Narrow containers get a dot instead of the full badge */}
      <span
        className={cn("h-2 w-2 shrink-0 rounded-full @md:hidden", priorityDot[task.priority])}
        aria-label={`${priorityLabel[task.priority] ?? task.priority} priority`}
      />
      <PriorityBadge data={task.priority} className="hidden w-14 justify-center px-0 text-[10px] @md:inline-flex">
        {priorityLabel[task.priority] ?? task.priority}
      </PriorityBadge>
    </button>
  );
};

export default Task;
