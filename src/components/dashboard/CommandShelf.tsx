import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import type { CommandType } from "@/types/commandType";

/** Most recently used commands, one click to copy. */
const CommandShelf = ({ commands }: { commands: CommandType[] }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const recent = [...commands].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);

  const copy = async (c: CommandType) => {
    try {
      await navigator.clipboard.writeText(c.command);
      setCopied(c.id);
      setTimeout(() => setCopied((id) => (id === c.id ? null : id)), 1500);
    } catch {
      toast.error("Couldn't copy to the clipboard.");
    }
  };

  return (
    <ul className="flex flex-col gap-1">
      {recent.map((c) => (
        <li key={c.id}>
          <button
            type="button"
            onClick={() => copy(c)}
            title="Copy command"
            className="group flex w-full flex-col gap-1 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span className="truncate text-xs font-medium">{c.title}</span>
              <span className="shrink-0 text-[10px] text-muted-foreground">{c.category}</span>
            </span>
            <span className="flex w-full items-center gap-2 rounded-md bg-black/30 px-2 py-1.5 font-mono text-[11px] text-emerald-300/90">
              <span className="select-none text-muted-foreground/60">$</span>
              <span className="min-w-0 flex-1 truncate">{c.command}</span>
              {copied === c.id ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
};

export default CommandShelf;
