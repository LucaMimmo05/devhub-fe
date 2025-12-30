import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Checkbox } from "./checkbox";

type TaskProps = {
    task: {
        id: number;
        title: string;
        status: string;
        priority: string // "High" | "Medium" | "Low";
        createdAt: string;
        updatedAt: string;
    };
    key: number;
};

const Task = ({ task,key }: TaskProps) => {
  return (
    <div key={`${task.id}-${key}`} className="flex items-start gap-3">
      <Checkbox className="rounded mt-2 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <h3 className="text-sm md:text-lg font-normal truncate">
            {task.title}
          </h3>
          <Badge
            className={cn(
              "hover:bg-inset text-xs shrink-0",
              task.priority === "High" && "bg-red-700 text-red-200",
              task.priority === "Medium" && "bg-yellow-700 text-yellow-200",
              task.priority === "Low" && "bg-green-700 text-green-200"
            )}
          >
            {task.priority}
          </Badge>
        </div>
        <p className="text-xs md:text-sm text-muted-foreground">
          {task.status}
        </p>
      </div>
    </div>
  );
};

export default Task;
