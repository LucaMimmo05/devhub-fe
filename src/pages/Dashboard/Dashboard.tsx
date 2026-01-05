import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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

const Dashboard = () => {
  const taskMock = [
    {
      id: 1,
      title: "Design new landing page",
      status: "In Progress",
      priority: "Medium",
      createdAt: "2024-10-01",
      updatedAt: "2024-10-03",
    },
    {
      id: 2,
      title: "Fix login bug",
      status: "Pending",
      priority: "High",
      createdAt: "2024-10-01",
      updatedAt: "2024-10-02",
    },
    {
      id: 3,
      title: "Implement task filters",
      status: "In Review",
      priority: "Medium",
      createdAt: "2024-09-29",
      updatedAt: "2024-10-02",
    },
    {
      id: 4,
      title: "Optimize database queries",
      status: "Completed",
      priority: "Low",
      createdAt: "2024-09-25",
      updatedAt: "2024-09-30",
    },
    {
      id: 5,
      title: "Setup CI/CD pipeline",
      status: "In Progress",
      priority: "High",
      createdAt: "2024-09-28",
      updatedAt: "2024-10-03",
    },
    {
      id: 5,
      title: "Setup CI/CD pipeline",
      status: "In Progress",
      priority: "High",
      createdAt: "2024-09-28",
      updatedAt: "2024-10-03",
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

  const githubActivityMockup = [
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

  return (
    <PageContainer className="flex flex-col gap-6 w-full xl:overflow-hidden">
      <div className="grid grid-cols-1 xl:row-span-3 xl:grid-cols-3 gap-6 w-full flex-1 min-h-0">
        <div className="xl:col-span-2 xl:row-span-2 flex flex-col gap-6 min-h-0">
          <Card className="min-h-48 xl:min-h-0 flex flex-col flex-3/5">
            <CardHeader className="pb-1 shrink-0">
              <CardTitle className="text-base md:text-lg">
                Projects Overview
              </CardTitle>
              <Separator />
            </CardHeader>
            <CardContent className="flex flex-col gap-2 flex-1 overflow-auto"></CardContent>
          </Card>

          <div className="flex flex-wrap xl:flex-2/5 gap-6 xl:h-32 shrink-0">
            <Card className="min-h-40 flex-1 lg:min-h-0 xl:h-full flex flex-col">
              <CardHeader className="pb-1">
                <CardTitle className="text-base md:text-lg">Activity</CardTitle>
                <Separator />
              </CardHeader>
              <CardContent className="flex flex-col gap-1 flex-1 ">
                {githubActivityMockup.map((activity) => (
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
            <Card className="min-h-40 flex-1 lg:min-h-20 xl:h-full flex flex-col">
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
            <CardTitle className="text-base md:text-lg">In Progress</CardTitle>
            <Separator />
          </CardHeader>

          <CardContent className="flex flex-col gap-2 flex-1 overflow-auto">
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
