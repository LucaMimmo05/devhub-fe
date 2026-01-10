export type ProjectType = {
    id: number;
    name: string;
    description: string;
    status: "Pending" | "In Progress" | "Completed";
    tasksCount: number;
    progress: number;
    membersNumber: number;
    dueDate: Date;
};
