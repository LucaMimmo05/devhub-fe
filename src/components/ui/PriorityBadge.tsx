import type { ReactNode } from "react";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";
import type { Priority, Status } from "@/types/PriorityAndStatusType";

const PriorityBadge = ({
  data,
  children,
}: {
  data: Priority | Status;
  children: ReactNode;
}) => {
  const colorMap: Record<Priority | Status, string> = {
    HIGH: "bg-red-700 text-red-200",
    MEDIUM: "bg-yellow-700 text-yellow-200",
    LOW: "bg-green-700 text-green-200",
    PENDING: "bg-red-700 text-red-200",
    IN_PROGRESS: "bg-yellow-700 text-yellow-200",
    COMPLETED: "bg-green-700 text-green-200",
  };

  return (
    <Badge
      className={cn(
        "text-xs px-2 py-0.5 whitespace-nowrap shrink-0 truncate",
        "hover:bg-inset transition-colors duration-150",
        colorMap[data] // applica la classe corretta
      )}
    >
      {children}
    </Badge>
  );
};

export default PriorityBadge;
