import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import StepDots from "@/components/wizard/StepDots";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  icon: ReactNode;
  iconClassName?: string;
  step: number;
  stepCount: number;
  onClose: () => void;
  footer: ReactNode;
  children: ReactNode;
  /** Extra width for steps with denser content (e.g. metadata grids). */
  wide?: boolean;
};

const WizardScreen = ({
  title,
  description,
  icon,
  iconClassName = "bg-primary/10 text-primary",
  step,
  stepCount,
  onClose,
  footer,
  children,
  wide = false,
}: Props) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-6 py-4">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", iconClassName)}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-semibold leading-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
        <StepDots step={step} count={stepCount} />
        <Button variant="ghost" size="icon" className="shrink-0" onClick={onClose} aria-label="Close">
          <X className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className={cn("mx-auto w-full px-6 py-10", wide ? "max-w-2xl" : "max-w-lg")}>
          {children}
        </div>
      </div>

      <footer className="shrink-0 border-t border-border bg-background px-6 py-4">
        <div className={cn("mx-auto flex w-full items-center justify-end gap-2", wide ? "max-w-2xl" : "max-w-lg")}>
          {footer}
        </div>
      </footer>
    </div>
  );
};

export default WizardScreen;
