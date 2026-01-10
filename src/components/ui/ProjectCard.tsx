import { ArrowRight, Calendar, Ellipsis } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Button } from "./button";
import PriorityBadge from "./PriorityBadge";
import { Badge } from "./badge";
import { Separator } from "./separator";
import { useNavigate } from "react-router-dom";
import type { ProjectType } from "@/types/projectType";

export type ProjectProps = {
  project: ProjectType
}

const ProjectCard = ({ project }: ProjectProps) => {
  const navigate = useNavigate();
  return (
    <Card className="xl:min-w-120 min-w-100 flex-1 lg:max-w-[calc(50%-1rem)]">
      <CardHeader className="flex  flex-row justify-between items-center pb-3">
        <div className="flex flex-row gap-4 items-center">
          <img
            className="rounded-lg"
            width={80}
            height={80}
            src="http://placehold.co/80x80"
            alt=""
          />
          <div className="space-y-1">
            <CardTitle>{project.name}</CardTitle>
            <CardDescription className="hidden sm:block md:texty-base text-sm">
              {project.description}
            </CardDescription>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="p-3" variant={"outline"}>
              <Ellipsis size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuGroup>
              <DropdownMenuItem>Project Settings</DropdownMenuItem>
              <DropdownMenuItem>Manage members</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>Archive Project</DropdownMenuItem>
              <DropdownMenuItem>Delete Project</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-x-3 pb-2">
        <PriorityBadge data={project.status}>{project.status}</PriorityBadge>
        <Badge variant="outline" className="hover:bg-inset text-xs shrink-0">
          {project.tasksCount} Tasks
        </Badge>
      </CardContent>
      <CardFooter className="flex-col">
        <Separator />
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <p className="text-muted-foreground text-sm">
              {project.dueDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <Button
            variant="link"
            size="sm"
            className="hover:bg-inset cursor-pointer px-2 ml-auto"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            Go To {project.name}
            <ArrowRight size={16} />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
