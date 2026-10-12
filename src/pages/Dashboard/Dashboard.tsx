import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, FileText, FolderGit2, Terminal } from "lucide-react";
import { toast } from "sonner";
import PageContainer from "@/layouts/PageContainer";
import { cn } from "@/lib/utils";
import TaskModal from "@/components/ui/TaskModal";
import TaskRow from "@/components/tasks/TaskRow";
import ShowMoreButton from "@/components/ui/ShowMoreButton";
import DashboardSection, { SectionEmpty, SectionRowsSkeleton } from "@/components/ui/DashboardSection";
import DashboardHero from "@/components/dashboard/DashboardHero";
import FocusTask from "@/components/dashboard/FocusTask";
import WeekStrip from "@/components/dashboard/WeekStrip";
import ProjectPulse from "@/components/dashboard/ProjectPulse";
import GithubPulse from "@/components/dashboard/GithubPulse";
import CommandShelf from "@/components/dashboard/CommandShelf";
import NotesShelf from "@/components/dashboard/NotesShelf";
import { byUrgency, daysUntil, doneWithin, groupTasks, isOpen, weekAhead } from "@/components/dashboard/dashboardUtils";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/hooks/queries/useProjects";
import { useMyTasks, useToggleTask } from "@/hooks/queries/useTasks";
import { useNotes } from "@/hooks/queries/useNotes";
import { useCommands } from "@/hooks/queries/useCommands";
import { useGithubInbox } from "@/hooks/queries/useGithub";
import { queryKeys } from "@/hooks/queries/keys";
import { updateTask } from "@/services/taskService";
import type { TaskType } from "@/types/taskType";

