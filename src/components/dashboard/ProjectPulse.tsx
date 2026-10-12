import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ProjectAvatar, TaskProgress } from "@/components/projects/projectParts";
import { relativeDue, taskStats } from "@/components/projects/projectUtils";
import { useProjectsTasks } from "@/hooks/queries/useTasks";
import type { ProjectType } from "@/types/projectType";
import { cn } from "@/lib/utils";

/** Active projects, soonest deadline first: progress, deadline and the next task in each. */
const ProjectPulse = ({ projects }: { projects: ProjectType[] }) => {
  const active = projects
    .filter((p) => p.status === "PENDING" || p.status === "IN_PROGRESS")
    .sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"))
    .slice(0, 4);
  const tasksByProject = useProjectsTasks(active.map((p) => p.id));

  return (
    <ul className="flex flex-col">
      {active.map((p) => {
        const stats = taskStats(tasksByProject.get(p.id));
        const due = relativeDue(p.dueDate, p.status);
        return (
          <li key={p.id}>
            <Link to={`/projects/${p.id}`} className="group flex gap-3 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-muted/40">
              <ProjectAvatar project={p} size="sm" />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-medium group-hover:text-primary">{p.title}</span>
                  {due && (
                    <span className={cn("shrink-0 text-[11px] tabular-nums", due.late ? "text-red-400" : (due.days ?? 99) <= 7 ? "text-amber-400" : "text-muted-foreground")}>
                      {due.rel ?? due.label}
                    </span>
                  )}
                </span>
                <TaskProgress stats={stats} className="mt-1.5" />
                <span className="mt-1 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                  {stats?.next ? (
                    <>
                      <ArrowRight className="h-3 w-3 shrink-0" />
                      <span className="truncate">{stats.next.title}</span>
                    </>
                  ) : stats ? (
                    stats.total ? "All tasks done" : "No tasks yet"
                  ) : (
                    " "
                  )}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default ProjectPulse;
