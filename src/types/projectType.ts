export type ProjectProps = {
  project: {
    id: number;
    name: string;
    description: string;
    status: string;
    tasksCount: number;
    progress: number;
    membersNumber: number;
    dueDate: Date;
  };
};

