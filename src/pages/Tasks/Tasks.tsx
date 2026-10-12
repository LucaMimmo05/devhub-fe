import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { differenceInCalendarDays } from "date-fns";
import { ListTodo, Plus, Search, X } from "lucide-react";
import PageContainer from "@/layouts/PageContainer";
import TaskModal from "@/components/ui/TaskModal";
import TaskRow from "@/components/tasks/TaskRow";
import { useMyTasks, useToggleTask } from "@/hooks/queries/useTasks";
import { useAuth } from "@/context/AuthContext";
import type { TaskType } from "@/types/taskType";
import type { Priority } from "@/types/PriorityAndStatusType";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const VIEWS = ["Open", "Done", "All"] as const;
type View = (typeof VIEWS)[number];

const PRIORITIES: { value: Priority; label: string; dot: string }[] = [
  { value: "HIGH", label: "High", dot: "bg-red-400" },
  { value: "MEDIUM", label: "Medium", dot: "bg-yellow-400" },
  { value: "LOW", label: "Low", dot: "bg-emerald-400" },
];

const isOpen = (t: TaskType) => t.status === "PENDING" || t.status === "IN_PROGRESS";

const byDue = (a: TaskType, b: TaskType) => {
  if (!a.dueDate) return 1;
  if (!b.dueDate) return -1;
  return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
};

type Group = { label: string; tasks: TaskType[]; tone?: "danger" };

// Open work bucketed by how soon it's due; done tasks get a single group, newest first.
const groupTasks = (tasks: TaskType[]): Group[] => {
  const groups: Group[] = [
    { label: "Overdue", tasks: [], tone: "danger" },
    { label: "Today", tasks: [] },
    { label: "Next 7 days", tasks: [] },
    { label: "Later", tasks: [] },
    { label: "No due date", tasks: [] },
    { label: "Done", tasks: [] },
  ];
  for (const t of [...tasks].sort(byDue)) {
    if (!isOpen(t)) {
      groups[5].tasks.push(t);
      continue;
    }
    if (!t.dueDate) {
      groups[4].tasks.push(t);
      continue;
    }
    const days = differenceInCalendarDays(new Date(t.dueDate), new Date());
    groups[days < 0 ? 0 : days === 0 ? 1 : days <= 7 ? 2 : 3].tasks.push(t);
  }
  groups[5].tasks.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  return groups.filter((g) => g.tasks.length > 0);
};

const Tasks = () => {
  const { user } = useAuth();
  const { data: tasks = [], isLoading, isError } = useMyTasks();
  const toggleTask = useToggleTask();

  const [view, setView] = useState<View>("Open");
  const [priority, setPriority] = useState<Priority | null>(null);
  const [query, setQuery] = useState("");
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  // Global search links here as /tasks?task=<id> to open that task's dialog directly.
  const [searchParams, setSearchParams] = useSearchParams();
  const linkedTaskId = searchParams.get("task");
  const openTask = editingTask ?? (linkedTaskId ? tasks.find((t) => t.id === linkedTaskId) ?? null : null);
  const closeTask = () => {
    setEditingTask(null);
    if (linkedTaskId) setSearchParams({}, { replace: true });
  };

  useEffect(() => {
    if (isError) toast.error("Couldn't load your tasks.");
  }, [isError]);

  const counts: Record<View, number> = {
    Open: tasks.filter(isOpen).length,
    Done: tasks.filter((t) => t.status === "COMPLETED").length,
    All: tasks.length,
  };

  // Filtering is client-side: the list is small and already cached (shared with the home page).
  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (view === "All" || (view === "Open" ? isOpen(t) : t.status === "COMPLETED")) &&
          (!priority || t.priority === priority) &&
          (!q ||
            t.title.toLowerCase().includes(q) ||
            t.description?.toLowerCase().includes(q) ||
            t.projectTitle?.toLowerCase().includes(q))
      ),
    [tasks, view, priority, q]
  );
  const groups = useMemo(() => groupTasks(filtered), [filtered]);
  const isFiltered = !!priority || !!q;

  // Personal list: you can change tasks you created (owners edit the rest from the project page).
  const canEdit = (task: TaskType | null) => !!task && !!user && task.createdByProfileId === user.id;

  const toggle = async (task: TaskType) => {
    if (!(await toggleTask(task))) toast.error("Couldn't update the task.");
  };

  return (
    <PageContainer className="gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" className="flex h-9 rounded-lg border border-border bg-card/60 p-0.5">
          {VIEWS.map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                view === v ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v}
              <span className="text-xs tabular-nums text-muted-foreground">{isLoading ? "–" : counts[v]}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1" role="group" aria-label="Filter by priority">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              aria-pressed={priority === p.value}
              onClick={() => setPriority((cur) => (cur === p.value ? null : p.value))}
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                priority === p.value
                  ? "border-primary/50 bg-primary/10 text-foreground"
                  : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", p.dot)} />
              {p.label}
            </button>
          ))}
        </div>

        <label className="relative ml-auto w-full sm:w-64">
          <span className="sr-only">Search tasks</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks or projects…"
            className="h-9 w-full rounded-lg border border-border bg-card/60 pl-8 pr-8 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </label>
      </div>

      <section className="@container overflow-hidden rounded-xl border border-border bg-card/60">
        {isLoading ? (
          <div className="flex flex-col gap-1 p-2" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex h-12 items-center gap-3 px-2">
                <div className="h-4 w-4 animate-pulse rounded-full bg-primary/10" />
                <div className="h-3 flex-1 animate-pulse rounded bg-primary/10" style={{ maxWidth: `${62 - i * 7}%` }} />
                <div className="h-4 w-14 animate-pulse rounded bg-primary/10" />
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <ListTodo className="h-6 w-6 text-muted-foreground/50" />
            <div>
              <p className="text-sm font-medium">
                {isFiltered
                  ? "No tasks match these filters"
                  : tasks.length === 0
                    ? "No tasks yet"
                    : view === "Open"
                      ? "Nothing left to do"
                      : "No completed tasks yet"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {isFiltered
                  ? "Try another search or priority."
                  : tasks.length === 0
                    ? "Tasks assigned to you show up here, from every project."
                    : view === "Open"
                      ? "Everything assigned to you is done."
                      : "Tick a task's circle to mark it done."}
              </p>
            </div>
            {isFiltered ? (
              <button
                type="button"
                onClick={() => { setPriority(null); setQuery(""); }}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
              >
                Clear filters
              </button>
            ) : (
              <Link
                to="/tasks/new"
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
              >
                <Plus className="h-3.5 w-3.5" /> New task
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1 p-1.5">
            {groups.map((group) => (
              <div key={group.label}>
                <p
                  className={cn(
                    "flex items-center gap-2 px-2.5 pb-1 pt-2.5 text-xs font-medium text-muted-foreground",
                    group.tone === "danger" && "text-red-400"
                  )}
                >
                  {group.label}
                  <span className="tabular-nums text-muted-foreground/60">{group.tasks.length}</span>
                </p>
                <ul>
                  {group.tasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      showProject
                      onOpen={setEditingTask}
                      onToggle={toggle}
                      canToggle={canEdit(task)}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <TaskModal
        task={openTask}
        onClose={closeTask}
        onSaved={() => {}}
        canEdit={canEdit(openTask)}
        canAssign={false}
      />
    </PageContainer>
  );
};

export default Tasks;
