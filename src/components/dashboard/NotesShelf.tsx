import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { timeSince } from "@/utils/getRelativeTime";
import { stripMarkdown } from "@/utils/markdown";
import type { NoteType } from "@/types/noteType";

/** The latest notes as small cards, so a glance shows what each one is about. */
const NotesShelf = ({ notes }: { notes: NoteType[] }) => {
  const recent = [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);
  return (
    <div className="grid grid-cols-1 gap-2 p-1 @md:grid-cols-2">
      {recent.map((n) => (
        <Link
          key={n.id}
          to={`/notes/${n.id}`}
          className="group flex min-h-24 flex-col rounded-lg border border-border/60 bg-background/30 p-3 transition-colors hover:border-primary/40 hover:bg-background/50"
        >
          <span className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted/60 text-sm" aria-hidden>
              {n.emoji ?? <FileText className="h-3 w-3 text-muted-foreground" />}
            </span>
            <span className="truncate text-sm font-medium group-hover:text-primary">{n.title || "Untitled"}</span>
          </span>
          <span className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
            {n.content ? stripMarkdown(n.content) : "Empty note"}
          </span>
          <span className="mt-2 text-[10px] text-muted-foreground/70">Edited {timeSince(n.updatedAt)}</span>
        </Link>
      ))}
    </div>
  );
};

export default NotesShelf;
