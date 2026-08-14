import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WizardScreen from "@/components/wizard/WizardScreen";
import MarkdownEditor from "@/components/notes/MarkdownEditor";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { useCreateNote } from "@/hooks/queries/useNotes";
import { toast } from "sonner";

const CLOSE_PATH = "/notes";

const NewNote = () => {
  const navigate = useNavigate();
  const createNoteMutation = useCreateNote();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const creating = createNoteMutation.isPending;

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      const created = await createNoteMutation.mutateAsync({ title: title.trim(), content });
      toast.success("Note created!");
      navigate(`/notes/${created.id}`);
    } catch {
      toast.error("Failed to create note.");
    }
  };

  return (
    <WizardScreen
      title="New note"
      icon={<FileText className="h-4.5 w-4.5" />}
      iconClassName="bg-emerald-500/10 text-emerald-500"
      wide
      onClose={() => navigate(CLOSE_PATH)}
      footer={
        <>
          <Button variant="outline" onClick={() => navigate(CLOSE_PATH)} disabled={creating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating || !title.trim()}>
            {creating && <Loader2 className="animate-spin h-4 w-4 mr-1.5" />}
            Create note
          </Button>
        </>
      }
    >
      {/* Looks like a document, not a form: title as the page heading, body right underneath. */}
      <div className="flex flex-col gap-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          autoFocus
          className="w-full border-0 bg-transparent text-4xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/30"
        />
        <MarkdownEditor content={content} onChange={setContent} placeholder="Start writing... markdown formats as you type" />
      </div>
    </WizardScreen>
  );
};

export default NewNote;
