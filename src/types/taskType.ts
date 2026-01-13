export type TaskType = {
  id: number;
  title: string;
  status: Status;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
  project: number;
  assignedTo: string;
};

import type { ColumnDef } from "@tanstack/react-table";
import type { Priority, Status } from "./PriorityAndStatusType";

export const taskColumns: ColumnDef<TaskType>[] = [
  {
    accessorKey: "title",
    header: "Task",
    cell: info => info.getValue(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: info => info.getValue(),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: info => info.getValue(),
  },
  {
    accessorKey: "updatedAt",
    header: "Due Date",
    cell: info => (info.getValue() as Date).toLocaleDateString(),
  },
];

