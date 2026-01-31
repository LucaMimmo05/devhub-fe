import type { ProjectType } from "@/types/projectType";
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
  project: ProjectType;
};
const ProjectOverview = ({ project }: ProjectOverviewProps) => {
  return (
    <Card key={project.id} className="flex-1 xl:max-h-36">
      <CardHeader className="pb-4 flex-row justify-between items-center xl:pb-2 xl:px-4 xl:pt-4">
        <div className="flex flex-col space-y-1 xl:space-y-0.5">
          <CardTitle className="xl:text-sm xl:font-medium">
            {project.title}
          </CardTitle>
          <CardDescription className="xl:text-xs xl:leading-tight">
            {project.description}
          </CardDescription>
        </div>
        <div className="flex items-center">
          <User size={16} className="text-muted-foreground xl:w-3 xl:h-3" />
          <span className="ml-1 text-sm text-muted-foreground xl:text-xs">
            {" "}
            {project.members?.length ?? 0}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5 xl:gap-1 xl:px-4 xl:py-1">
        <p className="text-xs text-muted-foreground xl:text-[10px]">
          {project.progress}% complete
        </p>
        <Progress value={project.progress} className="h-1 xl:h-0.5" />
      </CardContent>
      <CardFooter className="flex items-center gap-2 w-full xl:px-4 xl:py-2">
        <PriorityBadge data={project.status}>{project.status}</PriorityBadge>
        <Badge
          variant="outline"
          className="hover:bg-inset text-xs shrink-0 xl:text-[10px] xl:px-1.5 xl:py-0.5"
        >
          0 Tasks
        </Badge>
        <Button
          variant="link"
          size="sm"
          className="hover:bg-inset cursor-pointer px-2 ml-auto xl:text-xs xl:px-1"
        >
          Go To {project.title}
          <ArrowRight className="mt-0.5 ml-1 xl:w-3 xl:h-3" size={16} />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectOverview;
