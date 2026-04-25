import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
import { Loader2, Trash2 } from "lucide-react";
import { updateTask, deleteTask } from "@/services/taskService";
import type { TaskType } from "@/types/taskType";
import type { Priority, Status } from "@/types/PriorityAndStatusType";

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

const TaskSheet = ({ task, onClose, onSaved, onDeleted, members, canAssign, canEdit = true }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [status, setStatus] = useState<Status>("PENDING");
  const [dueDate, setDueDate] = useState("");
  const [assignedToProfileId, setAssignedToProfileId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
      setAssignedToProfileId(task.assignedToProfileId ?? "");
      setConfirmDelete(false);
    }
  }, [task]);

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
      onClose();
      toast.success("Task updated!");
    } catch {
      toast.error("Failed to update task.");
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
      toast.success("Task deleted.");
    } catch {
      toast.error("Failed to delete task.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Sheet open={!!task} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="px-6 py-5 border-b">
          <SheetTitle>{canEdit ? "Edit Task" : "Task Details"}</SheetTitle>
          <SheetDescription>{task?.title}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-6 py-5 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} disabled={!canEdit} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="No description"
              disabled={!canEdit}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Status)} disabled={!canEdit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)} disabled={!canEdit}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Due Date</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={!canEdit}
            />
          </div>

          {canAssign && members && members.length > 0 && (
            <div className="flex flex-col gap-2">
              <Label>Assigned To</Label>
              <Select value={assignedToProfileId} onValueChange={setAssignedToProfileId}>
                <SelectTrigger><SelectValue placeholder="Select member..." /></SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.profileId} value={m.profileId}>
                      {m.firstName && m.lastName ? `${m.firstName} ${m.lastName}` : m.username} (@{m.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t flex items-center justify-between gap-2">
          {canEdit && !confirmDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          {canEdit && confirmDelete && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-destructive">Delete?</span>
              <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : "Yes"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>No</Button>
            </div>
          )}

          {!canEdit && <div />}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            {canEdit && (
              <Button onClick={handleSave} disabled={saving || !title.trim()}>
                {saving && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                Save
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TaskSheet;
