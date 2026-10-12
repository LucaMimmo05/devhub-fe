import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Eye, Loader2, Pencil, Trash2, X } from "lucide-react";
import { queryKeys } from "@/hooks/queries/keys";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SegmentedPicker from "@/components/ui/SegmentedPicker";
import { PRIORITY_SEGMENTS, STATUS_SEGMENTS } from "@/components/projects/projectUtils";
import { updateTask, deleteTask } from "@/services/taskService";
import { fromDateInput, toDateInput } from "@/utils/dates";
import type { TaskType } from "@/types/taskType";
import type { Priority, Status } from "@/types/PriorityAndStatusType";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type AssignableMember = {
  profileId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
};

type Props = {
  task: TaskType | null;
  onClose: () => void;
  onSaved: (updated: TaskType) => void;
  onDeleted?: (taskId: string) => void;
  members?: AssignableMember[];
  canAssign?: boolean;
  canEdit?: boolean;
};

const proseClass = [
  "prose prose-sm dark:prose-invert max-w-none text-sm text-foreground",
  "[&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-2 [&_h1]:mt-3",
  "[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-1.5 [&_h2]:mt-2.5",
  "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-1 [&_h3]:mt-2",
  "[&_p]:mb-2 [&_p]:leading-relaxed",
  "[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-2",
  "[&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-2",
  "[&_li]:mb-0.5",
  "[&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono",
  "[&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre]:mb-2",
  "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_blockquote]:italic",
  "[&_a]:text-primary [&_a]:underline",
  "[&_hr]:border-border [&_hr]:my-3",
].join(" ");

const fieldLabel = "text-xs font-medium text-muted-foreground";

const relDays = (value: string) => {
  const days = differenceInCalendarDays(parseISO(value), new Date());
  if (days === 0) return { text: "today", late: false };
  if (days === 1) return { text: "tomorrow", late: false };
  if (days < 0) return { text: `${-days}d late`, late: true };
  return { text: `in ${days}d`, late: false };
};

type Draft = {
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  dueDate: string;
  assignedToProfileId: string;
};

const draftFrom = (task: TaskType): Draft => ({
  title: task.title,
  description: task.description ?? "",
  status: task.status,
  priority: task.priority,
  dueDate: toDateInput(task.dueDate),
  assignedToProfileId: task.assignedToProfileId ?? "",
});

