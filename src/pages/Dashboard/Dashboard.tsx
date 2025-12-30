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
import {
  ArrowRight,
  CheckSquare2,
  Command,
  GitCommit,
  Plus,
  StickyNote,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const taskMockup = [
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

  const notesMockup = [
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
  ];

  return (
    <PageContainer className="flex flex-col gap-6 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        <Card className="min-h-35 col-span-1 lg:min-h-35 bg-primary flex flex-col">
          <CardHeader>
            <CardTitle>Welcome back, User!</CardTitle>
          </CardHeader>

          <CardContent>
            You have 3 task for today. Let's get started!
          </CardContent>
        </Card>

        <Card className="min-h-30 lg:min-h-35">
          <CardHeader className="flex-row  items-center gap-2">
            <CheckSquare2 className="m-0" size={18} />
            <CardTitle>Open Tasks</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-normal">
            12 Active Tasks
          </CardContent>
        </Card>
        <Card className="min-h-30 lg:min-h-35">
          <CardHeader className="flex-row  items-center gap-2">
            <GitCommit className="m-0" size={18} />
            <CardTitle>Commits this week</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-normal">
            12 Commits this week
          </CardContent>
        </Card>
        <Card className="min-h-30 lg:min-h-35">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Command className="m-0" size={18} />
              <CardTitle>Random Command</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-2xl font-normal">
            <CardDescription>Command description</CardDescription>
          </CardContent>
          <CardFooter className="flex justify-end ">
            <Button
              variant="link"
              className=" flex items-center justify-center cursor-pointer"
            >
              See more <ArrowRight className=" mt-0.5" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="flex xl:flex-row flex-col flex-wrap gap-6 w-full h-full">
        <div className="flex flex-wrap gap-6 md:flex-col lg:flex-4">
          <Card
            className="min-h-65 flex
                   w-full flex-2"
          >
            <CardHeader>
              <CardTitle>Project Progress</CardTitle>
            </CardHeader>
          </Card>
          <div className="flex flex-wrap gap-6 flex-2">
            <Card className="min-h-35 flex flex-col flex-2">
              <CardHeader className="pb-0">
                <CardTitle>Quick Notes</CardTitle>
                <Separator className="my-3" />
              </CardHeader>

              {/* 👇 OCCUPA TUTTO LO SPAZIO */}
              <CardContent className="pb-0 flex flex-col gap-3 flex-1">
                {notesMockup.map((note) => (
                  <div className="flex items-center gap-2" key={note.id}>
                    <StickyNote size={16} />
                    <h3 className="font-semibold">{note.title}</h3>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="flex justify-end">
                <Button
                  variant="link"
                  className="cursor-pointer flex items-center gap-2 "
                >
                  <Plus size={16} />
                  New Note
                </Button>
              </CardFooter>
            </Card>

            <Card
              className="min-h-35
                   flex-2"
            >
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>

        <Card className="min-h-50 flex flex-col w-full flex-2">
          <CardHeader className="pb-0">
            <CardTitle>In Progress</CardTitle>
            <Separator className="my-3" />
          </CardHeader>

          <CardContent className="flex flex-col justify-between flex-1">
            {taskMockup.map((task) => (
              <div key={task.id} className="flex items-center gap-4">
                <Checkbox className="rounded" />
                <div className="w-full">
                  <div className="flex justify-between items-center w-full">
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                    <Badge
                      className={cn(
                        "hover:bg-inset",
                        task.priority === "High" && "bg-red-700 text-red-200",
                        task.priority === "Medium" &&
                          "bg-yellow-700 text-yellow-200",
                        task.priority === "Low" && "bg-green-700 text-green-200"
                      )}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{task.status}</p>
                </div>
              </div>
            ))}
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button
              variant="link"
              className="cursor-pointer flex items-center gap-2"
            >
              View All Tasks <ArrowRight className="mt-0.5" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Dashboard;
