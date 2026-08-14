import { useEffect, useState } from "react";
import {
  useProjects,
  useDeleteProject,
  useUpdateProject,
} from "@/hooks/queries/useProjects";

import PageContainer from "@/layouts/PageContainer";
import NoData from "@/components/ui/NoData";
import ProjectCard from "@/components/ui/ProjectCard";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const TABS = ["Active", "Archived"] as const;
type Tab = (typeof TABS)[number];

const Projects = () => {
  const { data: projects = [], isError } = useProjects();
  const deleteProjectMutation = useDeleteProject();
  const updateProjectMutation = useUpdateProject();

  const [activeTab, setActiveTab] = useState<Tab>("Active");

  useEffect(() => {
    if (isError) toast.error("Failed to load projects.");
  }, [isError]);

  const handleDelete = async (id: string) => {
    try {
      await deleteProjectMutation.mutateAsync(id);
      toast.success("Project deleted.");
    } catch {
      toast.error("Failed to delete project.");
    }
  };

  const handleArchive = async (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    try {
      await updateProjectMutation.mutateAsync({
        id,
        data: {
          title: project.title,
          description: project.description,
          imageUrl: project.imageUrl,
          priority: project.priority,
          status: "ARCHIVED",
          dueDate: project.dueDate,
          ownerId: project.ownerId,
        },
      });
      toast.success("Project archived.");
    } catch {
      toast.error("Failed to archive project.");
    }
  };

  const handleUnarchive = async (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    try {
      await updateProjectMutation.mutateAsync({
        id,
        data: {
          title: project.title,
          description: project.description,
          imageUrl: project.imageUrl,
          priority: project.priority,
          status: "PENDING",
          dueDate: project.dueDate,
          ownerId: project.ownerId,
        },
      });
      toast.success("Project unarchived.");
    } catch {
      toast.error("Failed to unarchive project.");
    }
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
              onUnarchive={handleUnarchive}
            />
          ))}
        </div>
      ) : (
        <div className="relative w-full h-[calc(100vh-260px)] flex justify-center items-center">
          <NoData resource={activeTab === "Archived" ? "Archived Projects" : "Projects"} />
        </div>
      )}
    </PageContainer>
  );
};

export default Projects;
