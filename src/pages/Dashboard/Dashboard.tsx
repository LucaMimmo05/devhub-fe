import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PageContainer from "@/layouts/PageContainer";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Plus, FolderGit2 } from "lucide-react";
import Task from "@/components/ui/Task";
import QuickNote from "@/components/ui/QuickNote";
import GithubActivity from "@/components/ui/GithubActivity";
import { useAuth } from "@/context/AuthContext";
import ProjectOverview from "@/components/ui/ProjectOverview";
import { githubActivityMock, notesMock, taskMock } from "@/mock/dashboard-mock";
import { useEffect, useState } from "react";
import { getUserProject } from "@/services/projectService";
import type { ProjectType } from "@/types/projectType";
const Dashboard = () => {
  const [previewProjects, setPreviewProjects] = useState<ProjectType[]>([]);
  useEffect(() => {
    const loadTwoProjects = () => {
      getUserProject(2).then(setPreviewProjects).catch(console.error);
    };
    loadTwoProjects();
  }, []);

  const { user } = useAuth();
  return (
    <PageContainer className="flex flex-col gap-6 w-full xl:h-full xl:overflow-hidden">
      <div className="grid grid-cols-1 xl:grid-rows-[1fr] xl:grid-cols-3 gap-10 w-full flex-1 min-h-0">
        <div className="xl:col-span-2 flex flex-col gap-6 xl:h-full xl:min-h-0">
          <Card className="bg-transparent p-0 border-none w-full md:w-2/3 flex flex-col justify-center shrink-0">
            <CardHeader className="p-0">
              <CardTitle className="text-3xl">Hi {user?.firstName}!</CardTitle>
              <CardDescription className="max-w-md text-base">
                You currently have X pending tasks. Let’s keep moving forward
                and get things done.
              </CardDescription>
            </CardHeader>
          </Card>
          <div className="shrink-0 md:flex hidden flex-col gap-4 xl:gap-2">
            <div className="flex gap-0.5 flex-col shrink-0">
              <CardTitle className="text-base md:text-lg xl:text-base">
                Here's the latest projects
              </CardTitle>
              <CardDescription className="xl:text-sm">
                Check out the progress on your current projects.
              </CardDescription>
            </div>
            <div className="flex flex-wrap flex-col gap-6 md:flex-row xl:gap-4 min-h-0">
              {previewProjects && previewProjects.length > 1 ? (
                previewProjects.slice(0, 2).map((project) => {
                  return <ProjectOverview key={project.id} project={project} />;
                })
              ) : (
                <Card className="hidden md:flex w-full flex-col items-center justify-center p-6 border-dashed shadow-none bg-muted/10 h-64 xl:h-40 xl:p-4">
                  <div className="flex flex-col items-center gap-2 text-center xl:gap-1">
                    <FolderGit2 className="h-10 w-10 text-muted-foreground/50 xl:h-6 xl:w-6" />
                    <h3 className="font-semibold text-lg mt-2 xl:text-base xl:mt-1">
                      No projects found
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
              <CardFooter className="flex justify-end pt-1 pb-2 ">
                <Button
                  variant="link"
                  size="sm"
                  className="cursor-pointer flex items-center gap-1 p-0"
                >
                  View All Activity{" "}
                  <ArrowRight className="mt-0.5 ml-1" size={16} />
                </Button>
              </CardFooter>
            </Card>
            <Card className="flex-1 w-full sm:min-w-75 flex flex-col min-h-75 xl:h-full xl:min-h-0">
              <CardHeader className="pb-1">
                <CardTitle className="text-base md:text-lg">
                  Quick Notes
                </CardTitle>
                <Separator className="" />
              </CardHeader>

              <CardContent className=" flex flex-col flex-1 overflow-auto pb-0">
                {notesMock.slice(0, 3).map((note) => (
                  <QuickNote key={note.id} note={note} />
                ))}
              </CardContent>

              <CardFooter className="pt-1 pb-2">
                <Button
                  variant="link"
                  size="sm"
                  className="cursor-pointer flex items-center gap-1 p-0"
                >
                  <Plus size={14} />
                  New Note
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        <Card className="min-h-64 xl:min-h-0 flex flex-col xl:h-full">
          <CardHeader className=" shrink-0">
            <CardTitle className="text-base md:text-lg">Recent Tasks</CardTitle>
            <Separator />
          </CardHeader>

          <CardContent className="flex flex-col gap-4 flex-1 overflow-auto">
            {taskMock.slice(0, 5).map((task) => (
              <Task key={task.id} task={task} />
            ))}
          </CardContent>

          <CardFooter className="flex justify-end pt-1 pb-2 shrink-0">
            <Button
              variant="link"
              size="sm"
              className="cursor-pointer flex items-center gap-1 p-0"
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
