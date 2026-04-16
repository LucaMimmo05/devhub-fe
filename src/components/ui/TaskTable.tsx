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
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const TaskTable = ({
  data,
  header,
  hasCheckbok,
  hasAssignedTo,
  hasBorder,
  hasProject,
}: TasksProps) => {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-md",
        hasBorder && "border border-border"
      )}
    >
      <Table className="min-w-150 table-auto bg-card">
        <TableHeader>
          <TableRow>
            {header.map((head) => (
              <TableHead key={head.id}>{head.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data && data.length > 0 ? (
            data.map((task) => (
              <TableRow key={task.id}>
                {hasCheckbok && (
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                )}

                <TableCell className="p-3">
                  <p>{task.title}</p>
                </TableCell>

                <TableCell>
                  <PriorityBadge data={task.status}>
                    <p>{task.status}</p>
                  </PriorityBadge>
                </TableCell>

                <TableCell>
                  <PriorityBadge data={task.priority}>
                    <p>{task.priority}</p>
                  </PriorityBadge>
                </TableCell>

                <TableCell>
                  <p>{formatDate(task.dueDate)}</p>
                </TableCell>

                {hasAssignedTo && (
                  <TableCell>
                    <p className="text-sm text-muted-foreground">
                      {task.assignedToUsername ?? "—"}
                    </p>
                  </TableCell>
                )}

                {hasProject && (
                  <TableCell>
                    <p className="text-sm text-muted-foreground">
                      {task.projectTitle ?? "—"}
                    </p>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow className="h-24 hover:bg-transparent">
              <TableCell
                colSpan={header.length}
                className="text-center align-middle"
              >
                <NoData resource="Tasks" />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaskTable;
