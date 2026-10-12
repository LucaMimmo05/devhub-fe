import { Check, FolderKanban } from "lucide-react";
import PriorityBadge from "@/components/ui/PriorityBadge";
import { priorityLabel, relativeDue } from "@/components/projects/projectUtils";
import type { TaskType } from "@/types/taskType";
import { cn } from "@/lib/utils";

const priorityDot: Record<string, string> = {
  HIGH: "bg-red-400",
  MEDIUM: "bg-yellow-400",
  LOW: "bg-emerald-400",
};

type Props = {
  task: TaskType;
  onOpen: (task: TaskType) => void;
  onToggle: (task: TaskType) => void;
  canToggle: boolean;
  /** Show the project name (Tasks page); hidden inside a project. */
  showProject?: boolean;
};

/**
 * One task line: done-circle, title (+ status/description), project, assignee,
 * deadline and priority. Must live inside an `@container` so the secondary
 * columns can hide on narrow widths.
 */
const TaskRow = ({ task, onOpen, onToggle, canToggle, showProject }: Props) => {
  const done = task.status === "COMPLETED";
  const due = relativeDue(task.dueDate, done ? "COMPLETED" : "PENDING");

  return (
    <li className="group relative flex items-center gap-3 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-muted/50">
      <button
        type="button"
        onClick={() => onToggle(task)}
        disabled={!canToggle}
        aria-label={done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        title={canToggle ? undefined : "Only the task's creator or the project owner can change it"}
        className={cn(
          "relative z-10 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed",
          done
            ? "border-emerald-400 bg-emerald-400 text-background"
            : task.status === "IN_PROGRESS"
              ? "border-primary bg-primary/20 hover:bg-primary/30"
              : "border-muted-foreground/50 hover:border-foreground"
        )}
      >
        {done && <Check className="h-3 w-3" strokeWidth={3} />}
      </button>

      {/* Stretched button: the whole row opens the task */}
      <button
        type="button"
        onClick={() => onOpen(task)}
        className="min-w-0 flex-1 text-left after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
      >
        <span className={cn("block truncate text-sm font-medium", done && "text-muted-foreground line-through")}>
          {task.title}
        </span>
        {(task.description || task.status === "IN_PROGRESS" || (showProject && task.projectTitle)) && (
          <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            {task.status === "IN_PROGRESS" && <span className="shrink-0 font-medium text-primary">In progress</span>}
            {/* On narrow widths the project moves under the title */}
            {showProject && task.projectTitle && (
              <span className="flex shrink-0 items-center gap-1 @2xl:hidden">
                <FolderKanban className="h-3 w-3" /> {task.projectTitle}
              </span>
            )}
            {task.description && <span className="truncate">{task.description}</span>}
          </span>
        )}
      </button>

      {showProject && task.projectTitle && (
        <span className="hidden w-36 shrink-0 items-center gap-1.5 truncate text-xs text-muted-foreground @2xl:flex">
          <FolderKanban className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{task.projectTitle}</span>
        </span>
      )}
      {task.assignedToUsername && (
        <span
          title={`@${task.assignedToUsername}`}
          className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-semibold uppercase text-foreground/80 @md:flex"
        >
          {task.assignedToUsername.slice(0, 2)}
        </span>
      )}
      <span
        className={cn(
          "shrink-0 text-right text-xs tabular-nums @md:w-[4.5rem]",
          due?.late ? "font-medium text-red-400" : "text-muted-foreground"
        )}
      >
        {/* Near or late deadlines read better relative; far ones as a date */}
        {due ? (due.rel && due.days <= 14 ? due.rel : due.label) : ""}
      </span>
      {/* Narrow containers get a dot instead of the full badge */}
      <span
        className={cn("h-2 w-2 shrink-0 rounded-full @md:hidden", priorityDot[task.priority])}
        aria-label={`${priorityLabel[task.priority]} priority`}
      />
      <PriorityBadge data={task.priority} className="hidden w-14 justify-center px-0 text-[10px] @md:inline-flex">
        {priorityLabel[task.priority]}
      </PriorityBadge>
    </li>
  );
};

export default TaskRow;
