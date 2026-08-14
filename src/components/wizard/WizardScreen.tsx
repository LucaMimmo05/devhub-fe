import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import StepDots from "@/components/wizard/StepDots";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  icon: ReactNode;
  iconClassName?: string;
  /** Omit (or leave at 1) for a single-screen flow with no step chrome, e.g. a document-style editor. */
  step?: number;
  stepCount?: number;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
  /** Extra width for denser content. */
  wide?: boolean;
  /** Center content in the viewport instead of top-aligning (used by one-question-per-step flows). */
  centered?: boolean;
};

const WizardScreen = ({
  title,
  icon,
  iconClassName = "bg-primary/10 text-primary",
  step = 0,
  stepCount = 1,
  onClose,
  footer,
  children,
  wide = false,
  centered = false,
}: Props) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex shrink-0 items-center gap-3 px-6 py-4">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", iconClassName)}>
          {icon}
        </div>
        <h1 className="text-sm font-semibold leading-tight text-muted-foreground">{title}</h1>

        {stepCount > 1 && (
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {step + 1} / {stepCount}
            </span>
            <StepDots step={step} count={stepCount} />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("shrink-0", stepCount <= 1 && "ml-auto")}
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Button>
      </header>

      <div className={cn("flex-1 overflow-y-auto", centered && "flex items-center")}>
        <div className={cn("mx-auto w-full px-6", wide ? "max-w-2xl" : "max-w-xl", centered ? "py-10" : "py-6")}>
          {children}
        </div>
      </div>

      {footer && (
        <footer className="shrink-0 border-t border-border bg-background px-6 py-4">
          <div className={cn("mx-auto flex w-full items-center justify-between gap-2", wide ? "max-w-2xl" : "max-w-xl")}>
            {footer}
          </div>
        </footer>
      )}
    </div>
  );
};

export default WizardScreen;
