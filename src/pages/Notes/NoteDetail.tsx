import { useNavigate, useParams } from "react-router-dom";
import NoteEditor from "@/components/notes/NoteEditor";
import { Button } from "@/components/ui/button";
import { SpinnerCustom } from "@/components/ui/spinner";
import { StickyNote } from "lucide-react";
import { useNotes } from "@/hooks/queries/useNotes";

const CLOSE_PATH = "/notes";

const NoteDetail = () => {
  const navigate = useNavigate();
  const { noteId } = useParams<{ noteId: string }>();
  const { data: notes = [], isLoading } = useNotes();
  const note = notes.find((n) => n.id === noteId);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <SpinnerCustom />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
        <StickyNote className="h-12 w-12 opacity-20" />
        <p className="text-sm">This note doesn't exist anymore.</p>
        <Button variant="outline" size="sm" onClick={() => navigate(CLOSE_PATH)}>Back to notes</Button>
      </div>
    );
  }

  return <NoteEditor key={note.id} note={note} />;
};

export default NoteDetail;
