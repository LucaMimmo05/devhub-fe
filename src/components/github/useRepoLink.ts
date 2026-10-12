import { useProjects, useUpdateProject } from "@/hooks/queries/useProjects";
import { useAuth } from "@/context/AuthContext";
import { apiErrorMessage } from "@/utils/githubAuth";
import { toast } from "sonner";

/**
 * Linking repositories to DevHub projects (one repo per project). Only the project owner can
 * change the link; the backend enforces this too.
 */
export const useRepoLink = () => {
  const { user } = useAuth();
  const { data: projects = [] } = useProjects();
  const updateProject = useUpdateProject();

  const projectFor = (fullName: string) => projects.find((p) => p.githubRepo?.toLowerCase() === fullName.toLowerCase());
  const ownedProjects = projects.filter((p) => p.ownerUsername === user?.username && p.status !== "ARCHIVED");
  const canEdit = (fullName: string) => {
    const linked = projectFor(fullName);
    return !linked || linked.ownerUsername === user?.username;
  };

  /** Points `fullName` at `projectId` (null unlinks), clearing the repo's previous project. */
  const link = async (fullName: string, projectId: string | null) => {
    const current = projectFor(fullName);
    try {
      if (current && current.id !== projectId) {
        await updateProject.mutateAsync({ id: current.id, data: { githubRepo: "" } });
      }
      if (projectId) {
        await updateProject.mutateAsync({ id: projectId, data: { githubRepo: fullName } });
        toast.success(`Linked to ${projects.find((p) => p.id === projectId)?.title ?? "project"}`);
      } else {
        toast.success("Repository unlinked");
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, "Couldn't update the link."));
    }
  };

  /** Picker options: the user's projects, flagging those already linked to another repo. */
  const options = (fullName: string) => [
    ...ownedProjects.map((p) => ({
      value: p.id,
      label: p.title,
      hint: p.githubRepo && p.githubRepo.toLowerCase() !== fullName.toLowerCase() ? `replaces ${p.githubRepo.split("/")[1]}` : undefined,
    })),
    ...(projectFor(fullName) ? [{ value: "", label: "Unlink" }] : []),
  ];

  return { projects, projectFor, ownedProjects, canEdit, link, options, pending: updateProject.isPending };
};
