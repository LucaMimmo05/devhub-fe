import type { TaskType } from "@/types/taskType";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Checkbox } from "./checkbox";
import PriorityBadge from "./PriorityBadge";
import type { ColumnDef } from "@tanstack/react-table";
import type { HeaderType } from "@/pages/ProjectDetails/ProjectDetails";
import { cn } from "@/lib/utils";
import NoData from "./NoData";

type TasksProps = {
  data: TaskType[];
  columns: ColumnDef<TaskType>[];
  header: HeaderType[];
  hasCheckbok?: boolean;
  hasAssignedTo?: boolean;
  hasBorder?: boolean;
  hasProject?: boolean;
  onEdit?: (task: TaskType) => void;
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const statusLabel: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

export const priorityLabel: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

const TaskTable = ({
  data,
  header,
  hasCheckbok,
  hasAssignedTo,
  hasBorder,
  hasProject,
  onEdit,
}: TasksProps) => {
  if (!data || data.length === 0) {
    return <NoData resource="Tasks" />;
  }

  return (
    <div className={cn("rounded-md", hasBorder && "border border-border")}>
      <Table className="min-w-[540px]">
        <colgroup>
          {hasCheckbok && <col style={{ width: "40px" }} />}
          <col />
          <col style={{ width: "120px" }} />
          <col style={{ width: "100px" }} />
          <col style={{ width: "110px" }} />
          {hasAssignedTo && <col style={{ width: "120px" }} />}
          {hasProject && <col style={{ width: "130px" }} />}
        </colgroup>
        <TableHeader>
          <TableRow>
            {header.map((head) => (
              <TableHead key={head.id}>{head.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((task) => (
            <TableRow
              key={task.id}
              className={onEdit ? "cursor-pointer" : ""}
              onClick={() => onEdit?.(task)}
            >
              {hasCheckbok && (
                <TableCell>
                  <Checkbox />
                </TableCell>
              )}

              <TableCell>
                <p className="font-medium truncate">{task.title}</p>
                {task.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {task.description}
                  </p>
                )}
              </TableCell>

              <TableCell>
                <PriorityBadge data={task.status}>
                  {statusLabel[task.status] ?? task.status}
                </PriorityBadge>
              </TableCell>

              <TableCell>
                <PriorityBadge data={task.priority}>
                  {priorityLabel[task.priority] ?? task.priority}
                </PriorityBadge>
              </TableCell>

              <TableCell className="text-sm text-muted-foreground">
                {formatDate(task.dueDate)}
              </TableCell>

              {hasAssignedTo && (
                <TableCell className="text-sm text-muted-foreground truncate">
                  {task.assignedToUsername ?? "—"}
                </TableCell>
              )}

              {hasProject && (
                <TableCell className="text-sm text-muted-foreground truncate">
                  {task.projectTitle ?? "—"}
                </TableCell>
              )}

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaskTable;
