import { useEffect, useState } from "react";
import { useHeaderActions } from "@/context/HeaderActionsContext";
import { getMyNotes, createNote, updateNote, deleteNote } from "@/services/noteService";
import type { NoteType } from "@/types/noteType";

import PageContainer from "@/layouts/PageContainer";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit2, Trash2, StickyNote } from "lucide-react";
import { timeSince } from "@/utils/getRelativeTime";

const Notes = () => {
  const { setOnCreate } = useHeaderActions();

  const [notes, setNotes] = useState<NoteType[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteType | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMyNotes().then(setNotes).catch(console.error);
  }, []);

  useEffect(() => {
    setOnCreate?.(() => () => openCreateModal());
    return () => setOnCreate?.(undefined);
  }, [setOnCreate]);

  const openCreateModal = () => {
    setEditingNote(null);
    setTitle("");
    setContent("");
    setOpenModal(true);
  };

  const openEditModal = (note: NoteType) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content ?? "");
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setEditingNote(null);
    setTitle("");
    setContent("");
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      if (editingNote) {
        const updated = await updateNote(editingNote.id, { title, content });
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      } else {
        const created = await createNote({ title, content });
        setNotes((prev) => [created, ...prev]);
      }
      handleClose();
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  return (
    <PageContainer>
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4 text-center">
          <StickyNote className="h-12 w-12 text-muted-foreground/40" />
          <div>
            <h3 className="font-semibold text-lg">No notes yet</h3>
            <p className="text-muted-foreground text-sm">Create your first note to get started.</p>
          </div>
          <Button onClick={openCreateModal}>New Note</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Card key={note.id} className="flex flex-col group">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base line-clamp-1">{note.title}</CardTitle>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEditModal(note)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(note.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                  {note.content || <span className="italic">No content</span>}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-3">
                  {timeSince(note.updatedAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={openModal}
        onOpenChange={handleClose}
        title={editingNote ? "Edit Note" : "New Note"}
        description={editingNote ? "Update your note." : "Write something down."}
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={handleSave} disabled={loading || !title.trim()}>
              {editingNote ? "Save Changes" : "Create"}
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="note-title">Title</Label>
            <Input
              id="note-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="note-content">Content</Label>
            <Textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              rows={8}
            />
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default Notes;
