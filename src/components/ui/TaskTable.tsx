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
import type { HeaderType } from "@/pages/ProjectDetails/projectDetailsUtils";
import { cn } from "@/lib/utils";
import NoData from "./NoData";
import { FolderKanban } from "lucide-react";

type TasksProps = {
  data: TaskType[];
  columns: ColumnDef<TaskType>[];
  header: HeaderType[];
  hasCheckbok?: boolean;
  hasAssignedTo?: boolean;
  hasBorder?: boolean;
  hasProject?: boolean;
  onEdit?: (task: TaskType) => void;
  onToggleComplete?: (task: TaskType) => void;
  onGoToProject?: (task: TaskType) => void;
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
  onToggleComplete,
  onGoToProject,
}: TasksProps) => {
  if (!data || data.length === 0) {
    return <NoData resource="Tasks" />;
  }

  return (
    <div className={cn("rounded-md overflow-x-auto", hasBorder && "border border-border")}>
      <Table className="min-w-[540px]">
        <colgroup>
          {(hasCheckbok || onGoToProject) && <col style={{ width: "44px" }} />}
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
              {onGoToProject && (
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {task.projectId ? (
                    <button
                      onClick={() => onGoToProject(task)}
                      className="flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      title={task.projectTitle ?? "Go to project"}
                    >
                      <FolderKanban className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <span className="inline-block h-7 w-7" />
                  )}
                </TableCell>
              )}

              {!onGoToProject && hasCheckbok && (
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={task.status === "COMPLETED"}
                    onCheckedChange={() => onToggleComplete?.(task)}
                  />
                </TableCell>
              )}

              <TableCell>
                <p className={cn("font-medium truncate", task.status === "COMPLETED" && "line-through text-muted-foreground")}>{task.title}</p>
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
