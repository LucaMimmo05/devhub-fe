import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import TaskTable from "@/components/ui/TaskTable";
import PageContainer from "@/layouts/PageContainer";
import { taskMock } from "@/mock/dashboard-mock";
import type { ProjectProps } from "@/types/projectType";
import { taskColumns } from "@/types/taskType";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";

const ProjectDetails = () => {
  const { project: loaderProject } = useLoaderData() as {
    project: ProjectProps["project"];
  };
  const [project, setProject] = useState<ProjectProps["project"] | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const navigate = useNavigate();

  const taskData = taskMock.filter((taskMock) => taskMock.project === project?.id );

  useEffect(() => {
    setProject(loaderProject);
  }, [loaderProject]);
  return (
    <PageContainer className="flex gap-6">
      <div className="flex-3 flex flex-col gap-6">
        <div className="flex flex-col gap-4 ">
          <div className="flex items-center gap-4">
            <Button className="rounded-full" onClick={() => {navigate("/projects")}} variant={"outline"}>
              <ArrowLeft />
            </Button>
            <div className="flex flex-col gap-0.5">
              <h1 className="text-2xl">{project?.name}</h1>
              <p className="text-muted-foreground text-sm">
                {project?.description}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <p className=" text-muted-foreground">
              {project?.progress}% complete
            </p>
            <Progress value={project?.progress} className="h-1 w-full " />
          </div>
        </div>
        <Card className="flex-3 flex flex-col scrollbar ">
          <CardHeader>
            <CardTitle>Total Tasks</CardTitle>
          </CardHeader>
          <CardContent className="h-120 overflow-y-auto">
            <TaskTable columns={taskColumns} data={taskMock} />
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col gap-6 flex-2 items-end">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border shadow-sm shrink-0 min-w-70 w-xs"
          captionLayout="label"
        />
        <Card className="flex-1 w-full">
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
        </Card>
      </div>
    </PageContainer>
  );
};

export default ProjectDetails;
