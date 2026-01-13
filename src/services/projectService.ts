import type { ProjectRequest } from "@/types/projectType";
import { mainCallApi } from ".";

export const getUserProject = async (limit?: number) => {
  const response = await mainCallApi.get(`/projects${limit ? `?limit=${limit}` : ""}`);
  return response.data;
};


export const createProject = async (project : ProjectRequest) => {
    const response = await mainCallApi.post("/projects",project);
    return response.data;
}