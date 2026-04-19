import type { ColumnDef } from "@tanstack/react-table";
import type { Priority, Status } from "./PriorityAndStatusType";

export type TaskType = {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  projectId?: string;
  projectTitle?: string;
  assignedToProfileId?: string;
  assignedToUsername?: string;
  createdByProfileId?: string;
};

export type TaskRequest = {
  title: string;
  description?: string;
  status?: Status;
  priority?: Priority;
  dueDate?: string;
  projectId?: string;
  assignedToProfileId?: string;
};

export const taskColumns: ColumnDef<TaskType>[] = [
  {
    accessorKey: "title",
    header: "Task",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: (info) => {
      const val = info.getValue() as string | undefined;
      return val ? new Date(val).toLocaleDateString() : "—";
    },
  },
];
