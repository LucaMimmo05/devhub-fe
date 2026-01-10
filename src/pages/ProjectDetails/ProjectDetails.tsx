import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Member from "@/components/ui/Member";
import { Progress } from "@/components/ui/progress";
import TaskTable from "@/components/ui/TaskTable";
import PageContainer from "@/layouts/PageContainer";
import { membersMock, taskMock } from "@/mock/dashboard-mock";
import type { ProjectType } from "@/types/projectType";
import { taskColumns } from "@/types/taskType";
import { ArrowLeft } from "lucide-react";
import { useLoaderData, useNavigate } from "react-router-dom";

const ProjectDetails = () => {
  const { project } = useLoaderData() as {
    project: ProjectType;
  };
  const navigate = useNavigate();

  const filteredTasks = taskMock.filter(
    (taskMock) => taskMock.project === project?.id
  );

  const filteredMembers = membersMock.filter(
    (member) => member.projectId === project.id
  );

  return (
    <PageContainer className="flex flex-col min-h-screen lg:min-h-0 lg:h-full">
      <div className="flex flex-col lg:flex-row gap-6 flex-1 lg:min-h-0">
        <div className="flex flex-col gap-6 lg:flex-2 lg:min-h-0 min-w-0">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <Button
                className="rounded-full"
                onClick={() => navigate("/projects")}
                variant="outline"
              >
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
              <p className="text-muted-foreground">
                {project?.progress}% complete
              </p>
              <Progress value={project?.progress} className="h-1 w-full" />
            </div>
          </div>

          <Card className="flex flex-col lg:flex-1 lg:min-h-0">
            <CardHeader>
              <CardTitle>Total Tasks</CardTitle>
            </CardHeader>
            <CardContent className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
              <div className="overflow-x-auto">
                <TaskTable columns={taskColumns} data={filteredTasks} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="flex flex-col lg:flex-1 lg:min-h-0 min-w-0">
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent className="lg:flex-1 lg:overflow-y-auto lg:min-h-0 space-y-3">
            {filteredMembers.map((member) => (
              <Member key={member.id} member={member} />
            ))}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default ProjectDetails;
