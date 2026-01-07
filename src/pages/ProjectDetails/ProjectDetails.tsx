import PageContainer from "@/layouts/PageContainer";
import type { ProjectProps } from "@/types/projectType";
import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";

const ProjectDetails = () => {
  const { project: loaderProject } = useLoaderData() as {
    project: ProjectProps["project"];
  };
  const [project, setProject] = useState<ProjectProps["project"] | null>(null);

  useEffect(() => {
    setProject(loaderProject);
  }, [loaderProject]);
  return <PageContainer>ProjectDetails {project?.name}</PageContainer>;
};

export default ProjectDetails;
