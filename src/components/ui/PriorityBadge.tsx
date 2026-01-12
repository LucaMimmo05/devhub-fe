import type { ReactNode } from "react";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

const PriorityBadge = ({
  data,
  children,
}: {
  data: "Low" | "Medium" | "High" | "Pending" | "In Progress" | "Completed";
  children: ReactNode;
}) => {
  return (
    <Badge
      className={cn(
        "text-xs px-2 py-0.5 whitespace-nowrap shrink-0 truncate",
        
        "hover:bg-inset transition-colors duration-150",

        (data === "High" || data === "Pending") && "bg-red-700 text-red-200",
        (data === "Medium" || data === "In Progress") &&
          "bg-yellow-700 text-yellow-200",
        (data === "Low" || data === "Completed") &&
          "bg-green-700 text-green-200"
      )}
    >
      {children}
    </Badge>
  );
};

export default PriorityBadge;
