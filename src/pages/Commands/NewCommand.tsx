import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import WizardScreen from "@/components/wizard/WizardScreen";
import MetaField from "@/components/ui/MetaField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Tag, Terminal } from "lucide-react";
import { useCreateCommand } from "@/hooks/queries/useCommands";
import { CATEGORIES } from "@/types/commandType";
import { toast } from "sonner";

const STEP_COUNT = 2;
const CLOSE_PATH = "/commands";

const NewCommand = () => {
  const navigate = useNavigate();
  const createCommandMutation = useCreateCommand();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [title, setTitle] = useState("");
  const [command, setCommand] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Bash");

  const goNext = () => { setDirection(1); setStep(1); };
  const goBack = () => { setDirection(-1); setStep(0); };

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

  const creating = createCommandMutation.isPending;

  return (
    <WizardScreen
      title="New command"
      description={step === 0 ? "What's the command?" : "File it under a category."}
      icon={<Terminal className="h-5 w-5" />}
      iconClassName="bg-violet-500/10 text-violet-500"
      step={step}
      stepCount={STEP_COUNT}
      onClose={() => navigate(CLOSE_PATH)}
      footer={
        step === 0 ? (
          <>
            <Button variant="outline" onClick={() => navigate(CLOSE_PATH)} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={goNext} disabled={!title.trim() || !command.trim()}>
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
              Save command
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
              placeholder="e.g. Start dev server"
              autoFocus
              className="h-auto border-0 bg-transparent px-0 py-0 text-3xl font-semibold shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40"
            />
            <Input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="npm run dev"
              className="font-mono text-sm bg-muted/40"
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
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Command</p>
              <p className="text-sm font-mono truncate">{command}</p>
            </div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this command do? (optional)"
              className="min-h-24 resize-none"
            />
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <MetaField icon={Tag} label="Category">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-9 bg-background text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </MetaField>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </WizardScreen>
  );
};

export default NewCommand;
