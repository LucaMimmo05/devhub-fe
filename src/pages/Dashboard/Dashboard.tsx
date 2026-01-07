import { Button } from "@/components/ui/button";
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
import { ArrowRight, Plus } from "lucide-react";
import Task from "@/components/ui/Task";
import QuickNote from "@/components/ui/QuickNote";
import GithubActivity from "@/components/ui/GithubActivity";
import { useAuth } from "@/context/AuthContext";
import ProjectOverview from "@/components/ui/ProjectOverview";
const Dashboard = () => {
  const taskMock = [
    {
      id: 1,
      title: "Design new landing page",
      status: "In Progress",
      priority: "Medium",
      createdAt: "2024-10-01",
      updatedAt: "2024-10-03",
      project: "Website Redesign",
    },
    {
      id: 2,
      title: "Fix login bug",
      status: "Pending",
      priority: "High",
      createdAt: "2024-10-01",
      updatedAt: "2024-10-02",
      project: "Authentication Module",
    },
    {
      id: 3,
      title: "Implement task filters",
      status: "In Review",
      priority: "Medium",
      createdAt: "2024-09-29",
      updatedAt: "2024-10-02",
      project: "Task Management",
    },
    {
      id: 4,
      title: "Optimize database queries",
      status: "Completed",
      priority: "Low",
      createdAt: "2024-09-25",
      updatedAt: "2024-09-30",
      project: "Backend Improvements",
    },
    {
      id: 5,
      title: "Setup CI/CD pipeline",
      status: "In Progress",
      priority: "High",
      createdAt: "2024-09-28",
      updatedAt: "2024-10-03",
      project: "DevOps",
    },
    {
      id: 6,
      title: "Perform code review for feature X",
      status: "In Progress",
      priority: "High",
      createdAt: "2024-09-28",
      updatedAt: "2024-10-03",
      project: "Frontend Enhancements",
    },
  ];

  const notesMock = [
    {
      id: 1,
      title: "Meeting Notes",
      content: "Remember to review the PR for the new feature.",
      createdAt: "2024-10-02",
    },
    {
      id: 2,
      title: "Ideas",
      content: "Consider adding a dark mode to the application.",
      createdAt: "2024-10-01",
    },
    {
      id: 3,
      title: "Bug Report",
      content: "Users are experiencing issues with password resets.",
      createdAt: "2024-09-30",
    },
    {
      id: 4,
      title: "Bug Report",
      content: "Users are experiencing issues with password resets.",
      createdAt: "2024-09-30",
    },
  ];

  const githubActivityMock = [
    {
      id: 1,
      type: "PushEvent",
      repo: "devHub/devhub-fe",
      date: new Date("2025-12-30T21:15:00Z"),
      text: "Pushed 3 commits to",
    },
    {
      id: 2,
      type: "PullRequestEvent",
      repo: "devHub/devhub-be",
      date: new Date("2025-12-30T12:15:00Z"),
      text: "Opened a pull request in ",
    },
    {
      id: 3,
      type: "IssueCommentEvent",
      repo: "devHub/devhub-fe",
      date: new Date("2025-12-29T09:45:00Z"),
      text: "Commented on issue #42 in ",
    },
  ];

  const projectMock = [
    {
      id: 1,
      name: "Project Alpha",
      description: "A new marketing website",
      status: "In Progress",
      tasksCount: 12,
      progress: 65,
      membersNumber: 5,
    },
    {
      id: 2,
      name: "Project Beta",
      description: "Mobile app development",
      status: "Completed",
      tasksCount: 8,
      progress: 100,
      membersNumber: 3,
    },
    {
      id: 3,
      name: "Project Gamma",
      description: "Backend API overhaul",
      status: "Pending",
      tasksCount: 15,
      progress: 20,
      membersNumber: 7,
    },
  ];

  const { user } = useAuth();
  return (
    <PageContainer className="flex flex-col gap-6 w-full xl:overflow-hidden">
      <div className="grid grid-cols-1 xl:row-span-3 xl:grid-cols-3 gap-10 w-full flex-1 min-h-0">
        <div className="xl:col-span-2 xl:row-span-2 flex flex-col gap-10 min-h-0">
          <Card className=" bg-transparent p-0 border-none min-h-38 xl:min-h-0 w-full md:w-2/3 flex flex-col justify-center flex-2">
            <CardHeader className="p-0 shrink-0">
              <CardTitle className="text-3xl">
                Hi {user?.firstName}!
              </CardTitle>
              <CardDescription className="max-w-md text-base">
                You currently have X pending tasks. Let’s keep moving forward
                and get things done.
              </CardDescription>
            </CardHeader>
          </Card>
          <div className="flex-4 flex flex-col gap-4 md:flex-col">
            <div className="flex gap-0.5 flex-col">
              <CardTitle className="text-base md:text-lg">
                Here's the latest projects
              </CardTitle>
              <CardDescription>
                Check out the progress on your current projects.
              </CardDescription>
            </div>
            <div className="flex flex-wrap flex-col flex-1 gap-6  md:flex-row">
              {projectMock.slice(0, 2).map((project) => {
                return <ProjectOverview key={project.id} project={project} />;
              })}
            </div>
          </div>

          <div className="xl:flex hidden flex-wrap flex-5 gap-6 xl:h-32 shrink-0">
            <Card className="min-h-40 flex-1 lg:min-h-0 xl:h-full flex flex-col">
              <CardHeader className="pb-1">
                <CardTitle className="text-base md:text-lg">Activity</CardTitle>
                <Separator />
              </CardHeader>
              <CardContent className="flex flex-col gap-1 flex-1 ">
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
            <Card className="min-h-40 flex-1 lg:min-h-20 xl:h-full hidden xl:flex flex-col">
              <CardHeader className="pb-1">
                <CardTitle className="text-base md:text-lg">
                  Quick Notes
                </CardTitle>
                <Separator className="" />
              </CardHeader>

              <CardContent className=" flex flex-col flex-1 overflow-auto pb-0">
                {notesMock.map((note) => (
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

        <Card className="min-h-64 xl:min-h-0 flex flex-col xl:row-span-2">
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
