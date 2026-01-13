import NoData from "@/components/ui/NoData";
import ProjectCard from "@/components/ui/ProjectCard";
import PageContainer from "@/layouts/PageContainer";
import { getUserProject } from "@/services/projectService";
import type { ProjectType } from "@/types/projectType";
import { useEffect, useState } from "react";

const Projects = () => {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  useEffect(() => {
    getUserProject().then(setProjects).catch(console.error);
  }, []);

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
    </PageContainer>
  );
};

export default Projects;
