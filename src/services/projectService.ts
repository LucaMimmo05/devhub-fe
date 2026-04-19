import type { ProjectRequest } from "@/types/projectType";
import { mainCallApi } from ".";

export const getUserProject = async (limit?: number) => {
  const response = await mainCallApi.get(`/projects${limit ? `?limit=${limit}` : ""}`);
  return response.data;
};

export const createProject = async (project: ProjectRequest) => {
  const response = await mainCallApi.post("/projects", project);
  return response.data;
};

export const getProjectById = async (projectId: string) => {
  const response = await mainCallApi.get(`/projects/${projectId}`);
  return response.data;
};

export const updateProject = async (projectId: string, project: Partial<ProjectRequest>) => {
  const response = await mainCallApi.put(`/projects/${projectId}`, project);
  return response.data;
};

export const deleteProject = async (projectId: string) => {
  await mainCallApi.delete(`/projects/${projectId}`);
};

export const addProjectMember = async (projectId: string, profileId: string) => {
  const response = await mainCallApi.post(`/projects/${projectId}/members`, { profileId });
  return response.data;
};

export const removeProjectMember = async (projectId: string, memberProfileId: string) => {
  const response = await mainCallApi.delete(`/projects/${projectId}/members/${memberProfileId}`);
  return response.data;
};
