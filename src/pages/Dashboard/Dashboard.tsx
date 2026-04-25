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
import { ArrowRight, Plus, FolderGit2, CheckSquare, FileText, Terminal } from "lucide-react";
import Task from "@/components/ui/Task";
import QuickNote from "@/components/ui/QuickNote";
import GithubActivity from "@/components/ui/GithubActivity";
import ProjectOverview from "@/components/ui/ProjectOverview";
import { githubActivityMock } from "@/mock/dashboard-mock";
import { useEffect, useState } from "react";
import { getUserProject } from "@/services/projectService";
import { getMyTasks } from "@/services/taskService";
import { getMyNotes } from "@/services/noteService";
import type { ProjectType } from "@/types/projectType";
import type { TaskType } from "@/types/taskType";
import type { NoteType } from "@/types/noteType";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const GREETINGS = [
  "Good to see you",
  "Welcome back",
  "Ready to build something?",
  "Let's get to work",
];

function getGreeting(firstName: string) {
  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return `${timeGreeting}, ${firstName}`;
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

const Dashboard = () => {
  const { user } = useAuth();
  const [previewProjects, setPreviewProjects] = useState<ProjectType[]>([]);
  const [allProjects, setAllProjects] = useState<ProjectType[]>([]);
  const [recentTasks, setRecentTasks] = useState<TaskType[]>([]);
  const [allTasks, setAllTasks] = useState<TaskType[]>([]);
  const [recentNotes, setRecentNotes] = useState<NoteType[]>([]);
  const [allNotes, setAllNotes] = useState<NoteType[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getUserProject(2).then(setPreviewProjects).catch(console.error);
    getUserProject().then(setAllProjects).catch(console.error);
    getMyTasks().then((tasks) => {
      setAllTasks(tasks);
      setRecentTasks(tasks.slice(0, 5));
    }).catch(console.error);
    getMyNotes().then((notes) => {
      setAllNotes(notes);
      setRecentNotes(notes.slice(0, 3));
    }).catch(console.error);
  }, []);

  const pendingTasks = allTasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS").length;
  const firstName = user?.firstName ?? "there";

  const stats = [
    {
      label: "Projects",
      value: allProjects.length,
      icon: <FolderGit2 className="h-4 w-4 text-blue-500" />,
      href: "/projects",
    },
    {
      label: "Active Tasks",
      value: pendingTasks,
      icon: <CheckSquare className="h-4 w-4 text-amber-500" />,
      href: "/tasks",
    },
    {
      label: "Notes",
      value: allNotes.length,
      icon: <FileText className="h-4 w-4 text-emerald-500" />,
      href: "/notes",
    },
  ];

  return (
    <PageContainer className="flex flex-col gap-6 w-full xl:h-full xl:overflow-hidden">
      <div className="grid grid-cols-1 xl:grid-rows-[1fr] xl:grid-cols-3 gap-10 w-full flex-1 min-h-0">
        <div className="xl:col-span-2 flex flex-col gap-6 xl:h-full xl:min-h-0">

          {/* Greeting + Stats */}
          <div className="flex flex-col gap-4 shrink-0">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-xl font-bold tracking-tight">
                {getGreeting(firstName)} 👋
              </h2>
              <p className="text-sm text-muted-foreground">{formatDate()}</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {stats.map((stat) => (
                <Link key={stat.label} to={stat.href} className="group">
                  <Card className="py-3 px-4 transition-colors hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                      {stat.icon}
                    </div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Projects preview */}
          <div className="shrink-0 md:flex hidden flex-col gap-4 xl:gap-2">
            <div className="flex gap-0.5 flex-col shrink-0">
              <CardTitle className="text-base md:text-lg xl:text-base">
                Latest projects
              </CardTitle>
            </div>
            <div className="flex flex-wrap flex-col gap-6 md:flex-row xl:gap-4 min-h-0">
              {previewProjects && previewProjects.length > 0 ? (
                previewProjects.slice(0, 2).map((project) => (
                  <ProjectOverview key={project.id} project={project} />
                ))
              ) : (
                <Card className="hidden md:flex w-full flex-col items-center justify-center p-6 border-dashed shadow-none bg-muted/10 h-48 xl:h-36 xl:p-4">
                  <div className="flex flex-col items-center gap-2 text-center xl:gap-1">
                    <FolderGit2 className="h-10 w-10 text-muted-foreground/50 xl:h-6 xl:w-6" />
                    <h3 className="font-semibold text-lg mt-2 xl:text-base xl:mt-1">
                      No projects yet
                    </h3>
                    <Button className="mt-4 xl:mt-2" size="sm" asChild>
                      <Link to="/projects">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Project
                      </Link>
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Activity + Notes */}
          <div className="flex flex-row flex-wrap gap-6 w-full xl:flex-1 xl:min-h-0">
            <Card className="flex-2 w-full sm:min-w-75 flex flex-col min-h-75 xl:h-full xl:min-h-0">
              <CardHeader className="pb-1">
                <CardTitle className="text-base md:text-lg">Activity</CardTitle>
                <Separator />
              </CardHeader>
              <CardContent className="flex flex-col gap-0.5 pb-0 flex-1 overflow-y-auto min-h-0">
                {githubActivityMock.map((activity) => (
                  <GithubActivity key={activity.id} activity={activity} />
                ))}
              </CardContent>
              <CardFooter className="flex justify-end pt-1 pb-2">
                <Button
                  variant="link"
                  size="sm"
                  className="cursor-pointer flex items-center gap-1 p-0"
                  onClick={() => navigate("/github")}
                >
                  View All Activity{" "}
                  <ArrowRight className="mt-0.5 ml-1" size={16} />
                </Button>
              </CardFooter>
            </Card>

            <Card className="flex-1 w-full sm:min-w-75 flex flex-col min-h-75 xl:h-full xl:min-h-0">
              <CardHeader className="pb-1">
                <CardTitle className="text-base md:text-lg">Quick Notes</CardTitle>
                <Separator />
              </CardHeader>
              <CardContent className="flex flex-col flex-1 overflow-auto px-4 py-0 pt-2 pb-0">
                {recentNotes.length > 0 ? (
                  recentNotes.map((note) => (
                    <QuickNote
                      key={note.id}
                      note={note}
                      onClick={() => navigate("/notes", { state: { noteId: note.id } })}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No notes yet</p>
                )}
              </CardContent>
              <CardFooter className="pt-1 pb-2">
                <Button
                  variant="link"
                  size="sm"
                  className="cursor-pointer flex items-center gap-1 p-0"
                  onClick={() => navigate("/notes")}
                >
                  <Plus size={14} />
                  New Note
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Recent Tasks */}
        <Card className="min-h-64 xl:min-h-0 flex flex-col xl:h-full">
          <CardHeader className="shrink-0">
            <CardTitle className="text-base md:text-lg">Recent Tasks</CardTitle>
            <Separator />
          </CardHeader>
          <CardContent className="flex flex-col flex-1 overflow-auto px-4 py-0 pt-2">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <Task key={task.id} task={task} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No tasks yet</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-end pt-1 pb-2 shrink-0">
            <Button
              variant="link"
              size="sm"
              className="cursor-pointer flex items-center gap-1 p-0"
              onClick={() => navigate("/tasks")}
            >
              View All Tasks <ArrowRight className="mt-0.5 ml-1" size={16} />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Dashboard;
