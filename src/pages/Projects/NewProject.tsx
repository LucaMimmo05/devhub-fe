import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { addMonths, addWeeks, differenceInCalendarDays, endOfMonth, format, parseISO } from "date-fns";
import WizardScreen from "@/components/wizard/WizardScreen";
import StepQuestion from "@/components/wizard/StepQuestion";
import ChoiceCards from "@/components/wizard/ChoiceCards";
import PriorityBadge from "@/components/ui/PriorityBadge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  CircleDashed,
  CircleDot,
  CornerDownLeft,
  FolderKanban,
  Loader2,
  SignalHigh,
  SignalLow,
  SignalMedium,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCreateProject } from "@/hooks/queries/useProjects";
import { priorityLabel, statusLabel } from "@/components/projects/projectUtils";
import type { Priority, Status } from "@/types/PriorityAndStatusType";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STEPS = ["title", "description", "status", "priority", "dueDate"] as const;
type Step = (typeof STEPS)[number];
const CLOSE_PATH = "/projects";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Not started", description: "Still planning it", icon: CircleDashed },
  {
    value: "IN_PROGRESS",
    label: "In progress",
    description: "Already working on it",
    icon: CircleDot,
    activeClassName: "border-primary bg-primary/10 text-primary",
  },
];

const PRIORITY_OPTIONS = [
  {
    value: "LOW",
    label: "Low",
    description: "Whenever there's time",
    icon: SignalLow,
    activeClassName: "border-emerald-500 bg-emerald-500/10 text-emerald-400",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    description: "Planned for the coming weeks",
    icon: SignalMedium,
    activeClassName: "border-yellow-500 bg-yellow-500/10 text-yellow-400",
  },
  {
    value: "HIGH",
    label: "High",
    description: "Needs attention now",
    icon: SignalHigh,
    activeClassName: "border-red-500 bg-red-500/10 text-red-400",
  },
];

const toDateValue = (d: Date) => format(d, "yyyy-MM-dd");

const DUE_PRESETS = () => {
  const today = new Date();
  return [
    { label: "In 1 week", value: toDateValue(addWeeks(today, 1)) },
    { label: "In 2 weeks", value: toDateValue(addWeeks(today, 2)) },
    { label: "End of month", value: toDateValue(endOfMonth(today)) },
    { label: "In 3 months", value: toDateValue(addMonths(today, 3)) },
  ];
};

const describeDue = (value: string) => {
  const date = parseISO(value);
  const days = differenceInCalendarDays(date, new Date());
  const rel = days === 0 ? "today" : days === 1 ? "tomorrow" : days > 0 ? `in ${days} days` : `${-days} days ago`;
  return `${format(date, "EEEE d MMMM yyyy")} · ${rel}`;
};

// Big borderless text input shared by the text steps.
const bigInput =
  "w-full border-0 border-b-2 border-border bg-transparent px-0 pb-3 text-2xl font-medium outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-primary sm:text-3xl";

/** Live preview of the card the project will get in the list, filling in as you answer. */
const ProjectPreview = ({
  title,
  description,
  status,
  priority,
  dueDate,
  step,
}: {
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  dueDate: string;
  step: Step;
}) => {
  const focus = (s: Step | Step[]) =>
    ([] as Step[]).concat(s).includes(step) ? "ring-2 ring-primary/40 ring-offset-4 ring-offset-card rounded-md" : "";

  return (
    <div>
      <p className="mb-3 text-xs font-medium text-muted-foreground">Preview</p>
      <div className="rounded-xl border border-border bg-card/60 shadow-lg shadow-black/20">
        <div className="flex items-start gap-3.5 p-5 pb-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted text-base font-semibold text-muted-foreground">
            {title.trim().charAt(0).toUpperCase() || "?"}
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <p className={cn("truncate text-base font-semibold tracking-tight transition-shadow", focus("title"), !title.trim() && "text-muted-foreground/50")}>
              {title.trim() || "Untitled project"}
            </p>
            <p
              className={cn(
                "line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground transition-shadow",
                focus("description"),
                !description.trim() && "text-muted-foreground/40"
              )}
            >
              {description.trim() || "No description"}
            </p>
          </div>
        </div>
        <div className="flex gap-1.5 px-5 pb-5">
          <span className={cn("transition-shadow", focus("status"))}>
            <PriorityBadge data={status}>{statusLabel[status]}</PriorityBadge>
          </span>
          <span className={cn("transition-shadow", focus("priority"))}>
            <PriorityBadge data={priority}>{priorityLabel[priority]}</PriorityBadge>
          </span>
        </div>
        <div className="flex h-12 items-center gap-3 border-t border-border/60 px-5 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" />
          <span className={cn("truncate transition-shadow", focus("dueDate"))}>
            {dueDate ? format(parseISO(dueDate), "d MMM yyyy") : "No due date"}
          </span>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground/70">
        You can change any of this later, and add members and tasks once the project exists.
      </p>
    </div>
  );
};

const NewProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createProjectMutation = useCreateProject();

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("PENDING");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;
  const creating = createProjectMutation.isPending;
  const canAdvance = step !== "title" || title.trim().length >= 3;

  const goTo = (next: number) => {
    setDirection(next > stepIndex ? 1 : -1);
    setStepIndex(next);
  };
  const advance = () => {
    if (!canAdvance) return;
    if (isLast) handleCreate();
    else goTo(stepIndex + 1);
  };

  const handleCreate = async () => {
    if (title.trim().length < 3 || !user?.id || creating) return;
    try {
      const created = await createProjectMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        ownerId: user.id,
        memberIds: [],
        priority,
        status,
        // The backend expects a full timestamp; noon local avoids timezone day shifts.
        dueDate: dueDate ? new Date(`${dueDate}T12:00:00`).toISOString() : undefined,
      });
      toast.success("Project created");
      navigate(`/projects/${created.id}`);
    } catch {
      toast.error("Couldn't create the project. Please try again.");
    }
  };

  // Enter advances on steps without a focused field (choice cards, date presets).
  const advanceRef = useRef(advance);
  useEffect(() => {
    advanceRef.current = advance;
  });
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.defaultPrevented) return;
      if ((e.target as HTMLElement | null)?.closest("input, textarea, button, a, [role=menu]")) return;
      e.preventDefault();
      advanceRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const presets = DUE_PRESETS();

  return (
    <WizardScreen
      title="New project"
      icon={<FolderKanban className="h-4.5 w-4.5" />}
      iconClassName="bg-primary/10 text-primary"
      step={stepIndex}
      stepCount={STEPS.length}
      centered
      onClose={() => navigate(CLOSE_PATH)}
      aside={
        <ProjectPreview
          title={title}
          description={description}
          status={status}
          priority={priority}
          dueDate={dueDate}
          step={step}
        />
      }
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => (stepIndex === 0 ? navigate(CLOSE_PATH) : goTo(stepIndex - 1))}
            disabled={creating}
          >
            {stepIndex === 0 ? "Cancel" : (<><ArrowLeft className="mr-1.5 h-4 w-4" /> Back</>)}
          </Button>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
              press <kbd className="inline-flex items-center gap-0.5 rounded border border-border px-1.5 py-0.5 font-sans text-[11px]">Enter <CornerDownLeft className="h-3 w-3" /></kbd>
            </span>
            <Button onClick={advance} disabled={!canAdvance || creating}>
              {creating && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {isLast ? "Create project" : "Next"}
            </Button>
          </div>
        </>
      }
    >
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        {step === "title" && (
          <StepQuestion
            stepKey="title"
            direction={direction}
            question="What are you building?"
            hint={title.trim().length > 0 && title.trim().length < 3 ? "At least 3 characters." : undefined}
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); advance(); } }}
              placeholder="Project name"
              maxLength={100}
              autoFocus
              className={bigInput}
            />
          </StepQuestion>
        )}

        {step === "description" && (
          <StepQuestion
            stepKey="description"
            direction={direction}
            question="Describe it in a sentence"
            hint="Optional. Shift + Enter for a new line."
          >
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); advance(); } }}
              placeholder="What's this project about?"
              maxLength={500}
              rows={3}
              autoFocus
              className={cn(bigInput, "resize-none text-xl sm:text-2xl")}
            />
            <p className="mt-2 text-right text-xs tabular-nums text-muted-foreground/60">{description.length}/500</p>
          </StepQuestion>
        )}

        {step === "status" && (
          <StepQuestion stepKey="status" direction={direction} question="Where are you at?">
            <ChoiceCards
              options={STATUS_OPTIONS}
              value={status}
              shortcuts
              onChange={(v) => { setStatus(v as Status); goTo(stepIndex + 1); }}
            />
          </StepQuestion>
        )}

        {step === "priority" && (
          <StepQuestion stepKey="priority" direction={direction} question="How urgent is it?">
            <ChoiceCards
              options={PRIORITY_OPTIONS}
              value={priority}
              shortcuts
              onChange={(v) => { setPriority(v as Priority); goTo(stepIndex + 1); }}
            />
          </StepQuestion>
        )}

        {step === "dueDate" && (
          <StepQuestion
            stepKey="dueDate"
            direction={direction}
            question="Is there a deadline?"
            hint={dueDate ? describeDue(dueDate) : "Optional. Pick a shortcut or a date."}
          >
            <div className="flex flex-wrap gap-2">
              {[...presets, { label: "No deadline", value: "" }].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setDueDate(p.value)}
                  className={cn(
                    "h-9 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring active:scale-[0.98]",
                    dueDate === p.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <label className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
              or pick a date
              <input
                type="date"
                value={dueDate}
                min={toDateValue(new Date())}
                onChange={(e) => setDueDate(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); advance(); } }}
                className="h-9 rounded-lg border border-border bg-card/60 px-3 text-sm text-foreground scheme-dark focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </label>
          </StepQuestion>
        )}
      </AnimatePresence>
    </WizardScreen>
  );
};

export default NewProject;
