import type { NoteRequest } from "@/types/noteType";
import { mainCallApi } from ".";

export const getMyNotes = async () => {
  const response = await mainCallApi.get("/notes");
  return response.data;
};

export const createNote = async (note: NoteRequest) => {
  const response = await mainCallApi.post("/notes", note);
  return response.data;
};

export const updateNote = async (noteId: string, note: NoteRequest) => {
  const response = await mainCallApi.put(`/notes/${noteId}`, note);
  return response.data;
};

export const deleteNote = async (noteId: string) => {
  await mainCallApi.delete(`/notes/${noteId}`);
};
