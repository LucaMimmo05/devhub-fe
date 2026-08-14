import { useCallback, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import WizardScreen from "@/components/wizard/WizardScreen";
import MarkdownEditor from "@/components/notes/MarkdownEditor";
import { Button } from "@/components/ui/button";
import { SpinnerCustom } from "@/components/ui/spinner";
import { FileText, Loader2, StickyNote, Trash2 } from "lucide-react";
import { useNotes, useUpdateNote, useDeleteNote } from "@/hooks/queries/useNotes";
import type { NoteType } from "@/types/noteType";
import { toast } from "sonner";

const CLOSE_PATH = "/notes";

const NoteDetailInner = ({ note }: { note: NoteType }) => {
  const navigate = useNavigate();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content ?? "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const autoSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saving = updateNoteMutation.isPending;

  const saveNote = useCallback(async (t: string, c: string) => {
    if (!t.trim()) return;
    setSaveStatus("saving");
    try {
      await updateNoteMutation.mutateAsync({ id: note.id, data: { title: t, content: c } });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      toast.error("Failed to save note.");
      setSaveStatus("idle");
    }
  }, [note.id, updateNoteMutation]);

  const scheduleAutoSave = useCallback((t: string, c: string) => {
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    autoSaveTimeout.current = setTimeout(() => saveNote(t, c), 1000);
  }, [saveNote]);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    scheduleAutoSave(v, content);
  };

  const handleContentChange = (v: string) => {
    setContent(v);
    scheduleAutoSave(title, v);
  };

  const handleDelete = async () => {
    try {
      await deleteNoteMutation.mutateAsync(note.id);
      toast.success("Note deleted.");
      navigate(CLOSE_PATH);
    } catch {
      toast.error("Failed to delete note.");
    }
  };

  return (
    <WizardScreen
      title="Note"
      icon={<FileText className="h-4.5 w-4.5" />}
      iconClassName="bg-emerald-500/10 text-emerald-500"
      wide
      onClose={() => navigate(CLOSE_PATH)}
      footer={
        <>
          <div className="flex items-center gap-1.5">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            {!saving && saveStatus === "saved" && <span className="text-xs text-muted-foreground">Saved</span>}
            {!confirmDelete ? (
              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-destructive">Delete this note?</span>
                <Button size="sm" variant="destructive" onClick={handleDelete}>Yes</Button>
                <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>No</Button>
              </div>
            )}
          </div>
          <Button variant="outline" onClick={() => navigate(CLOSE_PATH)}>Done</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Untitled"
          autoFocus
          className="w-full border-0 bg-transparent text-4xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/30"
        />
        <MarkdownEditor content={content} onChange={handleContentChange} placeholder="Start writing... markdown formats as you type" />
      </div>
    </WizardScreen>
  );
};

const NoteDetail = () => {
  const navigate = useNavigate();
  const { noteId } = useParams<{ noteId: string }>();
  const { data: notes = [], isLoading } = useNotes();
  const note = notes.find((n) => n.id === noteId);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <SpinnerCustom />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
        <StickyNote className="h-12 w-12 opacity-20" />
        <p className="text-sm">This note doesn't exist anymore.</p>
        <Button variant="outline" size="sm" onClick={() => navigate(CLOSE_PATH)}>Back to notes</Button>
      </div>
    );
  }

  return <NoteDetailInner key={note.id} note={note} />;
};

export default NoteDetail;
