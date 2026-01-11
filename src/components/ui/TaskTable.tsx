import type { TaskType } from "@/types/taskType";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { useState } from "react";
import { Checkbox } from "./checkbox";
import PriorityBadge from "./PriorityBadge";
import type { ColumnDef } from "@tanstack/react-table";
import type { HeaderType } from "@/pages/ProjectDetails/ProjectDetails";
import { cn } from "@/lib/utils";
type TasksProps = {
  data: TaskType[];
  columns: ColumnDef<TaskType>[];
  header: HeaderType[];
  hasCheckbok?: boolean;
  hasAssignedTo?: boolean;
  hasBorder?: boolean;
};

const TaskTable = ({
  data,
  header,
  hasCheckbok,
  hasAssignedTo,
  hasBorder
}: TasksProps) => {
  const [tasks, setTasks] = useState<TaskType[] | undefined>(data);

  return (
    <div className={cn("overflow-x-auto rounded-md", hasBorder && "border border-border")

    }>
      <Table className="min-w-150 table-auto ">
        <TableHeader>
          <TableRow>
            {header.map((head) => {
              return <TableHead key={head.id}>{head.label}</TableHead>;
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks && tasks.length > 0 ? (
            tasks.map((task) => {
              return (
                <TableRow key={task.id}>
                  {hasCheckbok && (
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                  )}

                  <TableCell className="p-3">{task.title}</TableCell>

                  <TableCell>
                    <PriorityBadge data={task.status}>
                      {task.status}
                    </PriorityBadge>
                  </TableCell>

                  <TableCell>
                    <PriorityBadge data={task.priority}>
                      {task.priority}
                    </PriorityBadge>
                  </TableCell>

                  <TableCell>
                    {task.updatedAt.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  {hasAssignedTo && <TableCell>{task.assignedTo}</TableCell>}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={data.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaskTable;
