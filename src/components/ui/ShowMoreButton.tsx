import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Footer toggle for a list cut short to fit the screen: "Show 6 more" / "Show less". */
const ShowMoreButton = ({ hidden, expanded, onToggle }: { hidden: number; expanded: boolean; onToggle: () => void }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-expanded={expanded}
    className="flex w-full items-center justify-center gap-1.5 border-t border-border/60 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
  >
    {expanded ? "Show less" : `Show ${hidden} more`}
    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
  </button>
);

export default ShowMoreButton;
