import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type SetupStep = {
  key: string;
  title: string;
  description: string;
  icon: ReactNode;
  done: boolean;
  cta: { label: string; to: string };
  /** Shown instead of the action while an earlier step is still missing. */
  waitingOn?: string;
};

const HIDDEN_KEY = "devhub.gettingStarted.hidden";

const readHidden = () => {
  try {
    return localStorage.getItem(HIDDEN_KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * "Get set up" strip for new accounts: one tile per step, ticked off from the user's real data.
 * Disappears once every step is done, or for good when hidden.
 */
const GettingStarted = ({ steps }: { steps: SetupStep[] }) => {
  const [hidden, setHidden] = useState(readHidden);
  const doneCount = steps.filter((s) => s.done).length;
  if (hidden || doneCount === steps.length) return null;

  const next = steps.find((s) => !s.done && !s.waitingOn);
  const pct = Math.round((doneCount / steps.length) * 100);
  const hide = () => {
    setHidden(true);
    try {
      localStorage.setItem(HIDDEN_KEY, "1");
    } catch {
      // Storage unavailable: hidden for this visit only
    }
  };

  return (
    <section aria-labelledby="getting-started" className="rounded-xl border border-border bg-card/60">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border/60 px-4 py-3">
        <div className="min-w-0 basis-full sm:basis-0 sm:flex-1">
          <h2 id="getting-started" className="text-sm font-semibold">Get set up</h2>
          <p className="text-xs text-muted-foreground">A few steps to make DevHub yours. They tick themselves off as you go.</p>
        </div>
        <div className="flex flex-1 items-center gap-3 sm:flex-none">
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            <span className="font-semibold text-foreground">{doneCount}</span> of {steps.length} done
          </span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06] sm:w-36 sm:flex-none">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-[width] duration-700" style={{ width: `${pct}%` }} />
          </div>
          <button
            type="button"
            onClick={hide}
            aria-label="Hide setup steps"
            title="Hide"
            className="-mr-1.5 rounded-md p-1 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <ol
        className="grid gap-2 p-2 sm:grid-cols-2 lg:grid-cols-(--cols)"
        style={{ "--cols": `repeat(${steps.length}, minmax(0, 1fr))` } as React.CSSProperties}
      >
        {steps.map((step) => {
          const isNext = step === next;
          return (
            <li
              key={step.key}
              className={cn(
                "flex items-center gap-3 rounded-lg border border-border/60 bg-white/[0.02] p-3 sm:flex-col sm:items-start sm:gap-2 sm:p-3.5",
                "sm:odd:last:col-span-2 lg:odd:last:col-span-1",
                isNext && "border-primary/40 bg-primary/[0.06]",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-muted-foreground [&_svg]:h-4 [&_svg]:w-4",
                  step.done && "bg-emerald-500/15 text-emerald-400",
                  isNext && "bg-primary/15 text-primary",
                )}
              >
                {step.done ? <Check /> : step.icon}
              </span>

              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-medium", step.done && "text-muted-foreground")}>{step.title}</p>
                <p className="mt-0.5 text-pretty text-xs leading-relaxed text-muted-foreground">{step.description}</p>
              </div>

              <div className="shrink-0 sm:mt-auto sm:pt-1">
                {step.done ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                    <Check className="h-3.5 w-3.5" /> Done
                  </span>
                ) : step.waitingOn ? (
                  <span className="text-xs text-muted-foreground">{step.waitingOn}</span>
                ) : (
                  <Link
                    to={step.cta.to}
                    className={cn(
                      "flex h-8 items-center rounded-lg px-3 text-xs font-medium transition-all active:scale-[0.98]",
                      isNext
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary/90"
                        : "border border-white/10 bg-white/[0.04] hover:bg-white/[0.08]",
                    )}
                  >
                    {step.cta.label}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default GettingStarted;
