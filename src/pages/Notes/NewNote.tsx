import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import WizardScreen from "@/components/wizard/WizardScreen";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import { useCreateNote } from "@/hooks/queries/useNotes";
import { toast } from "sonner";

const STEP_COUNT = 2;
const CLOSE_PATH = "/notes";

const NewNote = () => {
  const navigate = useNavigate();
  const createNoteMutation = useCreateNote();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const goNext = () => { setDirection(1); setStep(1); };
  const goBack = () => { setDirection(-1); setStep(0); };

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      const created = await createNoteMutation.mutateAsync({ title: title.trim(), content });
      toast.success("Note created!");
      navigate("/notes", { state: { noteId: created.id } });
    } catch {
      toast.error("Failed to create note.");
    }
  };

  const creating = createNoteMutation.isPending;

  return (
    <WizardScreen
      title="New note"
      description={step === 0 ? "Give it a title." : "Now write it out."}
      icon={<FileText className="h-5 w-5" />}
      iconClassName="bg-emerald-500/10 text-emerald-500"
      step={step}
      stepCount={STEP_COUNT}
      onClose={() => navigate(CLOSE_PATH)}
      footer={
        step === 0 ? (
          <>
            <Button variant="outline" onClick={() => navigate(CLOSE_PATH)} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={goNext} disabled={!title.trim()}>
              Next
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={goBack} disabled={creating}>
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="animate-spin h-4 w-4 mr-1.5" />}
              Create note
            </Button>
          </>
        )
      }
    >
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        {step === 0 ? (
          <motion.div
            key="step-0"
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 32 : -32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -32 : 32 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter" && title.trim()) goNext(); }}
              className="h-auto border-0 bg-transparent px-0 py-0 text-3xl font-semibold shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40"
            />
          </motion.div>
        ) : (
          <motion.div
            key="step-1"
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 32 : -32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -32 : 32 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="flex flex-col gap-3"
          >
            <p className="text-sm font-medium truncate text-muted-foreground">{title}</p>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing..."
              autoFocus
              className="min-h-[50vh] resize-none font-mono text-sm"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </WizardScreen>
  );
};

export default NewNote;
