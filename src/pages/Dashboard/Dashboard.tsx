import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { differenceInCalendarDays, format } from "date-fns";
import { CheckCircle2, FileText, FolderGit2 } from "lucide-react";
import PageContainer from "@/layouts/PageContainer";
import { cn } from "@/lib/utils";
import Task from "@/components/ui/Task";
import TaskModal from "@/components/ui/TaskModal";
import QuickNote from "@/components/ui/QuickNote";
import PriorityBadge from "@/components/ui/PriorityBadge";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardSection, { SectionEmpty, SectionRowsSkeleton } from "@/components/ui/DashboardSection";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/hooks/queries/useProjects";
import { useMyTasks } from "@/hooks/queries/useTasks";
import { useNotes } from "@/hooks/queries/useNotes";
import { useCommands } from "@/hooks/queries/useCommands";
import type { TaskType } from "@/types/taskType";

const statusLabel: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

const MAX_TASKS = 10;
const MAX_PROJECTS = 5;
const MAX_NOTES = 5;

const greeting = (hour: number) =>
  hour < 5 ? "Good evening" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

const isOpen = (t: TaskType) => t.status === "PENDING" || t.status === "IN_PROGRESS";
const daysUntil = (d?: string) => (d ? differenceInCalendarDays(new Date(d), new Date()) : null);

type TaskGroup = { label: string; tasks: TaskType[]; tone?: "danger" };

// Open tasks bucketed by urgency, capped at MAX_TASKS rows overall.
const groupTasks = (tasks: TaskType[]): TaskGroup[] => {
  const open = tasks
    .filter(isOpen)
    .sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, MAX_TASKS);

  const groups: TaskGroup[] = [
    { label: "Overdue", tasks: [], tone: "danger" },
    { label: "Today", tasks: [] },
    { label: "Upcoming", tasks: [] },
    { label: "No due date", tasks: [] },
  ];
  for (const t of open) {
    const days = daysUntil(t.dueDate);
    if (days === null) groups[3].tasks.push(t);
    else if (days < 0) groups[0].tasks.push(t);
    else if (days === 0) groups[1].tasks.push(t);
    else groups[2].tasks.push(t);
  }
  return groups.filter((g) => g.tasks.length > 0);
};

type Stat = {
  label: string;
  value: number | undefined;
  hint?: string;
  to: string;
  tone?: "danger";
};

