import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PageContainer from "@/layouts/PageContainer";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Plus, FolderGit2, Construction, FolderKanban, ListChecks, FileText, Terminal, Calendar, Users } from "lucide-react";
import Task from "@/components/ui/Task";
import QuickNote from "@/components/ui/QuickNote";
import PriorityBadge from "@/components/ui/PriorityBadge";
import { useEffect, useState } from "react";
import { useProjects } from "@/hooks/queries/useProjects";
import { useMyTasks } from "@/hooks/queries/useTasks";
import { useNotes } from "@/hooks/queries/useNotes";
import { useCommands } from "@/hooks/queries/useCommands";
import type { TaskType } from "@/types/taskType";
import { useNavigate } from "react-router-dom";

const statusLabel: Record<string, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

const priorityLabel: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: projects } = useProjects();
  const { data: tasks } = useMyTasks();
  const { data: notes } = useNotes();
  const { data: commands } = useCommands();

  const previewProjects = projects?.slice(0, 3) ?? [];
  const recentTasks = tasks?.slice(0, 5) ?? [];
  const recentNotes = notes?.slice(0, 3) ?? [];

  // Stats
  const totalProjects = projects?.length ?? null;
  const openTasks = tasks?.filter((t: TaskType) => t.status === "PENDING" || t.status === "IN_PROGRESS").length ?? null;
  const totalNotes = notes?.length ?? null;
  const totalCommands = commands?.length ?? null;

  // Clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <PageContainer className="flex flex-col gap-6 w-full xl:h-full xl:overflow-hidden">

      {/* Stats row + clock */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center w-fit rounded-lg border border-border bg-card divide-x divide-border overflow-hidden">
          {[
            { label: "Projects", value: totalProjects, icon: FolderKanban, color: "text-blue-500", onClick: () => navigate("/projects") },
            { label: "Open Tasks", value: openTasks, icon: ListChecks, color: "text-amber-500", onClick: () => navigate("/tasks") },
            { label: "Notes", value: totalNotes, icon: FileText, color: "text-emerald-500", onClick: () => navigate("/notes") },
            { label: "Commands", value: totalCommands, icon: Terminal, color: "text-violet-500", onClick: () => navigate("/commands") },
          ].map(({ label, value, icon: Icon, color, onClick }) => (
            <div
              key={label}
              onClick={onClick}
              className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-muted/40 transition-colors"
            >
              <Icon className={`h-3.5 w-3.5 shrink-0 ${color}`} />
              <span className="text-sm font-semibold">
                {value === null ? <span className="text-muted-foreground/40">—</span> : value}
              </span>
              <span className="text-sm text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Clock */}
        <div className="ml-auto flex flex-col items-end gap-0.5">
          <div className="flex items-baseline gap-1 tabular-nums">
            <span className="text-2xl font-bold tracking-tight leading-none">
              {now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="text-sm font-medium text-muted-foreground leading-none">
              {now.toLocaleTimeString("en-GB", { second: "2-digit" })}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground tracking-wide uppercase">
            {now.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-rows-[1fr] xl:grid-cols-3 gap-10 w-full flex-1 min-h-0">
        <div className="xl:col-span-2 flex flex-col gap-6 xl:h-full xl:min-h-0">

          {/* Latest projects */}
          <div className="shrink-0 md:flex hidden flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Latest projects</span>
              <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => navigate("/projects")}>
                View all <ArrowRight className="ml-1" size={12} />
              </Button>
            </div>
            {previewProjects.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {previewProjects.slice(0, 3).map((project) => (
                  <div
                    key={project.id}
                    className="flex flex-col gap-3 rounded-lg border border-border bg-card px-4 py-3 cursor-pointer hover:bg-muted/40 transition-colors min-w-0"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    {/* Title row */}
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="shrink-0 w-8 h-8 rounded-md bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                        {project.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate leading-tight">{project.title}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5 leading-tight">
                          {project.description || "No description"}
                        </p>
                      </div>
                    </div>
                    {/* Badges + meta */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <PriorityBadge data={project.priority} className="text-[10px] px-1.5 py-0.5">
                          {priorityLabel[project.priority] ?? project.priority}
                        </PriorityBadge>
                        <PriorityBadge data={project.status} className="text-[10px] px-1.5 py-0.5">
                          {statusLabel[project.status] ?? project.status}
                        </PriorityBadge>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground/60 shrink-0">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span className="text-[10px]">{project.members?.length ?? 0}</span>
                        </div>
                        {project.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span className="text-[10px]">
                              {new Date(project.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-3">
                <FolderGit2 className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                <span className="text-sm text-muted-foreground">No projects yet</span>
                <Button size="sm" variant="outline" asChild className="ml-auto h-6 text-xs px-2">
                  <Link to="/projects">Create</Link>
                </Button>
              </div>
            )}
          </div>

          {/* GitHub Activity + Quick Notes */}
          <div className="flex flex-row flex-wrap gap-6 w-full xl:flex-1 xl:min-h-0">
            <Card className="flex-2 w-full sm:min-w-64 flex flex-col min-h-32 xl:h-full xl:min-h-0">
              <CardHeader className="pb-1 shrink-0">
                <CardTitle className="text-base md:text-lg">GitHub Activity</CardTitle>
                <Separator />
              </CardHeader>
              <CardContent className="flex flex-col flex-1 items-center justify-center pb-3 gap-1.5 text-center">
                <Construction className="h-6 w-6 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">GitHub integration coming soon</p>
                <p className="text-xs text-muted-foreground/60">Connect your GitHub account to see your repository activity here.</p>
              </CardContent>
            </Card>

            <Card className="flex-1 w-full sm:min-w-64 flex flex-col min-h-32 xl:h-full xl:min-h-0">
              <CardHeader className="pb-1 shrink-0">
                <CardTitle className="text-base md:text-lg">Quick Notes</CardTitle>
                <Separator />
              </CardHeader>
              <CardContent className="flex flex-col flex-1 overflow-auto px-4 py-0 pt-2 pb-0 min-h-0">
                {recentNotes.length > 0 ? (
                  recentNotes.map((note) => (
                    <QuickNote key={note.id} note={note} onClick={() => navigate("/notes", { state: { noteId: note.id } })} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No notes yet</p>
                )}
              </CardContent>
              <CardFooter className="pt-1 pb-2 shrink-0">
                <Button variant="link" size="sm" className="cursor-pointer flex items-center gap-1 p-0" onClick={() => navigate("/notes/new")}>
                  <Plus size={14} /> New Note
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Task recenti */}
        <Card className="min-h-64 xl:min-h-0 flex flex-col xl:h-full">
          <CardHeader className="shrink-0">
            <CardTitle className="text-base md:text-lg">Recent Tasks</CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className="flex flex-col flex-1 overflow-auto px-4 py-0 pt-2">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => <Task key={task.id} task={task} />)
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No tasks yet</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-end pt-1 pb-2 shrink-0">
            <Button variant="link" size="sm" className="cursor-pointer flex items-center gap-1 p-0" onClick={() => navigate("/tasks")}>
              View All Tasks <ArrowRight className="mt-0.5 ml-1" size={16} />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Dashboard;
