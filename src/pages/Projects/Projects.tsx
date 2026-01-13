import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useHeaderActions } from "@/context/HeaderActionsContext";
import { createProject, getUserProject } from "@/services/projectService";
import type { ProjectRequest, ProjectType } from "@/types/projectType";

import PageContainer from "@/layouts/PageContainer";
import Modal from "@/components/ui/Modal";
import NoData from "@/components/ui/NoData";
import ProjectCard from "@/components/ui/ProjectCard";

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

export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type Status = "PENDING" | "IN_PROGRESS" | "COMPLETED";

const Projects = () => {
  const { user } = useAuth();
  const { setOnCreate } = useHeaderActions();

  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [openModal, setOpenModal] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [priority, setPriority] = useState<Priority>("LOW");
  const [status, setStatus] = useState<Status>("PENDING");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [progress, setProgress] = useState<number>(0);

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
    setImgUrl("");
    setFile(null);
    setPreview("");
    setMemberIds([]);
    setPriority("LOW");
    setStatus("PENDING");
    setDueDate(null);
    setProgress(0);
  };

  const handleCreate = async () => {
    if (!title || !description || !user?.id) return;

    const newProject: ProjectRequest = {
      title,
      description,
      imgUrl: imgUrl || undefined,
      owner: user.id,
      members: memberIds,
      priority,
      status,
      dueDate: dueDate || undefined,
      progress,
    };

    try {
      const created = await createProject(newProject);
      setProjects((prev) => [...prev, created]);
      handleClose();
    } catch (err) {
      console.error("Error creating project:", err);
      alert("Failed to create project. Check console for details.");
    }
  };

  return (
    <PageContainer>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <NoData resource="Projects" />
        )}
      </div>

      <Modal
        open={openModal}
        onOpenChange={handleClose}
        title="Create new Project"
        description="Fill in the details below to create a new project."
        className="max-w-4xl w-full"
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={handleCreate}>Create</Button>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
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
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="text"
                placeholder="YYYY-MM-DD"
                value={dueDate ? dueDate.toISOString().split("T")[0] : ""}
                onChange={(e) =>
                  setDueDate(e.target.value ? new Date(e.target.value) : null)
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="imgUrl">Image URL</Label>
              <Input
                id="imgUrl"
                type="url"
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                placeholder="Enter image URL"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="imageFile">Upload Image</Label>
              <Input
                className="py-5 text-center"
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) {
                    setFile(selected);
                    setPreview(URL.createObjectURL(selected));
                  }
                }}
              />
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="mt-2 w-40 h-40 object-cover rounded"
                />
              )}
            </div>

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
                  <SelectItem value="LOW">LOW</SelectItem>
                  <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                  <SelectItem value="HIGH">HIGH</SelectItem>
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
                  <SelectItem value="PENDING">PENDING</SelectItem>
                  <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
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
