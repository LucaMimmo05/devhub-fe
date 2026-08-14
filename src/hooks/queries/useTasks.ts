import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyTasks,
  getProjectTasks,
  createTask,
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
