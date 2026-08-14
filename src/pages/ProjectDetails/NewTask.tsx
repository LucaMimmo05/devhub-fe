import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import WizardScreen from "@/components/wizard/WizardScreen";
import StepQuestion from "@/components/wizard/StepQuestion";
import ChoiceCards from "@/components/wizard/ChoiceCards";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ListChecks, Loader2 } from "lucide-react";
import { useProject } from "@/hooks/queries/useProjects";
import { useCreateTask } from "@/hooks/queries/useTasks";
import type { Priority, Status } from "@/types/PriorityAndStatusType";
import { toast } from "sonner";

const STEP_COUNT = 5;

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low", activeClassName: "border-emerald-500 bg-emerald-500/10 text-emerald-500" },
  { value: "MEDIUM", label: "Medium", activeClassName: "border-yellow-500 bg-yellow-500/10 text-yellow-500" },
  { value: "HIGH", label: "High", activeClassName: "border-red-500 bg-red-500/10 text-red-500" },
];

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

const NewTask = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useProject(projectId ?? "");
  const createTaskMutation = useCreateTask();

  const closePath = `/projects/${projectId}`;

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [status, setStatus] = useState<Status>("PENDING");
  const [dueDate, setDueDate] = useState("");

  const creating = createTaskMutation.isPending;

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  };

  const handleCreate = async () => {
    if (!title.trim() || !projectId) return;
    try {
      await createTaskMutation.mutateAsync({
        title: title.trim(),
        description: description || undefined,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        projectId,
      });
      toast.success("Task added!");
      navigate(closePath);
    } catch {
      toast.error("Failed to create task.");
    }
  };

  return (
    <WizardScreen
      title={project ? `Add task · ${project.title}` : "Add task"}
      icon={<ListChecks className="h-4.5 w-4.5" />}
      iconClassName="bg-amber-500/10 text-amber-500"
      step={step}
      stepCount={STEP_COUNT}
      centered
      onClose={() => navigate(closePath)}
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => (step === 0 ? navigate(closePath) : goTo(step - 1))}
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
              Add task
            </Button>
          )}
        </>
      }
    >
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        {step === 0 && (
          <StepQuestion stepKey="title" direction={direction} question="What needs doing?">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
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
            question="Any details?"
            hint="Optional — press Next to skip."
          >
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description"
              autoFocus
              className="min-h-28 resize-none text-lg"
            />
          </StepQuestion>
        )}
        {step === 2 && (
          <StepQuestion stepKey="priority" direction={direction} question="How urgent is it?">
            <ChoiceCards
              options={PRIORITY_OPTIONS}
              value={priority}
              onChange={(v) => { setPriority(v as Priority); goTo(3); }}
            />
          </StepQuestion>
        )}
        {step === 3 && (
          <StepQuestion stepKey="status" direction={direction} question="Where does it stand?">
            <ChoiceCards
              options={STATUS_OPTIONS}
              value={status}
              onChange={(v) => { setStatus(v as Status); goTo(4); }}
            />
          </StepQuestion>
        )}
        {step === 4 && (
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

export default NewTask;
