import { projectMock } from "@/mock/dashboard-mock";
import { Checkbox } from "./checkbox";
import PriorityBadge from "./PriorityBadge";

export type TaskProps = {
  task: {
    id: number;
    title: string;
    status: "Pending" | "In Progress" | "Completed";
    priority: "Low" | "Medium" | "High";
    createdAt: Date;
    updatedAt: Date;
    project: number;
  };
  key: number;
};

const Task = ({ task }: TaskProps) => {
  const project = projectMock.find((project)=> project.id === task.project)
  return (
    <div key={`${task.id}`} className="flex items-start gap-3">
      <Checkbox className="rounded mt-2 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h3 className="text-md font-normal truncate">{task.title}</h3>
          <PriorityBadge data={task.priority}>{task.priority}</PriorityBadge>
        </div>
        <p className="text-xs md:text-sm text-muted-foreground">
          {project?.name}
        </p>
      </div>
    </div>
  );
};

export default Task;
