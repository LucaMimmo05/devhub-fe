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
import { Edit2, Loader2, StickyNote, Trash2 } from "lucide-react";
import { timeSince } from "@/utils/getRelativeTime";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const Notes = () => {
  const { setOnCreate } = useHeaderActions();

  const [notes, setNotes] = useState<NoteType[]>([]);
  const [loading, setLoading] = useState(false);

  // Create modal
  const [openCreate, setOpenCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  // Edit sheet
  const [editingNote, setEditingNote] = useState<NoteType | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    getMyNotes().then(setNotes).catch(console.error);
  }, []);

  useEffect(() => {
    setOnCreate?.(() => () => setOpenCreate(true));
    return () => setOnCreate?.(undefined);
  }, [setOnCreate]);

  const openEdit = (note: NoteType) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditContent(note.content ?? "");
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setLoading(true);
    try {
      const created = await createNote({ title: newTitle, content: newContent });
      setNotes((prev) => [created, ...prev]);
      setOpenCreate(false);
      setNewTitle("");
      setNewContent("");
    } catch (err) {
      console.error("Failed to create note:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingNote || !editTitle.trim()) return;
    setLoading(true);
    try {
      const updated = await updateNote(editingNote.id, { title: editTitle, content: editContent });
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      setEditingNote(null);
    } catch (err) {
      console.error("Failed to update note:", err);
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
          <Button onClick={() => setOpenCreate(true)}>New Note</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <Card
              key={note.id}
              className="flex flex-col group cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => openEdit(note)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base line-clamp-1">{note.title}</CardTitle>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => { e.stopPropagation(); openEdit(note); }}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
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

      {/* Create modal */}
      <Modal
        open={openCreate}
        onOpenChange={() => { setOpenCreate(false); setNewTitle(""); setNewContent(""); }}
        title="New Note"
        description="Write something down."
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={handleCreate} disabled={loading || !newTitle.trim()}>
              {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              Create
            </Button>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Title</Label>
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Note title" />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Content</Label>
            <Textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Write your note here..." rows={8} />
          </div>
        </div>
      </Modal>

      {/* Edit sheet */}
      <Sheet open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-md">
          <SheetHeader className="px-6 py-5 border-b">
            <SheetTitle>Edit Note</SheetTitle>
            <SheetDescription>{editingNote?.title}</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-5 px-6 py-5 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2">
              <Label>Title</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Content</Label>
              <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={12} placeholder="Write your note here..." />
            </div>
          </div>
          <div className="px-6 py-4 border-t flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingNote(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={loading || !editTitle.trim()}>
              {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
};

export default Notes;