// Task details, editable in place: no separate view/edit modes. Save appears once something changed.
const TaskModal = ({ task, onClose, onSaved, onDeleted, members, canAssign, canEdit = true }: Props) => {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingDescription, setEditingDescription] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (task) {
      setDraft(draftFrom(task));
      setEditingDescription(false);
      setConfirmDelete(false);
    }
  }, [task]);

  if (!task || !draft) {
    return <Dialog open={false} />;
  }

  const original = draftFrom(task);
  const dirty = (Object.keys(original) as (keyof Draft)[]).some((k) => original[k] !== draft[k]);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => (d ? { ...d, [key]: value } : d));
  const due = draft.dueDate ? relDays(draft.dueDate) : null;

  const handleSave = async () => {
    if (!draft.title.trim()) return;
    setSaving(true);
    try {
      const updated = await updateTask(task.id, {
        title: draft.title.trim(),
        description: draft.description,
        status: draft.status,
        priority: draft.priority,
        dueDate: fromDateInput(draft.dueDate),
        clearDueDate: !draft.dueDate && !!original.dueDate,
        assignedToProfileId: canAssign && draft.assignedToProfileId ? draft.assignedToProfileId : undefined,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      onSaved(updated);
      toast.success("Task saved");
      onClose();
    } catch {
      toast.error("Couldn't save the task. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTask(task.id);
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      onDeleted?.(task.id);
      toast.success("Task deleted");
      onClose();
    } catch {
      toast.error("Couldn't delete the task.");
    } finally {
      setDeleting(false);
    }
  };

  const assignee = members?.find((m) => m.profileId === draft.assignedToProfileId);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0"
        // Focus the dialog itself rather than selecting the whole title, which one keystroke would overwrite.
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          (e.currentTarget as HTMLElement | null)?.focus();
        }}
      >
        {/* Title */}
        <div className="shrink-0 px-5 pb-4 pt-5 pr-12 sm:px-6">
          <DialogDescription className="mb-1.5 text-xs">
            {task.projectTitle ? <>Task in <span className="font-medium text-foreground">{task.projectTitle}</span></> : "Task"}
          </DialogDescription>
          <DialogTitle asChild>
            {canEdit ? (
              // Grows with the text so long titles wrap instead of scrolling sideways on phones.
              <textarea
                value={draft.title}
                onChange={(e) => set("title", e.target.value.replace(/\n/g, " "))}
                onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                rows={1}
                maxLength={100}
                aria-label="Task title"
                className="-mx-2 w-[calc(100%+1rem)] resize-none rounded-md bg-transparent px-2 py-1 text-xl font-semibold leading-snug tracking-tight outline-none transition-colors field-sizing-content placeholder:text-muted-foreground/40 hover:bg-muted/40 focus:bg-muted/50"
                placeholder="Task title"
              />
            ) : (
              <h2 className="text-xl font-semibold tracking-tight">{draft.title}</h2>
            )}
          </DialogTitle>
        </div>

        <div className="flex-1 overflow-y-auto border-t border-border/60">
          {/* Properties */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
            <div className="flex flex-col gap-1.5">
              <span className={fieldLabel}>Status</span>
              <SegmentedPicker
                aria-label="Status"
                options={STATUS_SEGMENTS}
                value={draft.status === "ARCHIVED" ? "PENDING" : draft.status}
                onChange={(v) => set("status", v)}
                disabled={!canEdit}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className={fieldLabel}>Priority</span>
              <SegmentedPicker
                aria-label="Priority"
                options={PRIORITY_SEGMENTS}
                value={draft.priority}
                onChange={(v) => set("priority", v)}
                disabled={!canEdit}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="task-due" className={fieldLabel}>Due date</label>
              <div className="flex items-center gap-2.5">
                <input
                  id="task-due"
                  type="date"
                  value={draft.dueDate}
                  onChange={(e) => set("dueDate", e.target.value)}
                  disabled={!canEdit}
                  className="h-8 rounded-lg border border-border bg-background/40 px-2.5 text-sm scheme-dark focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60"
                />
                {due && (
                  <span className={cn("text-xs tabular-nums", due.late && draft.status !== "COMPLETED" ? "font-medium text-red-400" : "text-muted-foreground")}>
                    {due.text}
                  </span>
                )}
                {canEdit && draft.dueDate && (
                  <button
                    type="button"
                    onClick={() => set("dueDate", "")}
                    aria-label="Remove due date"
                    title="Remove due date"
                    className="ml-auto rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className={fieldLabel}>Assignee</span>
              {canEdit && canAssign && members && members.length > 0 ? (
                <Select
                  value={draft.assignedToProfileId || "none"}
                  onValueChange={(v) => set("assignedToProfileId", v === "none" ? "" : v)}
                >
                  <SelectTrigger className="h-8 rounded-lg bg-background/40 text-sm" aria-label="Assignee">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.profileId} value={m.profileId}>
                        {m.firstName && m.lastName ? `${m.firstName} ${m.lastName}` : `@${m.username}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="flex h-8 items-center text-sm">
                  {assignee?.username ?? task.assignedToUsername
                    ? `@${assignee?.username ?? task.assignedToUsername}`
                    : <span className="text-muted-foreground">Unassigned</span>}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-border/60 px-5 py-5 sm:px-6">
            <div className="mb-2.5 flex items-center justify-between">
              <span className={fieldLabel}>Description</span>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setEditingDescription((v) => !v)}
                  className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {editingDescription ? <><Eye className="h-3 w-3" /> Preview</> : <><Pencil className="h-3 w-3" /> Edit</>}
                </button>
              )}
            </div>
            {editingDescription ? (
              <textarea
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Add details, links, checklists… Markdown supported."
                maxLength={500}
                autoFocus
                className="min-h-40 w-full resize-y rounded-lg border border-border bg-background/40 p-3 font-mono text-sm leading-relaxed outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            ) : draft.description ? (
              <div className={proseClass}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{draft.description}</ReactMarkdown>
              </div>
            ) : canEdit ? (
              <button
                type="button"
                onClick={() => setEditingDescription(true)}
                className="w-full rounded-lg border border-dashed border-border px-3 py-4 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                Add a description…
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">No description.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border/60 px-5 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            {canEdit && !confirmDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            )}
            {canEdit && confirmDelete && (
              <>
                <span className="truncate text-sm text-destructive">Delete this task?</span>
                <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Delete"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>Keep</Button>
              </>
            )}
            {!canEdit && (
              <span className="text-xs text-muted-foreground">
                Updated {format(new Date(task.updatedAt), "d MMM")}
              </span>
            )}
          </div>
          {!confirmDelete && (
            <div className="flex shrink-0 gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                {dirty ? "Discard" : "Close"}
              </Button>
              {canEdit && (
                <Button size="sm" onClick={handleSave} disabled={!dirty || saving || !draft.title.trim()}>
                  {saving && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
                  Save changes
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
