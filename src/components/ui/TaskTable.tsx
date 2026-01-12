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
import { projectMock } from "@/mock/dashboard-mock";
type TasksProps = {
  data: TaskType[];
  columns: ColumnDef<TaskType>[];
  header: HeaderType[];
  hasCheckbok?: boolean;
  hasAssignedTo?: boolean;
  hasBorder?: boolean;
  hasProject?: boolean;
};

const TaskTable = ({
  data,
  header,
  hasCheckbok,
  hasAssignedTo,
  hasBorder,
  hasProject,
}: TasksProps) => {
  const [tasks, setTasks] = useState<TaskType[] | undefined>(data);

  const renderProject = (id: number) => {
    if(!id) return null;

    const project = projectMock.find((project) => project.id === id)
    return project?.name
  };

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-md",
        hasBorder && "border border-border"
      )}
    >
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

                  <TableCell className="p-3"><p>{task.title}</p></TableCell>

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
                    <p>
                      {task.updatedAt.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </TableCell>
                  {hasAssignedTo && <TableCell>{task.assignedTo}</TableCell>}

                  {hasProject && (
                    <TableCell><p>{renderProject(task.project)}</p></TableCell>
                  )}
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
