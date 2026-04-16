import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import TaskTable from "@/components/ui/TaskTable";
import PageContainer from "@/layouts/PageContainer";
import { Filter, Loader2, Plus, X } from "lucide-react";
import type { HeaderType } from "../ProjectDetails/ProjectDetails";
import { useAuth } from "@/context/AuthContext";
import DropdownFilter from "@/components/ui/DropdownFilter";
import { Button } from "@/components/ui/button";
import { getMyTasks, createTask } from "@/services/taskService";
import type { TaskType } from "@/types/taskType";
import Modal from "@/components/ui/Modal";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Priority, Status } from "@/types/PriorityAndStatusType";
import { useHeaderActions } from "@/context/HeaderActionsContext";

const STATUS_OPTIONS = [
  { label: "Pending", value: "PENDING" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
];

const PRIORITY_OPTIONS = [
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
];

const Tasks = () => {
  const taskHeader: HeaderType[] = [
    { label: "", id: 0 },
    { label: "Task", id: 1 },
    { label: "Status", id: 2 },
    { label: "Priority", id: 3 },
    { label: "Due Date", id: 4 },
    { label: "Project", id: 5 },
  ];

  const { user } = useAuth();
  const { setOnCreate } = useHeaderActions();

  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>();

  const [openModal, setOpenModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<Priority>("MEDIUM");
  const [taskStatus, setTaskStatus] = useState<Status>("PENDING");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyTasks()
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setOnCreate?.(() => () => setOpenModal(true));
    return () => setOnCreate?.(undefined);
  }, [setOnCreate]);

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter && task.status !== statusFilter) return false;
    if (priorityFilter && task.priority !== priorityFilter) return false;
    if (filterText && !task.title.toLowerCase().includes(filterText.toLowerCase())) return false;
    return true;
  });

  const isFiltered = !!statusFilter || !!priorityFilter || !!filterText;

  const handleClose = () => {
    setOpenModal(false);
    setTaskTitle("");
    setTaskDescription("");
    setTaskPriority("MEDIUM");
    setTaskStatus("PENDING");
    setTaskDueDate("");
  };

  const handleCreate = async () => {
    if (!taskTitle.trim() || !user) return;
    setSaving(true);
    try {
      const created = await createTask({
        title: taskTitle,
        description: taskDescription || undefined,
        status: taskStatus,
        priority: taskPriority,
        dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : undefined,
      });
      setTasks((prev) => [created, ...prev]);
      handleClose();
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative lg:w-64 w-full">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter Tasks"
            className="pl-9"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <DropdownFilter
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Filter By Status"
          />
          <DropdownFilter
            options={PRIORITY_OPTIONS}
            value={priorityFilter}
            onChange={setPriorityFilter}
            placeholder="Filter By Priority"
          />
        </div>

        {isFiltered && (
          <Button
            variant="destructive"
            onClick={() => {
              setStatusFilter(undefined);
              setPriorityFilter(undefined);
              setFilterText("");
            }}
            className="flex items-center gap-1 px-3 py-1 border rounded"
          >
            <X className="w-4 h-4" /> Clear Filters
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="ml-auto flex items-center gap-1"
          onClick={() => setOpenModal(true)}
        >
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
        </div>
      ) : (
        <TaskTable
          data={filteredTasks}
          columns={[]}
          header={taskHeader}
          hasCheckbok
          hasBorder
          hasProject
        />
      )}

      <Modal
        open={openModal}
        onOpenChange={handleClose}
        title="New Task"
        description="Create a new personal task."
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={handleCreate} disabled={saving || !taskTitle.trim()}>
              {saving ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Create
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Task title"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-desc">Description</Label>
            <Textarea
              id="task-desc"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Priority</Label>
              <Select value={taskPriority} onValueChange={(v) => setTaskPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <Select value={taskStatus} onValueChange={(v) => setTaskStatus(v as Status)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-due">Due Date</Label>
            <Input
              id="task-due"
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default Tasks;
