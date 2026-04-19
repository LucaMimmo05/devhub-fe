import type { TaskType } from "@/types/taskType";
import PriorityBadge from "./PriorityBadge";
import { cn } from "@/lib/utils";

const priorityLabel: Record<string, string> = {
  LOW: "Low", MEDIUM: "Medium", HIGH: "High",
};

const statusDot: Record<string, string> = {
  PENDING:     "bg-muted-foreground",
  IN_PROGRESS: "bg-primary",
  COMPLETED:   "bg-emerald-400",
};

const formatDate = (d?: string) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

const Task = ({ task }: { task: TaskType }) => (
  <div className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0 group">
    <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", statusDot[task.status] ?? "bg-muted-foreground")} />
    <div className="flex-1 min-w-0">
      <p className={cn(
        "text-sm font-medium truncate leading-snug",
        task.status === "COMPLETED" && "line-through text-muted-foreground"
      )}>
        {task.title}
      </p>
      <div className="flex items-center gap-2 mt-0.5">
        {task.projectTitle && (
          <span className="text-xs text-muted-foreground truncate">{task.projectTitle}</span>
        )}
        {task.dueDate && (
          <span className="text-xs text-muted-foreground/60 shrink-0">{formatDate(task.dueDate)}</span>
        )}
      </div>
    </div>
    <PriorityBadge data={task.priority} className="shrink-0 text-[10px] px-1.5 py-0.5">
      {priorityLabel[task.priority] ?? task.priority}
    </PriorityBadge>
  </div>
);

export default Task;
