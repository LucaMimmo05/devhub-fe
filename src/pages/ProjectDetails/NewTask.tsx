import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, CornerDownLeft, FolderKanban, ListChecks, Loader2, Signal, User } from "lucide-react";
import WizardScreen from "@/components/wizard/WizardScreen";
import { Button } from "@/components/ui/button";
import { InlineDate, InlinePicker } from "@/components/projects/InlineEdit";
import { relativeDue } from "@/components/projects/projectUtils";
import { useProjects } from "@/hooks/queries/useProjects";
import { useCreateTask } from "@/hooks/queries/useTasks";
import { useAuth } from "@/context/AuthContext";
import { fromDateInput } from "@/utils/dates";
import type { Priority, Status } from "@/types/PriorityAndStatusType";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_OPTIONS: { value: Status; label: string; dotClassName: string }[] = [
  { value: "PENDING", label: "To do", dotClassName: "bg-muted-foreground" },
  { value: "IN_PROGRESS", label: "In progress", dotClassName: "bg-primary" },
];

const PRIORITY_OPTIONS: { value: Priority; label: string; dotClassName: string }[] = [
  { value: "LOW", label: "Low priority", dotClassName: "bg-emerald-400" },
  { value: "MEDIUM", label: "Medium priority", dotClassName: "bg-yellow-400" },
  { value: "HIGH", label: "High priority", dotClassName: "bg-red-400" },
];

const chip =
  "group flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card/60 px-2.5 text-xs font-medium text-foreground/90 outline-none transition-colors hover:border-primary/40 hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:border-primary/50";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/**
 * Quick task composer: one screen, title first, properties as chips.
 * Reached from a project (/projects/:projectId/tasks/new, project fixed) or
 * from the Tasks page (/tasks/new, project picked here, ?project= preselects).
 */
