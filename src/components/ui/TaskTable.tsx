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
type TasksProps = {
  data: TaskType[];
  columns: ColumnDef<TaskType>[];
};
const TaskTable = ({ data }: TasksProps) => {
  const [tasks, setTasks] = useState<TaskType[] | undefined>(data);
  const taskHeader = [
    { label: "", id: 0 },
    { label: "Task", id: 1 },
    { label: "Status", id: 2 },
    { label: "Priority", id: 3 },
    { label: "Due Date", id: 4 },
  ];

  return (
    <div className="overflow-x-auto rounded-md bordered">
      <Table className="min-w-150 table-auto">
        <TableHeader>
          <TableRow>
            {taskHeader.map((head) => {
              return <TableHead key={head.id}>{head.label}</TableHead>;
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks ? (
            tasks.map((task) => {
              return (
                <TableRow key={task.id}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>

                  <TableCell>{task.title}</TableCell>

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
