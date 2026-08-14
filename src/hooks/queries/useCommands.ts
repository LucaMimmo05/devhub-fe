import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyCommands,
  createCommand,
  updateCommand,
  deleteCommand,
} from "@/services/commandService";
import type { CommandRequest } from "@/types/commandType";
import { queryKeys } from "./keys";

export const useCommands = (category?: string, search?: string) =>
  useQuery({
    queryKey: queryKeys.commands.list(category, search),
    queryFn: () => getMyCommands(category, search),
  });

export const useCreateCommand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CommandRequest) => createCommand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commands.all });
    },
  });
};

export const useUpdateCommand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CommandRequest }) => updateCommand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commands.all });
    },
  });
};

export const useDeleteCommand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCommand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commands.all });
    },
  });
};
