import { useMemo, useState } from "react";
import { ListTodo, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useToggleTask } from "@/hooks/queries/useTasks";
import TaskRow from "@/components/tasks/TaskRow";
import type { TaskType } from "@/types/taskType";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FILTERS = ["Open", "Done", "All"] as const;
type Filter = (typeof FILTERS)[number];

const isOpen = (t: TaskType) => t.status === "PENDING" || t.status === "IN_PROGRESS";

const byDue = (a: TaskType, b: TaskType) => {
  if (!a.dueDate) return 1;
  if (!b.dueDate) return -1;
  return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
};

type Props = {
  projectId: string;
  tasks: TaskType[];
  loading: boolean;
  canToggle: (task: TaskType) => boolean;
  onOpen: (task: TaskType) => void;
};

const ProjectTaskList = ({ projectId, tasks, loading, canToggle, onOpen }: Props) => {
  const [filter, setFilter] = useState<Filter>("Open");

  const counts: Record<Filter, number> = {
    Open: tasks.filter(isOpen).length,
    Done: tasks.filter((t) => t.status === "COMPLETED").length,
    All: tasks.length,
  };

  const visible = useMemo(() => {
    const list =
      filter === "Open" ? tasks.filter(isOpen) : filter === "Done" ? tasks.filter((t) => t.status === "COMPLETED") : tasks;
    // Open work first, soonest deadline first; done tasks sink to the bottom of "All".
    return [...list].sort((a, b) => Number(!isOpen(a)) - Number(!isOpen(b)) || byDue(a, b));
  }, [tasks, filter]);

  const toggleTask = useToggleTask();
  const toggle = async (task: TaskType) => {
    if (!(await toggleTask(task))) toast.error("Couldn't update the task.");
  };

  return (
    <section className="@container min-w-0 rounded-xl border border-border bg-card/60">
      <header className="flex flex-wrap items-center gap-3 border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-semibold">Tasks</h2>
        <div role="tablist" className="flex h-8 rounded-lg border border-border bg-background/40 p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                filter === f ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
              <span className="tabular-nums text-muted-foreground">{loading ? "–" : counts[f]}</span>
            </button>
          ))}
        </div>
        <Link
          to={`/projects/${projectId}/tasks/new`}
          className="ml-auto flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Plus className="h-3.5 w-3.5" /> Add task
        </Link>
      </header>

      {loading ? (
        <div className="flex flex-col gap-1 p-2" aria-hidden>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex h-12 items-center gap-3 px-2">
              <div className="h-4 w-4 animate-pulse rounded-full bg-primary/10" />
              <div className="h-3 flex-1 animate-pulse rounded bg-primary/10" style={{ maxWidth: `${60 - i * 8}%` }} />
              <div className="h-4 w-14 animate-pulse rounded bg-primary/10" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
          <ListTodo className="h-6 w-6 text-muted-foreground/50" />
          <p className="text-sm font-medium">
            {tasks.length === 0 ? "No tasks yet" : filter === "Open" ? "Nothing left to do" : "No completed tasks yet"}
          </p>
          <p className="text-xs text-muted-foreground">
            {tasks.length === 0
              ? "Break the project into tasks to track progress."
              : filter === "Open"
                ? "Every task in this project is done."
                : "Tick a task's circle to mark it done."}
          </p>
        </div>
      ) : (
        <ul className="p-1.5">
          {visible.map((task) => (
            <TaskRow key={task.id} task={task} onOpen={onOpen} onToggle={toggle} canToggle={canToggle(task)} />
          ))}
        </ul>
      )}
    </section>
  );
};

export default ProjectTaskList;
