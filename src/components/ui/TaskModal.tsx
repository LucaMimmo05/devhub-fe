import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PriorityBadge from "@/components/ui/PriorityBadge";
import { Loader2, Trash2, Calendar, User, Tag, AlertCircle, Pencil } from "lucide-react";
import { updateTask, deleteTask } from "@/services/taskService";
import type { TaskType } from "@/types/taskType";
import type { Priority, Status } from "@/types/PriorityAndStatusType";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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

const statusLabel: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

const priorityLabel: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

const MetaField = ({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
    {children}
  </div>
);

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

const formatDate = (d?: string) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const TaskModal = ({
  task,
  onClose,
  onSaved,
  onDeleted,
  members,
  canAssign,
  canEdit = true,
}: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [status, setStatus] = useState<Status>("PENDING");
  const [dueDate, setDueDate] = useState("");
  const [assignedToProfileId, setAssignedToProfileId] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
      setAssignedToProfileId(task.assignedToProfileId ?? "");
      setConfirmDelete(false);
      setEditMode(false); // always start in view mode
    }
  }, [task]);

  const enterEdit = () => setEditMode(true);

  const cancelEdit = () => {
    // reset form to original task values
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
      setAssignedToProfileId(task.assignedToProfileId ?? "");
    }
    setConfirmDelete(false);
    setEditMode(false);
  };

  const isEditing = canEdit && editMode;

  const handleSave = async () => {
    if (!task || !title.trim()) return;
    setSaving(true);
    try {
      const updated = await updateTask(task.id, {
        title,
        description: description || undefined,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        assignedToProfileId: canAssign && assignedToProfileId ? assignedToProfileId : undefined,
      });
      onSaved(updated);
      setEditMode(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    setDeleting(true);
    try {
      await deleteTask(task.id);
      onDeleted?.(task.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={!!task} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 gap-0 flex flex-col max-h-[88vh] overflow-hidden">

        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-4 border-b shrink-0">
          <DialogTitle asChild>
            {isEditing ? (
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xl font-semibold bg-transparent border-none outline-none placeholder:text-muted-foreground/40 mb-2"
                placeholder="Task title"
              />
            ) : (
              <h2 className="text-xl font-semibold mb-2">{title}</h2>
            )}
          </DialogTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <PriorityBadge data={status}>{statusLabel[status] ?? status}</PriorityBadge>
            <PriorityBadge data={priority}>{priorityLabel[priority] ?? priority}</PriorityBadge>
            {task?.projectTitle && (
              <span className="text-xs text-muted-foreground">
                in <span className="font-medium text-foreground">{task.projectTitle}</span>
              </span>
            )}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Left — description */}
          <div className="flex-1 flex flex-col px-6 py-5 overflow-y-auto border-r min-w-0">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 block">
              Description
            </Label>

            {isEditing ? (
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description… (supports Markdown)"
                className="flex-1 resize-none text-sm font-mono min-h-[200px]"
              />
            ) : (
              <div className={proseClass}>
                {description
                  ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
                  : <p className="text-muted-foreground italic text-sm">No description.</p>
                }
              </div>
            )}
          </div>

          {/* Right — metadata */}
          <div className="w-52 shrink-0 flex flex-col gap-5 px-5 py-5 overflow-y-auto bg-muted/30">

            <MetaField icon={Tag} label="Status">
              {isEditing ? (
                <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <PriorityBadge data={status} className="w-fit">{statusLabel[status]}</PriorityBadge>
              )}
            </MetaField>

            <MetaField icon={AlertCircle} label="Priority">
              {isEditing ? (
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <PriorityBadge data={priority} className="w-fit">{priorityLabel[priority]}</PriorityBadge>
              )}
            </MetaField>

            {isEditing && canAssign && members && members.length > 0 ? (
              <MetaField icon={User} label="Assignee">
                <Select
                  value={assignedToProfileId || "none"}
                  onValueChange={(v) => setAssignedToProfileId(v === "none" ? "" : v)}
                >
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.profileId} value={m.profileId}>
                        {m.firstName && m.lastName ? `${m.firstName} ${m.lastName}` : m.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </MetaField>
            ) : task?.assignedToUsername ? (
              <MetaField icon={User} label="Assignee">
                <span className="text-sm">@{task.assignedToUsername}</span>
              </MetaField>
            ) : null}

            <MetaField icon={Calendar} label="Due Date">
              {isEditing ? (
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-8 text-sm"
                />
              ) : (
                <span className="text-sm">
                  {dueDate ? formatDate(dueDate) : <span className="text-muted-foreground italic">—</span>}
                </span>
              )}
            </MetaField>

            {/* Timestamps */}
            <div className="mt-auto pt-4 border-t flex flex-col gap-2">
              {task?.createdAt && (
                <div>
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">Created</p>
                  <p className="text-xs text-muted-foreground">{formatDate(task.createdAt)}</p>
                </div>
              )}
              {task?.updatedAt && (
                <div>
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">Updated</p>
                  <p className="text-xs text-muted-foreground">{formatDate(task.updatedAt)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-3.5 border-t flex items-center justify-between shrink-0">
          {/* Left: delete actions (only in edit mode) */}
          <div className="flex items-center gap-2">
            {isEditing && !confirmDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            )}
            {isEditing && confirmDelete && (
              <>
                <span className="text-sm text-destructive">Delete this task?</span>
                <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : "Yes, delete"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>No</Button>
              </>
            )}
          </div>

          {/* Right: context-aware action buttons */}
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={cancelEdit}>Cancel</Button>
                <Button size="sm" onClick={handleSave} disabled={saving || !title.trim()}>
                  {saving && <Loader2 className="animate-spin h-3.5 w-3.5 mr-1" />}
                  Save changes
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
                {canEdit && (
                  <Button size="sm" onClick={enterEdit} className="gap-1.5">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
