import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import TaskTable from "@/components/ui/TaskTable";
import PageContainer from "@/layouts/PageContainer";
import { Filter, Loader2, X } from "lucide-react";
import TaskSheet from "@/components/ui/TaskSheet";
import type { HeaderType } from "../ProjectDetails/ProjectDetails";
import DropdownFilter from "@/components/ui/DropdownFilter";
import { Button } from "@/components/ui/button";
import { getMyTasks, updateTask } from "@/services/taskService";
import type { TaskType } from "@/types/taskType";

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

  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>();

  const [editingTask, setEditingTask] = useState<TaskType | null>(null);

  useEffect(() => {
    getMyTasks()
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter && task.status !== statusFilter) return false;
    if (priorityFilter && task.priority !== priorityFilter) return false;
    if (filterText && !task.title.toLowerCase().includes(filterText.toLowerCase())) return false;
    return true;
  });

  const isFiltered = !!statusFilter || !!priorityFilter || !!filterText;

  const handleToggleComplete = async (task: TaskType) => {
    const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      const updated = await updateTask(task.id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      console.error("Failed to toggle task:", err);
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
          onEdit={setEditingTask}
          onToggleComplete={handleToggleComplete}
        />
      )}

      <TaskSheet
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSaved={(updated) => setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))}
      />
    </PageContainer>
  );
};

export default Tasks;
