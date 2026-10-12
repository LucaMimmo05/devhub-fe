import { useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Check, Loader2, UserPlus } from "lucide-react";
import PageContainer from "@/layouts/PageContainer";
import PriorityBadge from "@/components/ui/PriorityBadge";
import TaskModal from "@/components/ui/TaskModal";
import ProjectTaskList from "@/components/projects/ProjectTaskList";
import { InlineDate, InlinePicker, InlineText } from "@/components/projects/InlineEdit";
import MembersDialog from "@/components/projects/MembersDialog";
import TeamList from "@/components/projects/TeamList";
import ProjectRepoPanel from "@/components/projects/ProjectRepoPanel";
import { ProjectAvatar, ProjectMenu, TaskProgress } from "@/components/projects/projectParts";
import { priorityLabel, relativeDue, statusLabel, taskStats } from "@/components/projects/projectUtils";
import { useDeleteProject, useProject, useUpdateProject } from "@/hooks/queries/useProjects";
import { useProjectTasks } from "@/hooks/queries/useTasks";
import { useAuth } from "@/context/AuthContext";
import { queryKeys } from "@/hooks/queries/keys";
import { fromDateInput } from "@/utils/dates";
import type { ProjectRequest, ProjectType } from "@/types/projectType";
import type { Priority, Status } from "@/types/PriorityAndStatusType";
import type { TaskType } from "@/types/taskType";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_PICKER: { value: Status; label: string; dotClassName: string }[] = [
  { value: "PENDING", label: "Pending", dotClassName: "bg-muted-foreground" },
  { value: "IN_PROGRESS", label: "In progress", dotClassName: "bg-primary" },
  { value: "COMPLETED", label: "Completed", dotClassName: "bg-emerald-400" },
];

const PRIORITY_PICKER: { value: Priority; label: string; dotClassName: string }[] = [
  { value: "LOW", label: "Low", dotClassName: "bg-emerald-400" },
  { value: "MEDIUM", label: "Medium", dotClassName: "bg-yellow-400" },
  { value: "HIGH", label: "High", dotClassName: "bg-red-400" },
];

const Panel = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="rounded-xl border border-border bg-card/60">
    <header className="flex h-11 items-center justify-between border-b border-border/60 px-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      {action}
    </header>
    <div className="p-4">{children}</div>
  </section>
);

