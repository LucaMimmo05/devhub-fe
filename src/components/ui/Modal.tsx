import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Small colored badge shown next to the title, e.g. an accent-tinted lucide icon. */
  icon?: ReactNode;
  /** Tailwind color classes for the icon badge background/text, e.g. "bg-blue-500/10 text-blue-500". */
  iconClassName?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const Modal = ({
  open,
  onOpenChange,
  title,
  description,
  icon,
  iconClassName = "bg-primary/10 text-primary",
  children,
  footer,
  className,
}: ModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("gap-0 p-0 overflow-hidden sm:max-w-md w-full", className)}>
        <DialogHeader className="flex-row items-center gap-3 space-y-0 px-6 pt-6 pb-4 text-left">
          {icon && (
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", iconClassName)}>
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <DialogTitle className="text-base">{title}</DialogTitle>
            {description && <DialogDescription className="mt-0.5">{description}</DialogDescription>}
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">{children}</div>

        {footer && (
          <DialogFooter className="border-t bg-muted/30 px-6 py-4 sm:justify-end">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
