import { Badge } from "./badge";
import { Button } from "./button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card";
import PriorityBadge from "./PriorityBadge";
import { Progress } from "./progress";
import { ArrowRight, User } from "lucide-react";

type ProjectOverviewProps = {
  project: {
    id: number;
    name: string;
    description: string;
    status: string;
    tasksCount: number;
    progress: number;
    membersNumber: number;
  };
};
const ProjectOverview = ({ project }: ProjectOverviewProps) => {
  return (
    <Card key={project.id} className="flex-1 ">
      <CardHeader className="pb-4 flex-row justify-between items-center">
        <div className="flex flex-col space-y-1">
          <CardTitle>{project.name}</CardTitle>
          <CardDescription>{project.description}</CardDescription>
        </div>
        <div className="flex items-center">
            <User size={16} className="text-muted-foreground"/>
            <span className="ml-1 text-sm text-muted-foreground">{project.membersNumber}</span>
        </div>

      </CardHeader>
      <CardContent className="flex flex-col gap-1.5">
        <p className="text-xs text-muted-foreground">
          {project.progress}% complete
        </p>
        <Progress value={project.progress} className="h-1" />
      </CardContent>
      <CardFooter className="flex items-center gap-2 w-full">
        <PriorityBadge data={project.status}>{project.status}</PriorityBadge>
        <Badge variant="outline" className="hover:bg-inset text-xs shrink-0">
          {project.tasksCount} Tasks
        </Badge>
        <Button
          variant="link"
          size="sm"
          className="hover:bg-inset cursor-pointer px-2 ml-auto"
        >
          Go To {project.name}
          <ArrowRight className="mt-0.5 ml-1" size={16} />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectOverview;
