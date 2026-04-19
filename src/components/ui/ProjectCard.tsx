import type { ProjectType } from "@/types/projectType";
import { ArrowRight, Calendar, Ellipsis, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "./badge";
import { Button } from "./button";
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
import PriorityBadge from "./PriorityBadge";
import { Separator } from "./separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

export type ProjectProps = {
  project: ProjectType;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
};

const ProjectCard = ({ project, onDelete, onArchive }: ProjectProps) => {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [archiving, setArchiving] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete?.(project.id);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleArchive = async () => {
    setArchiving(true);
    try {
      await onArchive?.(project.id);
    } finally {
      setArchiving(false);
    }
  };

  const isArchived = project.status === "ARCHIVED";

  return (
    <>
      <Card className="flex flex-col h-full hover:border-[#1091F3] hover:shadow-md transition-all duration-200 cursor-pointer">
        <CardHeader className="flex flex-row justify-between items-center pb-3">
          <div className="flex flex-row gap-4 items-center min-w-0">
            {project.imageUrl ? (
              <img
                className="rounded-lg shrink-0"
                width={80}
                height={80}
                src={project.imageUrl}
                alt={project.title}
              />
            ) : (
              <div className="rounded-lg bg-muted flex items-center justify-center shrink-0 w-20 h-20 text-2xl font-bold text-muted-foreground">
                {project.title.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="truncate">{project.title}</CardTitle>
                {isArchived && (
                  <Badge variant="secondary" className="text-xs shrink-0">Archived</Badge>
                )}
              </div>
              <CardDescription className="hidden sm:block text-sm line-clamp-2">
                {project.description}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="p-3 shrink-0" variant="outline">
                <Ellipsis size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate(`/projects/${project.id}`)}>
                  View Details
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {!isArchived && (
                  <DropdownMenuItem onClick={handleArchive} disabled={archiving}>
                    {archiving && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                    Archive Project
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="space-x-3 pb-2">
          <PriorityBadge data={project.priority}>{project.priority}</PriorityBadge>
          <PriorityBadge data={project.status}>{project.status}</PriorityBadge>
        </CardContent>

        <CardFooter className="flex-col">
          <Separator />
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <p className="text-muted-foreground text-sm">
                {project?.dueDate
                  ? new Date(project.dueDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "No Due Date"}
              </p>
            </div>
            <Button
              variant="link"
              size="sm"
              className="hover:bg-inset cursor-pointer px-2 ml-auto"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              Go To {project.title}
              <ArrowRight size={16} />
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{project.title}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectCard;
