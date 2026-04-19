import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NoData from "@/components/ui/NoData";
import { Progress } from "@/components/ui/progress";
import TaskTable from "@/components/ui/TaskTable";
import TaskSheet from "@/components/ui/TaskSheet";
import PageContainer from "@/layouts/PageContainer";
import { getProjectById, updateProject, addProjectMember, removeProjectMember } from "@/services/projectService";
import { getProjectTasks, createTask } from "@/services/taskService";
import { searchUsers } from "@/services/userService";
import type { ProjectType, ProjectMemberSummary } from "@/types/projectType";
import type { TaskType } from "@/types/taskType";
import { taskColumns } from "@/types/taskType";
import type { Priority, Status } from "@/types/PriorityAndStatusType";
import type { UserSearchResult } from "@/services/userService";
import {
  ArrowLeft,
  Edit2,
  Loader2,
  Plus,
  Trash2,
  User,
  UserPlus,
} from "lucide-react";
import {
  useLoaderData,
  useNavigate,
  type LoaderFunctionArgs,
} from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { Separator } from "@/components/ui/separator";
import PriorityBadge from "@/components/ui/PriorityBadge";
import { useAuth } from "@/context/AuthContext";

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

const MemberCard = ({
  member,
  canRemove,
  onRemove,
}: {
  member: ProjectMemberSummary;
  canRemove: boolean;
  onRemove: (profileId: string) => void;
}) => (
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
    <div className="flex items-center gap-2 shrink-0">
      <Badge
        className={cn(
          "text-xs h-fit",
          member.role === "MEMBER" && "bg-muted text-muted-foreground hover:bg-muted",
          member.role === "OWNER" && "bg-primary text-primary-foreground"
        )}
      >
        {member.role === "OWNER" ? "Owner" : "Member"}
      </Badge>
      {canRemove && member.role !== "OWNER" && (
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => onRemove(member.profileId)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  </div>
);

const ProjectDetails = () => {
  const { project: initialProject } = useLoaderData() as { project: ProjectType };
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState<ProjectType>(initialProject);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Add task modal
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<Priority>("MEDIUM");
  const [taskStatus, setTaskStatus] = useState<Status>("PENDING");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [savingTask, setSavingTask] = useState(false);

  const [editingTask, setEditingTask] = useState<TaskType | null>(null);

  // Edit project modal
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<Priority>("MEDIUM");
  const [editStatus, setEditStatus] = useState<Status>("PENDING");
  const [editDueDate, setEditDueDate] = useState("");
  const [editProgress, setEditProgress] = useState(0);
  const [savingEdit, setSavingEdit] = useState(false);

  // Member management
  const [openMemberModal, setOpenMemberModal] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [addingMember, setAddingMember] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isOwner = !!user && !!project.ownerUsername && user.username === project.ownerUsername;

  useEffect(() => {
    getProjectTasks(project.id)
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoadingTasks(false));
  }, [project.id]);

  const taskHeader: HeaderType[] = [
    { label: "Task", id: 1 },
    { label: "Status", id: 2 },
    { label: "Priority", id: 3 },
    { label: "Due Date", id: 4 },
    { label: "Assigned To", id: 5 },
  ];

  // Task creation
  const handleCloseTaskModal = () => {
    setOpenTaskModal(false);
    setTaskTitle("");
    setTaskDescription("");
    setTaskPriority("MEDIUM");
    setTaskStatus("PENDING");
    setTaskDueDate("");
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) return;
    setSavingTask(true);
    try {
      const created = await createTask({
        title: taskTitle,
        description: taskDescription || undefined,
        status: taskStatus,
        priority: taskPriority,
        dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : undefined,
        projectId: project.id,
      });
      setTasks((prev) => [...prev, created]);
      handleCloseTaskModal();
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setSavingTask(false);
    }
  };

  // Edit project
  const openEdit = () => {
    setEditTitle(project.title);
    setEditDescription(project.description);
    setEditPriority(project.priority);
    setEditStatus(project.status === "ARCHIVED" ? "PENDING" : project.status);
    setEditDueDate(project.dueDate ? project.dueDate.split("T")[0] : "");
    setEditProgress(project.progress);
    setOpenEditModal(true);
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const updated = await updateProject(project.id, {
        title: editTitle,
        description: editDescription,
        priority: editPriority,
        status: editStatus,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : undefined,
        progress: editProgress,
        ownerId: project.ownerId,
      });
      setProject(updated);
      setOpenEditModal(false);
    } catch (err) {
      console.error("Failed to update project:", err);
    } finally {
      setSavingEdit(false);
    }
  };

  // Member search
  const handleMemberSearch = (value: string) => {
    setMemberSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await searchUsers(value);
        const excludedUsernames = new Set([
          ...project.members.map((m) => m.username),
          project.ownerUsername,
        ].filter(Boolean) as string[]);
        setSearchResults(results.filter((r) => !excludedUsernames.has(r.username)));
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  };

  const handleAddMember = async (profileId: string) => {
    setAddingMember(profileId);
    try {
      const updated = await addProjectMember(project.id, profileId);
      setProject(updated);
      setSearchResults((prev) => prev.filter((r) => r.id !== profileId));
    } catch (err) {
      console.error("Failed to add member:", err);
    } finally {
      setAddingMember(null);
    }
  };

  const handleRemoveMember = async (profileId: string) => {
    setRemovingMember(profileId);
    try {
      const updated = await removeProjectMember(project.id, profileId);
      setProject(updated);
    } catch (err) {
      console.error("Failed to remove member:", err);
    } finally {
      setRemovingMember(null);
    }
  };

  return (
    <PageContainer className="flex flex-col min-h-screen lg:min-h-0 lg:h-full">
      <div className="flex flex-col lg:flex-row gap-6 flex-1 lg:min-h-0">
        {/* Left column: header + tasks */}
        <div className="flex flex-col gap-6 lg:flex-[2] lg:min-h-0 min-w-0">
          {/* Project header */}
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <Button
                className="rounded-full shrink-0"
                onClick={() => navigate("/projects")}
                variant="outline"
              >
                <ArrowLeft />
              </Button>
              {project.imageUrl && (
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="h-14 w-14 rounded-lg object-cover shrink-0"
                />
              )}
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-semibold truncate">{project.title}</h1>
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {project.description}
                </p>
              </div>
              {isOwner && (
                <Button variant="outline" size="sm" className="shrink-0" onClick={openEdit}>
                  <Edit2 className="h-4 w-4 mr-1" /> Edit
                </Button>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">{project.progress}% complete</p>
              <Progress value={project.progress} className="h-1.5 w-full" />
            </div>
          </div>

          {/* Tasks */}
          <Card className="flex flex-col lg:flex-1 lg:min-h-0">
            <CardHeader className="flex flex-row items-center justify-between shrink-0">
              <CardTitle>Tasks ({tasks.length})</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setOpenTaskModal(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Task
              </Button>
            </CardHeader>
            <CardContent className="lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
              {loadingTasks ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />
                </div>
              ) : tasks.length > 0 ? (
                <div className="overflow-x-auto">
                  <TaskTable
                    columns={taskColumns}
                    data={tasks}
                    header={taskHeader}
                    hasAssignedTo
                    onEdit={setEditingTask}
                  />
                </div>
              ) : (
                <NoData resource="Tasks" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4 lg:w-72 shrink-0">
          {/* Project info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Project Info</CardTitle>
              <Separator />
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Status</span>
                  <PriorityBadge data={project.status} className="w-fit">
                    {statusLabel[project.status] ?? project.status}
                  </PriorityBadge>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Priority</span>
                  <PriorityBadge data={project.priority} className="w-fit">
                    {priorityLabel[project.priority] ?? project.priority}
                  </PriorityBadge>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Due Date</span>
                <span className="text-foreground">
                  {project.dueDate
                    ? new Date(project.dueDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : <span className="text-muted-foreground italic">No due date</span>}
                </span>
              </div>

              {project.ownerUsername && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Owner</span>
                  <div className="flex items-center gap-2">
                    {project.ownerAvatarUrl ? (
                      <img src={project.ownerAvatarUrl} className="h-6 w-6 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                    <span className="text-foreground">@{project.ownerUsername}</span>
                  </div>
                </div>
              )}

              {project.createdAt && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Created</span>
                  <span className="text-foreground">
                    {new Date(project.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}

            </CardContent>
          </Card>

          {/* Members */}
          <Card className="flex flex-col lg:flex-1 lg:min-h-0">
            <CardHeader className="flex flex-row items-center justify-between shrink-0 pb-2">
              <CardTitle className="text-base">
                Members ({project.members?.length ?? 0})
              </CardTitle>
              {isOwner && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setMemberSearch("");
                    setSearchResults([]);
                    setOpenMemberModal(true);
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <Separator />
            <CardContent className="lg:flex-1 lg:overflow-y-auto lg:min-h-0 pt-3 space-y-3">
              {project.members && project.members.length > 0 ? (
                project.members.map((member) => (
                  <MemberCard
                    key={member.profileId}
                    member={member}
                    canRemove={isOwner}
                    onRemove={
                      removingMember === member.profileId
                        ? () => {}
                        : handleRemoveMember
                    }
                  />
                ))
              ) : (
                <NoData resource="Members" />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <TaskSheet
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSaved={(updated) => setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))}
      />

      {/* Add Task Modal */}
      <Modal
        open={openTaskModal}
        onOpenChange={handleCloseTaskModal}
        title="Add Task"
        description="Add a new task to this project."
        footer={
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleCreateTask}
              disabled={savingTask || !taskTitle.trim()}
            >
              {savingTask && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              Create
            </Button>
            <Button variant="outline" onClick={handleCloseTaskModal}>
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
              <Select
                value={taskPriority}
                onValueChange={(v) => setTaskPriority(v as Priority)}
              >
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
              <Select
                value={taskStatus}
                onValueChange={(v) => setTaskStatus(v as Status)}
              >
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

      {/* Edit Project Sheet */}
      <Sheet open={openEditModal} onOpenChange={(open) => !open && setOpenEditModal(false)}>
        <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="px-6 py-5 border-b">
            <SheetTitle>Edit Project</SheetTitle>
            <SheetDescription>{project.title}</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-5 px-6 py-5 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2">
              <Label>Title</Label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Project title"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Description</Label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Priority</Label>
                <Select value={editPriority} onValueChange={(v) => setEditPriority(v as Priority)}>
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
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as Status)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Progress (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={editProgress}
                  onChange={(e) => setEditProgress(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenEditModal(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={savingEdit || !editTitle.trim()}>
              {savingEdit && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Member Modal */}
      <Modal
        open={openMemberModal}
        onOpenChange={() => setOpenMemberModal(false)}
        title="Manage Members"
        description="Search users by username to add them to this project."
        footer={
          <Button variant="outline" onClick={() => setOpenMemberModal(false)}>
            Done
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Search users</Label>
            <Input
              value={memberSearch}
              onChange={(e) => handleMemberSearch(e.target.value)}
              placeholder="Search by username..."
            />
          </div>

          {searchLoading && (
            <div className="flex justify-center py-2">
              <Loader2 className="animate-spin h-4 w-4 text-muted-foreground" />
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto border rounded-md p-2">
              {searchResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {result.avatarUrl ? (
                      <img
                        src={result.avatarUrl}
                        alt={result.username}
                        className="h-8 w-8 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {result.firstName} {result.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{result.username}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={addingMember === result.id}
                    onClick={() => handleAddMember(result.id)}
                  >
                    {addingMember === result.id ? (
                      <Loader2 className="animate-spin h-3.5 w-3.5" />
                    ) : (
                      <UserPlus className="h-3.5 w-3.5" />
                    )}
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Separator />
          <p className="text-sm font-medium">Current Members</p>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {project.members.map((member) => (
              <MemberCard
                key={member.profileId}
                member={member}
                canRemove={isOwner}
                onRemove={handleRemoveMember}
              />
            ))}
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default ProjectDetails;
