import type { ReactNode } from "react";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";
const PriorityBadge = ({ data, children }: { data: "Low" | "Medium" | "High" | "Pending" | "In Progress" | "Completed"; children: ReactNode }) => {
  return (
    <Badge
      className={cn(
        "hover:bg-inset text-xs shrink-0",
        (data === "High" || data === "Pending") && "bg-red-700 text-red-200",
        (data === "Medium" || data === "In Progress") && "bg-yellow-700 text-yellow-200",
        (data === "Low" || data === "Completed") && "bg-green-700 text-green-200"
      )}
    >
      {children}
    </Badge>
  );
};


export default PriorityBadge;