const StatTile = ({ label, value, hint, to, tone }: Stat) => (
  <Link
    to={to}
    className="group flex flex-col gap-1 bg-card/60 px-4 py-3 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
  >
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    {value === undefined ? (
      <Skeleton className="my-1 h-6 w-10" />
    ) : (
      <span
        className={cn(
          "text-2xl font-semibold leading-none tracking-tight tabular-nums",
          tone === "danger" && value > 0 && "text-red-400"
        )}
      >
        {value}
      </span>
    )}
    <span className="truncate text-xs text-muted-foreground/80">{hint ?? " "}</span>
  </Link>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);

  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: tasks, isLoading: tasksLoading } = useMyTasks();
  const { data: notes, isLoading: notesLoading } = useNotes();
  const { data: commands } = useCommands();

  const taskGroups = useMemo(() => groupTasks(tasks ?? []), [tasks]);

  const openTasks = tasks?.filter(isOpen);
  const inProgress = tasks?.filter((t) => t.status === "IN_PROGRESS").length ?? 0;
  const overdue = openTasks?.filter((t) => (daysUntil(t.dueDate) ?? 0) < 0).length;
  const dueToday = openTasks?.filter((t) => daysUntil(t.dueDate) === 0).length ?? 0;
  const activeProjects =
    projects?.filter((p) => p.status === "PENDING" || p.status === "IN_PROGRESS").length ?? 0;

  const now = new Date();
  const summary =
    openTasks === undefined
      ? null
      : dueToday > 0
        ? `${dueToday} task${dueToday > 1 ? "s" : ""} due today`
        : openTasks.length > 0
          ? "Nothing due today"
          : "All caught up";

  const stats: Stat[] = [
    { label: "Open tasks", value: openTasks?.length, hint: `${inProgress} in progress`, to: "/tasks" },
    { label: "Overdue", value: overdue, hint: `${dueToday} due today`, to: "/tasks", tone: "danger" },
    { label: "Projects", value: projects?.length, hint: `${activeProjects} active`, to: "/projects" },
    {
      label: "Notes",
      value: notes?.length,
      hint: commands ? `${commands.length} saved command${commands.length !== 1 ? "s" : ""}` : undefined,
      to: "/notes",
    },
  ];

  return (
    <PageContainer className="gap-4 lg:gap-5">
      {/* Greeting */}
      <div className="min-w-0">
        <h2 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
          {greeting(now.getHours())}
          {user?.firstName ? `, ${user.firstName}` : ""}
        </h2>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {format(now, "EEEE d MMMM")}
          {summary && <> · {summary}</>}
        </p>
      </div>

      {/* Stats: one bordered strip, cells separated by 1px gaps */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
        {stats.map((s) => (
          <StatTile key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
        {/* My tasks */}
        <DashboardSection
          title="My tasks"
          count={openTasks?.length}
          action={{ label: "View all", to: "/tasks" }}
          className="lg:col-span-7 xl:col-span-8"
        >
          {tasksLoading ? (
            <SectionRowsSkeleton rows={6} />
          ) : taskGroups.length > 0 ? (
            <div className="flex flex-col gap-1">
              {taskGroups.map((group) => (
                <div key={group.label}>
                  <p
                    className={cn(
                      "px-2.5 pb-0.5 pt-2 text-[11px] font-medium text-muted-foreground",
                      group.tone === "danger" && "text-red-400/90"
                    )}
                  >
                    {group.label}
                  </p>
                  {group.tasks.map((task) => (
                    <Task key={task.id} task={task} onClick={() => setEditingTask(task)} />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <SectionEmpty
              icon={<CheckCircle2 className="h-4 w-4" />}
              text="No open tasks. You're all caught up."
              cta={{ label: "New task", to: "/tasks/new" }}
            />
          )}
        </DashboardSection>

        {/* Side column: stacks on lg+, sits side by side on md */}
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:col-span-5 lg:grid-cols-1 xl:col-span-4">
          <DashboardSection
            title="Projects"
            count={projects?.length}
            action={{ label: "View all", to: "/projects" }}
          >
            {projectsLoading ? (
              <SectionRowsSkeleton rows={3} />
            ) : projects && projects.length > 0 ? (
              projects.slice(0, MAX_PROJECTS).map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring active:bg-muted"
                >
                  {project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt=""
                      className="h-7 w-7 shrink-0 rounded-md object-cover"
                    />
                  ) : (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                      {project.title.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium leading-snug">{project.title}</span>
                    <span className="block truncate text-xs leading-snug text-muted-foreground">
                      {project.dueDate
                        ? `Due ${format(new Date(project.dueDate), "d MMM")}`
                        : project.description || "No due date"}
                    </span>
                  </span>
                  <PriorityBadge data={project.status} className="px-1.5 text-[10px]">
                    {statusLabel[project.status] ?? project.status}
                  </PriorityBadge>
                </button>
              ))
            ) : (
              <SectionEmpty
                icon={<FolderGit2 className="h-4 w-4" />}
                text="No projects yet"
                cta={{ label: "Create", to: "/projects/new" }}
              />
            )}
          </DashboardSection>

          <DashboardSection
            title="Recent notes"
            count={notes?.length}
            action={{ label: "View all", to: "/notes" }}
          >
            {notesLoading ? (
              <SectionRowsSkeleton rows={3} />
            ) : notes && notes.length > 0 ? (
              notes
                .slice(0, MAX_NOTES)
                .map((note) => (
                  <QuickNote key={note.id} note={note} onClick={() => navigate(`/notes/${note.id}`)} />
                ))
            ) : (
              <SectionEmpty
                icon={<FileText className="h-4 w-4" />}
                text="No notes yet"
                cta={{ label: "Write one", to: "/notes/new" }}
              />
            )}
          </DashboardSection>
        </div>
      </div>

      <TaskModal
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSaved={() => {}}
        canAssign={false}
        canEdit={!!user && !!editingTask?.createdByProfileId && editingTask.createdByProfileId === user.id}
      />
    </PageContainer>
  );
};

export default Dashboard;
