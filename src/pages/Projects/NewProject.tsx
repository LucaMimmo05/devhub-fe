import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import WizardScreen from "@/components/wizard/WizardScreen";
import StepQuestion from "@/components/wizard/StepQuestion";
import ChoiceCards from "@/components/wizard/ChoiceCards";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, FolderKanban, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCreateProject } from "@/hooks/queries/useProjects";
import type { Priority } from "@/types/PriorityAndStatusType";
import { toast } from "sonner";

const STEP_COUNT = 4;
const CLOSE_PATH = "/projects";

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low", activeClassName: "border-emerald-500 bg-emerald-500/10 text-emerald-500" },
  { value: "MEDIUM", label: "Medium", activeClassName: "border-yellow-500 bg-yellow-500/10 text-yellow-500" },
  { value: "HIGH", label: "High", activeClassName: "border-red-500 bg-red-500/10 text-red-500" },
];

const NewProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createProjectMutation = useCreateProject();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("LOW");
  const [dueDate, setDueDate] = useState("");

  const creating = createProjectMutation.isPending;

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const handleCreate = async () => {
    if (!title.trim() || !user?.id) return;
    try {
      const created = await createProjectMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        ownerId: user.id,
        memberIds: [],
        priority,
        status: "PENDING",
        dueDate: dueDate || undefined,
      });
      toast.success("Project created!");
      navigate(`/projects/${created.id}`);
    } catch {
      toast.error("Failed to create project.");
    }
  };

  return (
    <WizardScreen
      title="New project"
      icon={<FolderKanban className="h-4.5 w-4.5" />}
      iconClassName="bg-blue-500/10 text-blue-500"
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
            <Button onClick={() => goTo(step + 1)} disabled={step === 0 && !title.trim()}>
              Next
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="animate-spin h-4 w-4 mr-1.5" />}
              Create project
            </Button>
          )}
        </>
      }
    >
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        {step === 0 && (
          <StepQuestion stepKey="title" direction={direction} question="What are you building?">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project title"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter" && title.trim()) goTo(1); }}
              className="h-auto border-0 border-b-2 border-border rounded-none bg-transparent px-0 py-2 text-2xl shadow-none focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/40"
            />
          </StepQuestion>
        )}
        {step === 1 && (
          <StepQuestion
            stepKey="description"
            direction={direction}
            question="Describe it in a sentence"
            hint="Optional — press Next to skip."
          >
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this project about?"
              autoFocus
              className="min-h-28 resize-none text-lg"
            />
          </StepQuestion>
        )}
        {step === 2 && (
          <StepQuestion stepKey="priority" direction={direction} question="How urgent is this?">
            <ChoiceCards
              options={PRIORITY_OPTIONS}
              value={priority}
              onChange={(v) => { setPriority(v as Priority); goTo(3); }}
            />
          </StepQuestion>
        )}
        {step === 3 && (
          <StepQuestion
            stepKey="dueDate"
            direction={direction}
            question="When's it due?"
            hint="Optional — leave blank if there's no deadline."
          >
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              autoFocus
              className="h-auto border-0 border-b-2 border-border rounded-none bg-transparent px-0 py-2 text-2xl shadow-none focus-visible:ring-0 focus-visible:border-primary w-fit"
            />
          </StepQuestion>
        )}
      </AnimatePresence>
    </WizardScreen>
  );
};

export default NewProject;
