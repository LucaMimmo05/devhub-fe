import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Priority, Status } from "@/types/PriorityAndStatusType";

const colorMap: Record<Priority | Status, string> = {
  HIGH:        "bg-red-500/10 text-red-400 border-red-500/25",
  MEDIUM:      "bg-yellow-500/10 text-yellow-400 border-yellow-500/25",
  LOW:         "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  PENDING:     "bg-muted text-muted-foreground border-border",
  IN_PROGRESS: "bg-primary/10 text-primary border-primary/25",
  COMPLETED:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  ARCHIVED:    "bg-muted text-muted-foreground border-border",
};

const PriorityBadge = ({
  data,
  children,
  className,
}: {
  data: Priority | Status;
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex items-center rounded-md border px-2 py-0.5",
      "text-xs font-medium whitespace-nowrap shrink-0",
      colorMap[data],
      className
    )}
  >
    {children}
  </span>
);

export default PriorityBadge;
