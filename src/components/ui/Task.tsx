import { Checkbox } from "./checkbox";
import PriorityBadge from "./PriorityBadge";

export type TaskProps = {
  task: {
    id: number;
    title: string;
    status: string;
    priority: string; // "High" | "Medium" | "Low";
    createdAt: string;
    updatedAt: string;
    project: string;
  };
  key: number;
};

const Task = ({ task }: TaskProps) => {
  return (
    <div key={`${task.id}`} className="flex items-start gap-3">
      <Checkbox className="rounded mt-2 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h3 className="text-md font-normal truncate">
            {task.title}
          </h3>
          <PriorityBadge data={task.priority}>{task.priority}</PriorityBadge>
          
        </div>
        <p className="text-xs md:text-sm text-muted-foreground">
          {task.project}
        </p>
      </div>
    </div>
  );
};

export default Task;
