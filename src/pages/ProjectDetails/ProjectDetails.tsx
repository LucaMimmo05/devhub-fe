import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import NoData from "@/components/ui/NoData";
import { Progress } from "@/components/ui/progress";
import TaskTable from "@/components/ui/TaskTable";
import PageContainer from "@/layouts/PageContainer";
import { getProjectById } from "@/services/projectService";
import { getProjectTasks, createTask } from "@/services/taskService";
import type { ProjectType, ProjectMemberSummary } from "@/types/projectType";
import type { TaskType } from "@/types/taskType";
import { taskColumns } from "@/types/taskType";
import {
  ArrowLeft,
  Loader2,
  Plus,
  User,
} from "lucide-react";
import {
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
} from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Priority, Status } from "@/types/PriorityAndStatusType";

export type HeaderType = {
  label: string;
  id: number;
};

export async function projectDetailsLoader({ params }: LoaderFunctionArgs) {
  if (!params.projectId) {
    throw new Response("Not Found", { status: 404 });
  }
  return {
    project: await getProjectById(params.projectId),
  };
}

const MemberCard = ({ member }: { member: ProjectMemberSummary }) => (
  <div className="flex justify-between items-center gap-2">
    <div className="flex gap-2 items-center min-w-0">
      {member.avatarUrl ? (
        <img
          src={member.avatarUrl}
          alt={member.username}
          className="h-9 w-9 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <div className="flex flex-col min-w-0">
        <h3 className="truncate text-sm font-medium">
          {member.firstName} {member.lastName}
        </h3>
        <p className="text-xs text-muted-foreground truncate">@{member.username}</p>
      </div>
    </div>
    <Badge
      className={cn(
        "text-xs shrink-0 h-fit",
        member.role === "MEMBER" && "bg-muted text-muted-foreground hover:bg-muted",
        member.role === "OWNER" && "bg-primary text-primary-foreground"
      )}
    >
      {member.role === "OWNER" ? "Owner" : "Member"}
    </Badge>
  </div>
);

const ProjectDetails = () => {
  const { project: initialProject } = useLoaderData() as { project: ProjectType };
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<Priority>("MEDIUM");
  const [taskStatus, setTaskStatus] = useState<Status>("PENDING");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProjectTasks(initialProject.id)
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoadingTasks(false));
  }, [initialProject.id]);

  const taskHeader: HeaderType[] = [
    { label: "Task", id: 1 },
    { label: "Status", id: 2 },
    { label: "Priority", id: 3 },
    { label: "Due Date", id: 4 },
    { label: "Assigned To", id: 5 },
  ];

  const handleCloseModal = () => {
    setOpenModal(false);
    setTaskTitle("");
    setTaskDescription("");
    setTaskPriority("MEDIUM");
    setTaskStatus("PENDING");
    setTaskDueDate("");
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) return;
    setSaving(true);
    try {
      const created = await createTask({
        title: taskTitle,
        description: taskDescription || undefined,
        status: taskStatus,
        priority: taskPriority,
        dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : undefined,
        projectId: initialProject.id,
      });
      setTasks((prev) => [...prev, created]);
      handleCloseModal();
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer className="flex flex-col min-h-screen lg:min-h-0 lg:h-full">
      <div className="flex flex-col lg:flex-row gap-6 flex-1 lg:min-h-0">
        <div className="flex flex-col gap-6 lg:flex-[2] lg:min-h-0 min-w-0">
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
                <h1 className="text-2xl">{initialProject?.title}</h1>
                <p className="text-muted-foreground text-sm">
                  {initialProject?.description}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">
                {initialProject?.progress}% complete
              </p>
              <Progress value={initialProject?.progress} className="h-1 w-full" />
            </div>
          </div>

          <Card className="flex flex-col lg:flex-1 lg:min-h-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tasks ({tasks.length})</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setOpenModal(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Task
              </Button>
            </CardHeader>
            <CardContent className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
              {loadingTasks ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <TaskTable
                    columns={taskColumns}
                    data={tasks}
                    header={taskHeader}
                    hasAssignedTo
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="flex flex-col lg:flex-1 lg:min-h-0 min-w-0">
          <CardHeader>
            <CardTitle>Members ({initialProject.members?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent className="lg:flex-1 lg:overflow-y-auto lg:min-h-0 space-y-3">
            {initialProject.members && initialProject.members.length > 0 ? (
              initialProject.members.map((member) => (
                <MemberCard key={member.profileId} member={member} />
              ))
            ) : (
              <NoData resource="Members" />
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        open={openModal}
        onOpenChange={handleCloseModal}
        title="Add Task"
        description="Add a new task to this project."
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={handleCreateTask} disabled={saving || !taskTitle.trim()}>
              {saving && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              Create
            </Button>
            <Button variant="outline" onClick={handleCloseModal}>
              Cancel
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Title</Label>
            <Input
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Task title"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Description</Label>
            <Textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Priority</Label>
              <Select value={taskPriority} onValueChange={(v) => setTaskPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <Select value={taskStatus} onValueChange={(v) => setTaskStatus(v as Status)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Due Date</Label>
            <Input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default ProjectDetails;
