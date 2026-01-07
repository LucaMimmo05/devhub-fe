import ProjectCard from "@/components/ui/ProjectCard";
import PageContainer from "@/layouts/PageContainer";
import { projectMock } from "@/mock/dashboard-mock";

const Projects = () => {
  
  return (
    <PageContainer>
      <div className="flex flex-wrap gap-6 w-full">
        {projectMock.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </PageContainer>
  );
};

export default Projects;
