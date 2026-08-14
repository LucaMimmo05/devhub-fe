import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import WizardScreen from "@/components/wizard/WizardScreen";
import MetaField from "@/components/ui/MetaField";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { AlertCircle, ArrowLeft, Calendar, FolderKanban, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCreateProject } from "@/hooks/queries/useProjects";
import type { Priority } from "@/types/PriorityAndStatusType";
import { toast } from "sonner";

const STEP_COUNT = 2;
const CLOSE_PATH = "/projects";

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

  const goNext = () => { setDirection(1); setStep(1); };
  const goBack = () => { setDirection(-1); setStep(0); };

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

  const creating = createProjectMutation.isPending;

  return (
    <WizardScreen
      title="New project"
      description={step === 0 ? "What are you building?" : "A few details, then you're set."}
      icon={<FolderKanban className="h-5 w-5" />}
      iconClassName="bg-blue-500/10 text-blue-500"
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
              Create project
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
            className="flex flex-col gap-4"
          >
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Project title"
              autoFocus
              className="h-auto border-0 bg-transparent px-0 py-0 text-3xl font-semibold shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40"
            />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this project about? (optional)"
              className="min-h-32 resize-none"
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
            className="flex flex-col gap-4"
          >
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Title</p>
              <p className="text-sm font-medium truncate">{title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/30 p-4">
              <MetaField icon={AlertCircle} label="Priority">
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger className="h-9 bg-background text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </MetaField>
              <MetaField icon={Calendar} label="Due date">
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-9 bg-background text-sm"
                />
              </MetaField>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </WizardScreen>
  );
};

export default NewProject;