const ProjectDetails = () => {
  const { project: initialProject } = useLoaderData() as { project: ProjectType };
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: project = initialProject } = useProject(initialProject.id, initialProject);
  const { data: tasks = [], isLoading: loadingTasks } = useProjectTasks(project.id);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  const [saveState, setSaveState] = useState<"saving" | "saved" | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryClient = useQueryClient();
  const [membersOpen, setMembersOpen] = useState(false);

  const isOwner = !!user && !!project.ownerUsername && user.username === project.ownerUsername;
  const isMember = isOwner || project.members.some((m) => m.profileId === user?.id);

  const assignableMembers = useMemo(() => {
    const list: { profileId: string; username: string; firstName?: string; lastName?: string; avatarUrl?: string }[] = [
      ...(project.ownerProfileId && project.ownerUsername
        ? [{ profileId: project.ownerProfileId, username: project.ownerUsername, avatarUrl: project.ownerAvatarUrl }]
        : []),
      ...project.members.filter((m) => m.profileId !== project.ownerProfileId),
    ];
    if (user && !list.some((m) => m.profileId === user.id)) {
      list.push({ profileId: user.id, username: user.username, firstName: user.firstName, lastName: user.lastName });
    }
    return list;
  }, [project.ownerProfileId, project.ownerUsername, project.ownerAvatarUrl, project.members, user]);

  // Owner can change any task; members only the ones they created.
  const canEditTask = (task: TaskType | null) =>
    !!task && !!user && (isOwner || (isMember && task.createdByProfileId === user.id));

  const stats = taskStats(loadingTasks ? undefined : tasks);
  const open = tasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS");
  const overdue = open.filter((t) => (relativeDue(t.dueDate, t.status)?.late ?? false)).length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const pct = stats && stats.total ? Math.round((stats.done / stats.total) * 100) : 0;
  const due = relativeDue(project.dueDate, project.status);

  // Optimistic in-place edit: update the cached project right away, roll back if the request fails.
  const patch = async (data: Partial<ProjectRequest>, successMessage?: string) => {
    const key = queryKeys.projects.detail(project.id);
    const previous = queryClient.getQueryData<ProjectType>(key);
    const { clearDueDate, ...fields } = data;
    queryClient.setQueryData<ProjectType>(key, (old) =>
      old ? { ...old, ...fields, ...(clearDueDate ? { dueDate: undefined } : {}) } : old
    );
    if (savedTimer.current) clearTimeout(savedTimer.current);
    setSaveState("saving");
    try {
      await updateProject.mutateAsync({ id: project.id, data });
      setSaveState("saved");
      savedTimer.current = setTimeout(() => setSaveState(null), 2500);
      if (successMessage) toast.success(successMessage);
    } catch {
      queryClient.setQueryData(key, previous);
      setSaveState(null);
      toast.error("Couldn't save the change. Please try again.");
    }
  };

  return (
    <PageContainer className="gap-5">
      {/* Header: owners edit everything in place — click a field to change it */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/projects"
            className="-ml-1 flex w-fit items-center gap-1.5 rounded-md px-1 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Projects
          </Link>
          <span aria-live="polite" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {saveState === "saving" && <><Loader2 className="h-3 w-3 animate-spin" /> Saving…</>}
            {saveState === "saved" && <><Check className="h-3 w-3 text-emerald-400" /> Saved</>}
          </span>
        </div>

        <div className="flex items-start gap-4">
          <ProjectAvatar project={project} />
          <div className="min-w-0 flex-1 space-y-1">
            <InlineText
              label="project name"
              value={project.title}
              disabled={!isOwner}
              maxLength={100}
              placeholder="Project name"
              validate={(v) => (v.length < 3 ? "At least 3 characters." : null)}
              onCommit={(title) => patch({ title })}
              className="text-xl font-semibold leading-tight tracking-tight sm:text-2xl"
            />
            <InlineText
              label="description"
              value={project.description ?? ""}
              disabled={!isOwner}
              multiline
              maxLength={500}
              placeholder="Add a description…"
              onCommit={(description) => patch({ description })}
              className="max-w-[65ch] text-sm leading-relaxed text-muted-foreground"
            />
          </div>
          {isOwner && (
            <ProjectMenu
              project={project}
              onArchive={() => patch({ status: "ARCHIVED" }, "Project archived")}
              onUnarchive={() => patch({ status: "PENDING" }, "Project restored")}
              onDelete={async () => {
                try {
                  await deleteProject.mutateAsync(project.id);
                  toast.success("Project deleted");
                  navigate("/projects");
                } catch {
                  toast.error("Couldn't delete the project.");
                }
              }}
            />
          )}
        </div>

        {/* Meta strip: status, priority and deadline, each editable in place */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <InlinePicker
              label="status"
              value={project.status}
              options={STATUS_PICKER}
              disabled={!isOwner || project.status === "ARCHIVED"}
              onChange={(status) => patch({ status })}
            >
              <PriorityBadge data={project.status}>{statusLabel[project.status]}</PriorityBadge>
            </InlinePicker>
            <InlinePicker
              label="priority"
              value={project.priority}
              options={PRIORITY_PICKER}
              disabled={!isOwner}
              onChange={(priority) => patch({ priority })}
            >
              <PriorityBadge data={project.priority}>{priorityLabel[project.priority]} priority</PriorityBadge>
            </InlinePicker>
          </div>
          <InlineDate
            value={project.dueDate ? new Date(project.dueDate) : undefined}
            disabled={!isOwner}
            onChange={(d) => patch({ dueDate: fromDateInput(format(d, "yyyy-MM-dd")) })}
            onClear={() => patch({ clearDueDate: true })}
          >
            <span className={cn("flex items-center gap-1.5", due?.late && "font-medium text-red-400")}>
              <Calendar className="h-4 w-4" />
              {due ? (
                <span className="tabular-nums">
                  Due {due.label}
                  {due.rel && <span className={due.late ? "" : "text-muted-foreground/70"}> · {due.rel}</span>}
                </span>
              ) : (
                isOwner ? "Set a due date" : "No due date"
              )}
            </span>
          </InlineDate>
          {project.createdAt && (
            <span className="text-muted-foreground/70">Created {format(new Date(project.createdAt), "d MMM yyyy")}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <ProjectTaskList
          projectId={project.id}
          tasks={tasks}
          loading={loadingTasks}
          canToggle={canEditTask}
          onOpen={setEditingTask}
        />

        {/* Sidebar: side by side on tablets, stacked next to the tasks on desktop */}
        <div className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <Panel title="Progress">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-semibold tracking-tight tabular-nums">
                {stats ? `${pct}%` : "–"}
              </span>
              <span className="text-xs text-muted-foreground">
                {stats ? `${stats.done} of ${stats.total} done` : ""}
              </span>
            </div>
            <TaskProgress stats={stats} className="mt-3 [&>span]:hidden" />
            <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Open", value: open.length },
                { label: "In progress", value: inProgress },
                { label: "Overdue", value: overdue, danger: overdue > 0 },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-background/40 px-2 py-2">
                  <dd className={cn("text-lg font-semibold tabular-nums", s.danger && "text-red-400")}>
                    {loadingTasks ? "–" : s.value}
                  </dd>
                  <dt className="text-[11px] text-muted-foreground">{s.label}</dt>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel
            title={`Team · ${project.members.filter((m) => m.role !== "OWNER").length + 1}`}
            action={
              isOwner && (
                <button
                  type="button"
                  onClick={() => setMembersOpen(true)}
                  className="-mr-1.5 flex items-center gap-1.5 rounded-md px-1.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Manage
                </button>
              )
            }
          >
            <TeamList project={project} />
          </Panel>

          <ProjectRepoPanel
            project={project}
            isOwner={isOwner}
            onChange={(githubRepo) => patch({ githubRepo }, githubRepo ? "Repository linked" : "Repository unlinked")}
          />
        </div>
      </div>

      <TaskModal
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSaved={() => {}}
        members={assignableMembers}
        canAssign={canEditTask(editingTask)}
        canEdit={canEditTask(editingTask)}
      />
      {isOwner && <MembersDialog project={project} open={membersOpen} onOpenChange={setMembersOpen} />}
    </PageContainer>
  );
};

export default ProjectDetails;
