import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyNotes, createNote, updateNote, deleteNote } from "@/services/noteService";
import type { NoteRequest, NoteType } from "@/types/noteType";
import { queryKeys } from "./keys";

export const useNotes = () =>
  useQuery<NoteType[]>({
    queryKey: queryKeys.notes.list(),
    queryFn: getMyNotes,
  });

export const useCreateNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (note: NoteRequest) => createNote(note),
    onSuccess: (created: NoteType) => {
      // Only patch a list that's already loaded; seeding a missing list with just
      // the new note would hide every other note until the next refetch.
      queryClient.setQueryData<NoteType[]>(queryKeys.notes.list(), (old) => (old ? [created, ...old] : old));
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.list() });
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: NoteRequest }) => updateNote(id, data),
    onSuccess: (updated: NoteType) => {
      queryClient.setQueryData<NoteType[]>(queryKeys.notes.list(), (old) =>
        old?.map((n) => (n.id === updated.id ? updated : n))
      );
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: (_void, id) => {
      queryClient.setQueryData<NoteType[]>(queryKeys.notes.list(), (old) =>
        old?.filter((n) => n.id !== id)
      );
    },
  });
};