const NewTask = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projectId: routeProjectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const { data: projects = [], isLoading: loadingProjects } = useProjects();
  const createTask = useCreateTask();

  const activeProjects = projects.filter((p) => p.status !== "ARCHIVED" && p.status !== "COMPLETED");
  const [pickedProjectId, setPickedProjectId] = useState<string | null>(searchParams.get("project"));
  // Fixed from the route, else the user's pick, else the most recent active project.
  const projectId = routeProjectId ?? pickedProjectId ?? activeProjects[0]?.id ?? null;
  const project = projects.find((p) => p.id === projectId);

  const closePath = routeProjectId ? `/projects/${routeProjectId}` : "/tasks";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("PENDING");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [createMore, setCreateMore] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // Owner + members of the selected project; the backend assigns the creator when none is picked.
  const people = project
    ? [
        ...(project.ownerProfileId && project.ownerUsername
          ? [{ profileId: project.ownerProfileId, username: project.ownerUsername, name: "" }]
          : []),
        ...project.members
          .filter((m) => m.profileId !== project.ownerProfileId)
          .map((m) => ({ profileId: m.profileId, username: m.username, name: `${m.firstName} ${m.lastName}`.trim() })),
      ]
    : [];
  const assignee = people.find((p) => p.profileId === assigneeId);
  const assigneeOptions = [
    { value: "", label: "Me", hint: user ? `@${user.username}` : undefined },
    ...people
      .filter((p) => p.profileId !== user?.id)
      .map((p) => ({ value: p.profileId, label: p.name || `@${p.username}`, hint: p.name ? `@${p.username}` : undefined })),
  ];

  const canCreate = !!title.trim() && !!projectId && !createTask.isPending;
  const due = dueDate ? relativeDue(dueDate.toISOString(), status) : null;

  const handleCreate = async () => {
    if (!canCreate || !projectId) return;
    try {
      await createTask.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate ? fromDateInput(format(dueDate, "yyyy-MM-dd")) : undefined,
        projectId,
        assignedToProfileId: assigneeId || undefined,
      });
      if (createMore) {
        // Keep project and properties, start a fresh task.
        toast.success(`Added “${title.trim()}”`);
        setTitle("");
        setDescription("");
        titleRef.current?.focus();
      } else {
        toast.success("Task created");
        navigate(routeProjectId ? closePath : `/projects/${projectId}`);
      }
    } catch {
      toast.error("Couldn't create the task. Please try again.");
    }
  };

  // ⌘/Ctrl + Enter creates from anywhere on the screen.
  const createRef = useRef(handleCreate);
  useEffect(() => {
    createRef.current = handleCreate;
  });
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        createRef.current();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const statusOpt = STATUS_OPTIONS.find((o) => o.value === status)!;
  const priorityOpt = PRIORITY_OPTIONS.find((o) => o.value === priority)!;

  return (
    <WizardScreen
      title="New task"
      icon={<ListChecks className="h-4.5 w-4.5" />}
      iconClassName="bg-primary/10 text-primary"
      wide
      onClose={() => navigate(closePath)}
      footer={
        <>
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={createMore}
              onChange={(e) => setCreateMore(e.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            Create another
          </label>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
              <kbd className="inline-flex items-center gap-0.5 rounded border border-border px-1.5 py-0.5 font-sans text-[11px]">
                {isMac ? "⌘" : "Ctrl"} <CornerDownLeft className="h-3 w-3" />
              </kbd>
            </span>
            <Button onClick={handleCreate} disabled={!canCreate}>
              {createTask.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Create task
            </Button>
          </div>
        </>
      }
    >
      <div className="flex flex-col gap-5 pt-2 sm:pt-8">
        {/* Project: fixed when coming from a project, pickable from the Tasks page */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FolderKanban className="h-4 w-4" />
          {routeProjectId ? (
            <span className="font-medium text-foreground">{project?.title ?? "…"}</span>
          ) : loadingProjects ? (
            <span className="h-4 w-28 animate-pulse rounded bg-primary/10" />
          ) : activeProjects.length === 0 ? (
            <span>
              You need a project first.{" "}
              <Link to="/projects/new" className="font-medium text-primary hover:underline">Create one</Link>
            </span>
          ) : (
            <InlinePicker
              label="project"
              value={projectId ?? ""}
              options={activeProjects.map((p) => ({ value: p.id, label: p.title }))}
              onChange={(id) => { setPickedProjectId(id); setAssigneeId(""); }}
              triggerClassName="group -mx-1.5 flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium text-foreground outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring"
            >
              {project?.title ?? "Pick a project"}
            </InlinePicker>
          )}
        </div>

        <textarea
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value.replace(/\n/g, " "))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              handleCreate();
            }
          }}
          rows={1}
          maxLength={100}
          autoFocus
          aria-label="Task title"
          placeholder="What needs doing?"
          className="w-full resize-none bg-transparent text-2xl font-semibold leading-snug tracking-tight outline-none field-sizing-content placeholder:text-muted-foreground/40 sm:text-3xl"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={500}
          aria-label="Description"
          placeholder="Add details, links or a checklist… Markdown works."
          className="min-h-20 w-full resize-none bg-transparent text-base leading-relaxed text-foreground/90 outline-none field-sizing-content placeholder:text-muted-foreground/50"
        />

        {/* Properties as chips: everything visible, one click to change */}
        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-5">
          <InlinePicker label="status" value={status} options={STATUS_OPTIONS} onChange={setStatus} triggerClassName={chip}>
            <span className={cn("h-2 w-2 rounded-full", statusOpt.dotClassName)} />
            {statusOpt.label}
          </InlinePicker>

          <InlinePicker label="priority" value={priority} options={PRIORITY_OPTIONS} onChange={setPriority} triggerClassName={chip}>
            <Signal className={cn("h-3.5 w-3.5", priority === "HIGH" ? "text-red-400" : priority === "MEDIUM" ? "text-yellow-400" : "text-emerald-400")} />
            {priorityOpt.label}
          </InlinePicker>

          <InlineDate value={dueDate} onChange={setDueDate} onClear={() => setDueDate(undefined)} triggerClassName={chip}>
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            {dueDate ? (
              <span className="tabular-nums">
                {format(dueDate, "d MMM")}
                {due?.rel && <span className="text-muted-foreground"> · {due.rel}</span>}
              </span>
            ) : (
              <span className="text-muted-foreground">Due date</span>
            )}
          </InlineDate>

          <InlinePicker
            label="assignee"
            value={assigneeId}
            options={assigneeOptions}
            onChange={setAssigneeId}
            disabled={!project}
            triggerClassName={chip}
          >
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            {assignee && assignee.profileId !== user?.id ? assignee.name || `@${assignee.username}` : "Me"}
          </InlinePicker>
        </div>

        <p className="text-xs text-muted-foreground/70">
          Enter to create{createMore ? " and start the next one" : ""} · Esc to close
        </p>
      </div>
    </WizardScreen>
  );
};

export default NewTask;
