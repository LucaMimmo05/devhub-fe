import { FileText } from "lucide-react";
import type { NoteType } from "@/types/noteType";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

const stripMarkdown = (text: string) =>
  text
    .replace(/[#*_`~>\-]+/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();

const QuickNote = ({ note, onClick }: { note: NoteType; onClick?: () => void }) => (
  <div
    className="flex items-start gap-2.5 py-2.5 border-b border-border/50 last:border-0 group cursor-pointer"
    onClick={onClick}
  >
    <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground/60" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate leading-snug">{note.title}</p>
      {note.content && (
        <p className="text-xs text-muted-foreground truncate mt-0.5 leading-snug">
          {stripMarkdown(note.content)}
        </p>
      )}
    </div>
    <span className="text-[10px] text-muted-foreground/50 shrink-0 mt-0.5">
      {formatDate(note.updatedAt)}
    </span>
  </div>
);

export default QuickNote;
