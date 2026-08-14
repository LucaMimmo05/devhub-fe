import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import WizardScreen from "@/components/wizard/WizardScreen";
import StepQuestion from "@/components/wizard/StepQuestion";
import ChoiceCards from "@/components/wizard/ChoiceCards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Terminal } from "lucide-react";
import { useCreateCommand } from "@/hooks/queries/useCommands";
import { CATEGORIES } from "@/types/commandType";
import { toast } from "sonner";

const STEP_COUNT = 4;
const CLOSE_PATH = "/commands";

const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c, label: c }));

const NewCommand = () => {
  const navigate = useNavigate();
  const createCommandMutation = useCreateCommand();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [title, setTitle] = useState("");
  const [command, setCommand] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Bash");

  const creating = createCommandMutation.isPending;

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const handleCreate = async () => {
    if (!title.trim() || !command.trim()) return;
    try {
      await createCommandMutation.mutateAsync({ title: title.trim(), command: command.trim(), description, category });
      toast.success("Command saved!");
      navigate(CLOSE_PATH);
    } catch {
      toast.error("Failed to save command.");
    }
  };

  return (
    <WizardScreen
      title="New command"
      icon={<Terminal className="h-4.5 w-4.5" />}
      iconClassName="bg-violet-500/10 text-violet-500"
      step={step}
      stepCount={STEP_COUNT}
      centered
      onClose={() => navigate(CLOSE_PATH)}
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => (step === 0 ? navigate(CLOSE_PATH) : goTo(step - 1))}
            disabled={creating}
          >
            {step === 0 ? "Cancel" : (<><ArrowLeft className="h-4 w-4 mr-1.5" /> Back</>)}
          </Button>
          {step < STEP_COUNT - 1 ? (
            <Button
              onClick={() => goTo(step + 1)}
              disabled={(step === 0 && !title.trim()) || (step === 1 && !command.trim())}
            >
              Next
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="animate-spin h-4 w-4 mr-1.5" />}
              Save command
            </Button>
          )}
        </>
      }
    >
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        {step === 0 && (
          <StepQuestion stepKey="title" direction={direction} question="What do you call it?">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Start dev server"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter" && title.trim()) goTo(1); }}
              className="h-auto border-0 border-b-2 border-border rounded-none bg-transparent px-0 py-2 text-2xl shadow-none focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/40"
            />
          </StepQuestion>
        )}
        {step === 1 && (
          <StepQuestion stepKey="command" direction={direction} question="What's the actual command?">
            <Input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="npm run dev"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter" && command.trim()) goTo(2); }}
              className="h-auto border-0 border-b-2 border-border rounded-none bg-transparent px-0 py-2 text-xl font-mono shadow-none focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/40"
            />
          </StepQuestion>
        )}
        {step === 2 && (
          <StepQuestion stepKey="category" direction={direction} question="File it under...">
            <ChoiceCards
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={(v) => { setCategory(v); goTo(3); }}
            />
          </StepQuestion>
        )}
        {step === 3 && (
          <StepQuestion
            stepKey="description"
            direction={direction}
            question="What does it do?"
            hint="Optional — press Save to skip."
          >
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A quick note for future you"
              autoFocus
              className="min-h-28 resize-none text-lg"
            />
          </StepQuestion>
        )}
      </AnimatePresence>
    </WizardScreen>
  );
};

export default NewCommand;
