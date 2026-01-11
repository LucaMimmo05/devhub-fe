import { useState } from "react";
import { Input } from "@/components/ui/input";
import TaskTable from "@/components/ui/TaskTable";
import PageContainer from "@/layouts/PageContainer";
import { Filter, X } from "lucide-react";
import type { HeaderType } from "../ProjectDetails/ProjectDetails";
import { taskMock } from "@/mock/dashboard-mock";
import { useAuth } from "@/context/AuthContext";
import DropdownFilter from "@/components/ui/DropdownFilter";
import { Button } from "@/components/ui/button";

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
  ];

  const { user } = useAuth();

  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>();

  const filteredTasks = taskMock.filter((task) => {
    if (task.assignedTo !== user?.id) return false;
    if (statusFilter && task.status !== statusFilter) return false;
    if (priorityFilter && task.priority !== priorityFilter) return false;
    return true;
  });

  const isFiltered = !!statusFilter || !!priorityFilter;

  return (
    <PageContainer className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative lg:w-64 w-full">
          <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Filter Tasks" className="pl-9" />
        </div>

        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <DropdownFilter
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Status"
          />

          <DropdownFilter
            options={PRIORITY_OPTIONS}
            value={priorityFilter}
            onChange={setPriorityFilter}
            placeholder="Priority"
          />
        </div>

        {isFiltered && (
          <Button
            variant={"outline"}
            onClick={() => {
              setStatusFilter(undefined);
              setPriorityFilter(undefined);
            }}
            className="flex items-center gap-1 px-3 py-1 border rounded "
          >
            <X className="w-4 h-4" /> Clear Filters
          </Button>
        )}
      </div>

      <TaskTable
        data={filteredTasks}
        columns={[]}
        header={taskHeader}
        hasCheckbok
        hasBorder
      />
    </PageContainer>
  );
};

export default Tasks;
