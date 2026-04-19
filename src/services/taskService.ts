import type { TaskRequest } from "@/types/taskType";
import { mainCallApi } from ".";

export type TaskFilters = {
  status?: string;
  priority?: string;
  search?: string;
};

export const getMyTasks = async (filters?: TaskFilters) => {
  const response = await mainCallApi.get("/tasks", { params: filters });
  return response.data;
};

export const getProjectTasks = async (projectId: string, filters?: TaskFilters) => {
  const response = await mainCallApi.get(`/projects/${projectId}/tasks`, { params: filters });
  return response.data;
};

export const createTask = async (task: TaskRequest) => {
  const response = await mainCallApi.post("/tasks", task);
  return response.data;
};

export const updateTask = async (taskId: string, task: Partial<TaskRequest>) => {
  const response = await mainCallApi.put(`/tasks/${taskId}`, task);
  return response.data;
};

export const deleteTask = async (taskId: string) => {
  await mainCallApi.delete(`/tasks/${taskId}`);
};
