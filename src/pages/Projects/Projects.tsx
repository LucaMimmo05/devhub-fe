import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useHeaderActions } from "@/context/HeaderActionsContext";
import {
  createProject,
  getUserProject,
  deleteProject,
  updateProject,
} from "@/services/projectService";
import type { ProjectRequest, ProjectType } from "@/types/projectType";

import PageContainer from "@/layouts/PageContainer";
import Modal from "@/components/ui/Modal";
import NoData from "@/components/ui/NoData";
import ProjectCard from "@/components/ui/ProjectCard";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import type { Priority, Status } from "@/types/PriorityAndStatusType";

const TABS = ["Active", "Archived"] as const;
type Tab = (typeof TABS)[number];

const Projects = () => {
  const { user } = useAuth();
  const { setOnCreate } = useHeaderActions();

  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("Active");
  const [openModal, setOpenModal] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imgUrl] = useState("");
  const [priority, setPriority] = useState<Priority>("LOW");
  const [status, setStatus] = useState<Status>("PENDING");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    getUserProject().then(setProjects).catch(console.error);
  }, []);

  useEffect(() => {
    setOnCreate?.(() => () => setOpenModal(true));
    return () => setOnCreate?.(undefined);
  }, [setOnCreate]);

  const handleClose = () => {
    setOpenModal(false);
    setTitle("");
    setDescription("");
    setPriority("LOW");
    setStatus("PENDING");
    setDueDate(null);
    setCreateError("");
    setCreating(false);
  };

  const handleCreate = async () => {
    if (!title.trim() || !user?.id) return;
    setCreateError("");
    setCreating(true);

    const newProject: ProjectRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
      imageUrl: imgUrl || undefined,
      ownerId: user.id,
      memberIds: [],
      priority,
      status,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
    };

    try {
      const created = await createProject(newProject);
      setProjects((prev) => [...prev, created]);
      handleClose();
    } catch (err: unknown) {
      console.error("Error creating project:", err);
      const msg =
        (err as { response?: { data?: { message?: string; title?: string } } })
          ?.response?.data?.message ??
        (err as { response?: { data?: { message?: string; title?: string } } })
          ?.response?.data?.title ??
        "Failed to create project. Please try again.";
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleArchive = async (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    const updated = await updateProject(id, {
      title: project.title,
      description: project.description,
      imageUrl: project.imageUrl,
      priority: project.priority,
      status: "ARCHIVED",
      dueDate: project.dueDate,
      ownerId: project.ownerId,
    });
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const displayed = projects.filter((p) =>
    activeTab === "Archived" ? p.status === "ARCHIVED" : p.status !== "ARCHIVED"
  );

  return (
    <PageContainer>
      <div className="flex gap-2 mb-4">
        {TABS.map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab)}
          >
            {tab}
            <span className="ml-1.5 text-xs opacity-70">
              {tab === "Archived"
                ? projects.filter((p) => p.status === "ARCHIVED").length
                : projects.filter((p) => p.status !== "ARCHIVED").length}
            </span>
          </Button>
        ))}
      </div>

      {displayed.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {displayed.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
              onArchive={handleArchive}
            />
          ))}
        </div>
      ) : (
        <div className="relative w-full h-[calc(100vh-260px)] flex justify-center items-center">
          <NoData resource={activeTab === "Archived" ? "Archived Projects" : "Projects"} />
        </div>
      )}

      <Modal
        open={openModal}
        onOpenChange={handleClose}
        title="Create new Project"
        description="Fill in the details below to create a new project."
        className="max-w-4xl w-full"
        footer={
          <div className="flex items-center justify-between w-full gap-2">
            {createError && (
              <p className="text-sm text-destructive flex-1">{createError}</p>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={handleClose} disabled={creating}>Cancel</Button>
              <Button onClick={handleCreate} disabled={creating || !title.trim()}>
                {creating && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                Create
              </Button>
            </div>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter project title"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter project description"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate ? dueDate.toISOString().split("T")[0] : ""}
                onChange={(e) =>
                  setDueDate(e.target.value ? new Date(e.target.value) : null)
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(val) => setPriority(val as Priority)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as Status)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default Projects;
