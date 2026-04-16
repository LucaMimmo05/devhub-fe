import type { TaskRequest } from "@/types/taskType";
import { mainCallApi } from ".";

export const getMyTasks = async () => {
  const response = await mainCallApi.get("/tasks");
  return response.data;
};

export const getProjectTasks = async (projectId: string) => {
  const response = await mainCallApi.get(`/projects/${projectId}/tasks`);
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
