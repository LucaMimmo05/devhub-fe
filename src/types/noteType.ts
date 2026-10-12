export type NoteType = {
  id: string;
  title: string;
  content?: string;
  /** Optional icon shown next to the title. */
  emoji?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NoteRequest = {
  title: string;
  content?: string;
  /** Omit to leave unchanged on update; "" removes it. */
  emoji?: string;
};
