import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserProject,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
} from "@/services/projectService";
import type { ProjectRequest, ProjectType } from "@/types/projectType";
import { queryKeys } from "./keys";

export const useProjects = (limit?: number) =>
  useQuery<ProjectType[]>({
    queryKey: queryKeys.projects.list(limit),
    queryFn: () => getUserProject(limit),
  });

export const useProject = (projectId: string, initialData?: ProjectType) =>
  useQuery<ProjectType>({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => getProjectById(projectId),
    initialData,
    enabled: !!projectId,
  });

const patchProjectCaches = (
  queryClient: ReturnType<typeof useQueryClient>,
  updated: ProjectType
) => {
  queryClient.setQueryData(queryKeys.projects.detail(updated.id), updated);
  queryClient.setQueryData<ProjectType[]>(queryKeys.projects.list(), (old) =>
    old?.map((p) => (p.id === updated.id ? updated : p))
  );
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: (created: ProjectType) => {
      queryClient.setQueryData<ProjectType[]>(queryKeys.projects.list(), (old) =>
        old ? [created, ...old] : [created]
      );
      queryClient.setQueryData(queryKeys.projects.detail(created.id), created);
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectRequest> }) =>
      updateProject(id, data),
    onSuccess: (updated: ProjectType) => patchProjectCaches(queryClient, updated),
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: (_void, id) => {
      queryClient.setQueryData<ProjectType[]>(queryKeys.projects.list(), (old) =>
        old?.filter((p) => p.id !== id)
      );
      queryClient.removeQueries({ queryKey: queryKeys.projects.detail(id) });
    },
  });
};

export const useAddProjectMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, profileId }: { projectId: string; profileId: string }) =>
      addProjectMember(projectId, profileId),
    onSuccess: (updated: ProjectType) => patchProjectCaches(queryClient, updated),
  });
};

export const useRemoveProjectMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, profileId }: { projectId: string; profileId: string }) =>
      removeProjectMember(projectId, profileId),
    onSuccess: (updated: ProjectType) => patchProjectCaches(queryClient, updated),
  });
};
