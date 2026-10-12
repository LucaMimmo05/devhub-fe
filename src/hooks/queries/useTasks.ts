import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyTasks,
  getProjectTasks,
  createTask,
  updateTask,
  type TaskFilters,
} from "@/services/taskService";
import type { TaskRequest, TaskType } from "@/types/taskType";
import { queryKeys } from "./keys";

export const useMyTasks = (filters?: TaskFilters) =>
  useQuery<TaskType[]>({
    queryKey: queryKeys.tasks.mine(filters),
    queryFn: () => getMyTasks(filters),
  });

export const useProjectTasks = (projectId: string) =>
  useQuery<TaskType[]>({
    queryKey: queryKeys.tasks.project(projectId),
    queryFn: () => getProjectTasks(projectId),
    enabled: !!projectId,
  });

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (task: TaskRequest) => createTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
};

// Update/delete di un task avvengono in TaskModal/TaskSheet: invalida da lì
// tramite useQueryClient().invalidateQueries({ queryKey: queryKeys.tasks.all }),
// così ogni vista (Dashboard, Tasks, ProjectDetails) si aggiorna da sola.

// Tasks of several projects at once (one request each), sharing the cache
// with useProjectTasks so ProjectDetails opens instantly afterwards.
export const useProjectsTasks = (projectIds: string[]) =>
  useQueries({
    queries: projectIds.map((projectId) => ({
      queryKey: queryKeys.tasks.project(projectId),
      queryFn: () => getProjectTasks(projectId),
    })),
    combine: (results) => {
      const byProject = new Map<string, TaskType[]>();
      results.forEach((r, i) => {
        if (r.data) byProject.set(projectIds[i], r.data as TaskType[]);
      });
      return byProject;
    },
  });

// Optimistic done/undone toggle: flips the task in every cached task list
// (mine, per project), rolls them all back if the request fails.
export const useToggleTask = () => {
  const queryClient = useQueryClient();
  return async (task: TaskType) => {
    const next = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    const snapshot = queryClient.getQueriesData<TaskType[]>({ queryKey: queryKeys.tasks.all });
    queryClient.setQueriesData<TaskType[]>({ queryKey: queryKeys.tasks.all }, (old) =>
      old?.map((t) => (t.id === task.id ? { ...t, status: next } : t))
    );
    try {
      await updateTask(task.id, { status: next });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      return true;
    } catch {
      snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
      return false;
    }
  };
};
