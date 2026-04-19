import type { ProjectType } from "@/types/projectType";
import { Card, CardHeader, CardContent } from "./card";
import PriorityBadge from "./PriorityBadge";
import { Users, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const statusLabel: Record<string, string> = {
  PENDING:     "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED:   "Completed",
  ARCHIVED:    "Archived",
};

const priorityLabel: Record<string, string> = {
  LOW: "Low", MEDIUM: "Medium", HIGH: "High",
};

const formatDate = (d?: string) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const ProjectOverview = ({ project }: { project: ProjectType }) => {
  const navigate = useNavigate();

  return (
    <Card
      className={cn(
        "flex-1 flex flex-col gap-0 cursor-pointer",
        "hover:bg-muted/30 transition-colors"
      )}
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate leading-snug">{project.title}</p>
            {project.description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5 leading-snug">
                {project.description}
              </p>
            )}
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <PriorityBadge data={project.status} className="text-[10px] px-1.5 py-0.5">
            {statusLabel[project.status] ?? project.status}
          </PriorityBadge>
          <PriorityBadge data={project.priority} className="text-[10px] px-1.5 py-0.5">
            {priorityLabel[project.priority] ?? project.priority}
          </PriorityBadge>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {(project.members?.length ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {project.members.length} member{project.members.length !== 1 ? "s" : ""}
            </span>
          )}
          {project.dueDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(project.dueDate)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectOverview;
