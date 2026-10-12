import { Check, FolderKanban, Loader2, Play, Signal } from "lucide-react";
import { useState } from "react";
import { relativeDue } from "@/components/projects/projectUtils";
import type { TaskType } from "@/types/taskType";
import { cn } from "@/lib/utils";

const priorityTone: Record<string, string> = { HIGH: "text-red-400", MEDIUM: "text-amber-400", LOW: "text-emerald-400" };

/** The single most urgent open task, big, with the two actions you'd take on it. */
const FocusTask = ({
  task,
  canEdit,
  onOpen,
  onDone,
  onStart,
}: {
  task: TaskType;
  canEdit: boolean;
  onOpen: () => void;
  onDone: () => Promise<void>;
  onStart: () => Promise<void>;
}) => {
  const [busy, setBusy] = useState<"done" | "start" | null>(null);
  const due = relativeDue(task.dueDate, task.status);
  const run = async (kind: "done" | "start", fn: () => Promise<void>) => {
    setBusy(kind);
    await fn();
    setBusy(null);
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-br from-primary/[0.09] via-card/60 to-card/60 p-4 sm:p-5">
      <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
      <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-primary">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
        Up next
      </p>
      <button type="button" onClick={onOpen} className="mt-2 block text-left focus-visible:outline-2 focus-visible:outline-ring">
        <span className="text-balance text-lg font-semibold leading-snug tracking-tight hover:text-primary sm:text-xl">{task.title}</span>
      </button>
      {task.description && <p className="mt-1 line-clamp-2 max-w-[70ch] text-sm text-muted-foreground">{task.description}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {task.projectTitle && (
            <span className="flex items-center gap-1.5"><FolderKanban className="h-3.5 w-3.5" /> {task.projectTitle}</span>
          )}
          {due && (
            <span className={cn("font-medium tabular-nums", due.late ? "text-red-400" : due.days === 0 ? "text-amber-400" : "")}>
              {due.late ? due.rel : due.days === 0 ? "Due today" : `Due ${due.label} · ${due.rel}`}
            </span>
          )}
          <span className={cn("flex items-center gap-1", priorityTone[task.priority])}>
            <Signal className="h-3.5 w-3.5" /> {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
          </span>
          {task.status === "IN_PROGRESS" && <span className="font-medium text-primary">In progress</span>}
        </div>
        {canEdit && (
          <div className="ml-auto flex gap-2">
            {task.status === "PENDING" && (
              <button
                type="button"
                onClick={() => run("start", onStart)}
                disabled={!!busy}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background/40 px-3 text-xs font-medium transition-all hover:bg-muted active:scale-[0.98] disabled:opacity-60"
              >
                {busy === "start" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />} Start
              </button>
            )}
            <button
              type="button"
              onClick={() => run("done", onDone)}
              disabled={!!busy}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
            >
              {busy === "done" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Mark done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusTask;
