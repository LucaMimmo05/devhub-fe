import type { CommandRequest, CommandType } from "@/types/commandType";
import { mainCallApi } from ".";

export const getMyCommands = async (category?: string, search?: string): Promise<CommandType[]> => {
  const response = await mainCallApi.get("/commands", {
    params: { category: category || undefined, search: search || undefined },
  });
  return response.data;
};

export const createCommand = async (data: CommandRequest): Promise<CommandType> => {
  const response = await mainCallApi.post("/commands", data);
  return response.data;
};

export const updateCommand = async (id: string, data: CommandRequest): Promise<CommandType> => {
  const response = await mainCallApi.put(`/commands/${id}`, data);
  return response.data;
};

export const deleteCommand = async (id: string): Promise<void> => {
  await mainCallApi.delete(`/commands/${id}`);
};