/** Task rows shown before "Show more", so the list ends near the fold. */
const TASK_PREVIEW = 7;

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const toggleTask = useToggleTask();
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  const [allTasks, setAllTasks] = useState(false);

  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: tasks, isLoading: tasksLoading } = useMyTasks();
  const { data: notes, isLoading: notesLoading } = useNotes();
  const { data: commands, isLoading: commandsLoading } = useCommands();
  const { data: inbox } = useGithubInbox();

  const open = (tasks ?? []).filter(isOpen).sort(byUrgency);
  const [focus, ...rest] = open;
  const visible = allTasks ? rest : rest.slice(0, TASK_PREVIEW);
  const groups = groupTasks(visible);

  const overdue = open.filter((t) => (daysUntil(t.dueDate) ?? 0) < 0).length;
  const dueToday = open.filter((t) => daysUntil(t.dueDate) === 0).length;
  const inProgress = open.filter((t) => t.status === "IN_PROGRESS").length;
  const doneWeek = doneWithin(tasks ?? [], 7);
  const dueThisWeek = open.filter((t) => {
    const d = daysUntil(t.dueDate);
    return d !== null && d <= 7;
  }).length;
  const reviews = inbox?.reviewRequests.length ?? 0;

  const canEdit = (task: TaskType | null) => !!task && !!user && task.createdByProfileId === user.id;
  const toggle = async (task: TaskType) => {
    if (!(await toggleTask(task))) toast.error("Couldn't update the task.");
  };
  const start = async (task: TaskType) => {
    try {
      await updateTask(task.id, { status: "IN_PROGRESS" });
      await queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    } catch {
      toast.error("Couldn't update the task.");
    }
  };

  // One plain sentence about the day, built from whatever is actually going on.
  const highlights = [
    dueToday > 0 && <strong key="today" className="font-medium text-foreground">{plural(dueToday, "task")} due today</strong>,
    overdue > 0 && <strong key="late" className="font-medium text-red-400">{overdue} overdue</strong>,
    reviews > 0 && <strong key="rev" className="font-medium text-amber-400">{plural(reviews, "review")} waiting on GitHub</strong>,
  ].filter(Boolean) as React.ReactNode[];
  const summary = tasksLoading ? (
    "Getting your day ready…"
  ) : highlights.length > 0 ? (
    <>
      You have{" "}
      {highlights.map((h, i) => (
        <span key={i}>
          {i > 0 && (i === highlights.length - 1 ? " and " : ", ")}
          {h}
        </span>
      ))}
      .
    </>
  ) : open.length > 0 ? (
    `Nothing due today. ${plural(open.length, "open task")} when you're ready.`
  ) : (
    "All caught up. Plan something new, or enjoy the quiet."
  );

  return (
    <PageContainer className="gap-5">
      <DashboardHero
        name={user?.firstName}
        summary={summary}
        weekDone={doneWeek}
        weekTotal={doneWeek + dueThisWeek}
        stats={[
          { label: "Due today", value: tasks && dueToday, tone: "primary", to: "/tasks" },
          { label: "Overdue", value: tasks && overdue, tone: "danger", to: "/tasks" },
          { label: "In progress", value: tasks && inProgress, to: "/tasks" },
          { label: "Projects", value: projects?.filter((p) => p.status === "PENDING" || p.status === "IN_PROGRESS").length, to: "/projects" },
        ]}
      />

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-12">
        {/* Work column */}
        <div className="flex min-w-0 flex-col gap-5 xl:col-span-8">
          {focus && (
            <FocusTask
              task={focus}
              canEdit={canEdit(focus)}
              onOpen={() => setEditingTask(focus)}
              onDone={() => toggle(focus)}
              onStart={() => start(focus)}
            />
          )}

          <DashboardSection title="My tasks" count={tasks ? open.length : undefined} action={{ label: "All tasks", to: "/tasks" }}>
            {tasksLoading ? (
              <SectionRowsSkeleton rows={6} />
            ) : open.length === 0 ? (
              <SectionEmpty
                icon={<CheckCircle2 className="h-4 w-4" />}
                text="No open tasks. You're all caught up."
                cta={{ label: "New task", to: "/tasks/new" }}
              />
            ) : (
              <>
                <div className="px-1 pb-2 pt-1">
                  <WeekStrip days={weekAhead(open)} />
                </div>
                {groups.map((g) => (
                  <div key={g.label}>
                    <p className={cn("px-2.5 pb-0.5 pt-2.5 text-[11px] font-medium text-muted-foreground", g.tone === "danger" && "text-red-400/90")}>
                      {g.label} <span className="tabular-nums opacity-60">{g.tasks.length}</span>
                    </p>
                    <ul>
                      {g.tasks.map((t) => (
                        <TaskRow key={t.id} task={t} onOpen={setEditingTask} onToggle={toggle} canToggle={canEdit(t)} showProject />
                      ))}
                    </ul>
                  </div>
                ))}
                {rest.length === 0 && <p className="px-2.5 py-3 text-sm text-muted-foreground">That's the only open task.</p>}
              </>
            )}
            {rest.length > TASK_PREVIEW && (
              <div className="-mx-1.5 -mb-1.5 mt-1.5">
                <ShowMoreButton hidden={rest.length - TASK_PREVIEW} expanded={allTasks} onToggle={() => setAllTasks((v) => !v)} />
              </div>
            )}
          </DashboardSection>

          {/* Notes and commands side by side, so neither ends up below the fold */}
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
            <DashboardSection title="Recent notes" count={notes?.length} action={{ label: "All notes", to: "/notes" }}>
              {notesLoading ? (
                <SectionRowsSkeleton rows={2} />
              ) : notes && notes.length > 0 ? (
                <NotesShelf notes={notes} />
              ) : (
                <SectionEmpty icon={<FileText className="h-4 w-4" />} text="No notes yet" cta={{ label: "Write one", to: "/notes/new" }} />
              )}
            </DashboardSection>
            <DashboardSection title="Commands" count={commands?.length} action={{ label: "All", to: "/commands" }}>
              {commandsLoading ? (
                <SectionRowsSkeleton rows={3} />
              ) : commands && commands.length > 0 ? (
                <CommandShelf commands={commands} />
              ) : (
                <SectionEmpty icon={<Terminal className="h-4 w-4" />} text="No saved commands" cta={{ label: "Add", to: "/commands/new" }} />
              )}
            </DashboardSection>
          </div>
        </div>

        {/* Context column: projects and GitHub, side by side on md, stacked on xl */}
        <div className="grid min-w-0 grid-cols-1 items-start gap-5 md:grid-cols-2 xl:col-span-4 xl:grid-cols-1">
          <DashboardSection title="Projects" count={projects?.length} action={{ label: "All", to: "/projects" }}>
            {projectsLoading ? (
              <SectionRowsSkeleton rows={3} />
            ) : projects && projects.some((p) => p.status === "PENDING" || p.status === "IN_PROGRESS") ? (
              <ProjectPulse projects={projects} />
            ) : (
              <SectionEmpty icon={<FolderGit2 className="h-4 w-4" />} text="No active projects" cta={{ label: "Create", to: "/projects/new" }} />
            )}
          </DashboardSection>

          <DashboardSection title="GitHub" action={{ label: "Open", to: "/github" }}>
            <GithubPulse />
          </DashboardSection>

        </div>
      </div>

      <TaskModal
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSaved={() => {}}
        canAssign={false}
        canEdit={canEdit(editingTask)}
      />
    </PageContainer>
  );
};

export default Dashboard;
