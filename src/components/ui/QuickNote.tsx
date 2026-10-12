import { FileText } from "lucide-react";
import { format } from "date-fns";
import type { NoteType } from "@/types/noteType";
import { stripMarkdown } from "@/utils/markdown";

const formatDate = (d: string | null | undefined) => {
  if (!d) return "just now";
  const date = new Date(d);
  if (isNaN(date.getTime()) || date.getFullYear() < 2000) return "just now";
  return format(date, "d MMM");
};

const QuickNote = ({ note, onClick }: { note: NoteType; onClick?: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-ring active:bg-muted"
  >
    {note.emoji ? (
      <span className="w-3.5 shrink-0 text-center text-sm leading-snug" aria-hidden>{note.emoji}</span>
    ) : (
      <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
    )}
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm font-medium leading-snug">{note.title}</span>
      {note.content && (
        <span className="mt-0.5 block truncate text-xs leading-snug text-muted-foreground">
          {stripMarkdown(note.content)}
        </span>
      )}
    </span>
    <span className="mt-0.5 shrink-0 text-[11px] tabular-nums text-muted-foreground/70">
      {formatDate(note.updatedAt)}
    </span>
  </button>
);

export default QuickNote;
