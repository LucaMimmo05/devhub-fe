import { mainCallApi } from ".";

export const getUserProject = async (limit?: number) => {
  const response = await mainCallApi.get(`/projects${limit ? `?limit=${limit}` : ""}`);
  return response.data;
};
