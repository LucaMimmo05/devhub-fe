import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import TaskTable from "@/components/ui/TaskTable";
import PageContainer from "@/layouts/PageContainer";
import { CheckSquare, Filter, Loader2, X } from "lucide-react";
import TaskSheet from "@/components/ui/TaskSheet";
import type { HeaderType } from "../ProjectDetails/projectDetailsUtils";
import DropdownFilter from "@/components/ui/DropdownFilter";
import { Button } from "@/components/ui/button";
import { getMyTasks } from "@/services/taskService";
import type { TaskType } from "@/types/taskType";
import { useAuth } from "@/context/AuthContext";

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

  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>();
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentFilters = useRef({ status: undefined as string | undefined, priority: undefined as string | undefined, search: "" });

  const fetchTasks = (status?: string, priority?: string, search?: string) => {
    setLoading(true);
    currentFilters.current = { status, priority, search: search ?? "" };
    getMyTasks({ status, priority, search: search || undefined })
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = (value: string | undefined) => {
    setStatusFilter(value);
    fetchTasks(value, priorityFilter, filterText);
  };

  const handlePriorityChange = (value: string | undefined) => {
    setPriorityFilter(value);
    fetchTasks(statusFilter, value, filterText);
  };

  const handleSearchChange = (value: string) => {
    setFilterText(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchTasks(statusFilter, priorityFilter, value);
    }, 400);
  };

  const handleClearFilters = () => {
    setStatusFilter(undefined);
    setPriorityFilter(undefined);
    setFilterText("");
    fetchTasks();
  };

  const isFiltered = !!statusFilter || !!priorityFilter || !!filterText;

  return (
    <PageContainer className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative lg:w-64 w-full">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter Tasks"
            className="pl-9"
            value={filterText}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <DropdownFilter
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={handleStatusChange}
            placeholder="Filter By Status"
          />
          <DropdownFilter
            options={PRIORITY_OPTIONS}
            value={priorityFilter}
            onChange={handlePriorityChange}
            placeholder="Filter By Priority"
          />
        </div>

        {isFiltered && (
          <Button
            variant="destructive"
            onClick={handleClearFilters}
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
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4 text-center">
          <CheckSquare className="h-12 w-12 text-muted-foreground/40" />
          <div>
            <h3 className="font-semibold text-lg">
              {isFiltered ? "No tasks match your filters" : "No tasks yet"}
            </h3>
            <p className="text-muted-foreground text-sm">
              {isFiltered ? "Try clearing the filters." : "Tasks are created from within a project."}
            </p>
          </div>
          {isFiltered && (
            <Button variant="outline" onClick={handleClearFilters}>Clear Filters</Button>
          )}
        </div>
      ) : (
        <TaskTable
          data={tasks}
          columns={[]}
          header={taskHeader}
          hasBorder
          hasProject
          onEdit={setEditingTask}
          onGoToProject={(task) => { if (task.projectId) navigate(`/projects/${task.projectId}`); }}
        />
      )}

      <TaskSheet
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSaved={(updated) => {
          setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          setEditingTask(null);
        }}
        onDeleted={(id) => setTasks((prev) => prev.filter((t) => t.id !== id))}
        canEdit={!!user && !!editingTask?.createdByProfileId && editingTask.createdByProfileId === user.id}
      />
    </PageContainer>
  );
};

export default Tasks;
