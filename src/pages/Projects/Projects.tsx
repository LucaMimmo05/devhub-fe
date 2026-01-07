import ProjectCard from "@/components/ui/ProjectCard";
import PageContainer from "@/layouts/PageContainer";

const Projects = () => {
  const projectMock = [
    {
      id: 1,
      name: "Website Redesign",
      description: "Redesign the corporate website for better UX.",
      status: "In Progress",
      tasksCount: 12,
      progress: 65,
      membersNumber: 5,
      dueDate: new Date("2024-12-31"),
    },
    {
      id: 2,
      name: "Mobile App Launch",
      description: "Launch the new mobile application on iOS and Android.",
      status: "Completed",
      tasksCount: 8,
      progress: 100,
      membersNumber: 3,
      dueDate: new Date("2024-11-15"),
    },
    {
      id: 3,
      name: "Marketing Campaign",
      description: "Execute the summer marketing campaign.",
      status: "Pending",
      tasksCount: 15,
      progress: 20,
      membersNumber: 7,
      dueDate: new Date("2025-01-20"),
    },
    {
      id: 4,
      name: "Customer Feedback Analysis",
      description: "Analyze customer feedback for product improvements.",
      status: "In Progress",
      tasksCount: 10,
      progress: 50,
      membersNumber: 4,
      dueDate: new Date("2024-12-10"),
    },
    {
      id: 5,
      name: "Cloud Migration",
      description: "Migrate services to the cloud infrastructure.",
      status: "Pending",
      tasksCount: 20,
      progress: 10,
      membersNumber: 6,
      dueDate: new Date("2025-02-28"),
    },
    {
      id: 6,
      name: "Security Audit",
      description: "Conduct a comprehensive security audit.",
      status: "Completed",
      tasksCount: 5,
      progress: 100,
      membersNumber: 2,
      dueDate: new Date("2024-10-31"),
    },
    {
      id: 7,
      name: "Security Audit",
      description: "Conduct a comprehensive security audit.",
      status: "Completed",
      tasksCount: 5,
      progress: 100,
      membersNumber: 2,
      dueDate: new Date("2024-10-31"),
    },
  ];
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
