import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { differenceInCalendarDays } from "date-fns";
import { FileText, Plus, Search, StickyNote, X } from "lucide-react";
import PageContainer from "@/layouts/PageContainer";
import { useNotes } from "@/hooks/queries/useNotes";
import { timeSince } from "@/utils/getRelativeTime";
import { stripMarkdown, wordCount } from "@/utils/markdown";
import type { NoteType } from "@/types/noteType";
import { toast } from "sonner";

const GRID = "grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 min-[1800px]:grid-cols-4";

// Most recently edited first, bucketed the way people remember notes.
const groupNotes = (notes: NoteType[]) => {
  const groups: { label: string; notes: NoteType[] }[] = [
    { label: "Today", notes: [] },
    { label: "Previous 7 days", notes: [] },
    { label: "Previous 30 days", notes: [] },
    { label: "Older", notes: [] },
  ];
  const sorted = [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  for (const n of sorted) {
    const days = differenceInCalendarDays(new Date(), new Date(n.updatedAt));
    groups[days <= 0 ? 0 : days <= 7 ? 1 : days <= 30 ? 2 : 3].notes.push(n);
  }
  return groups.filter((g) => g.notes.length > 0);
};

const NoteCard = ({ note }: { note: NoteType }) => {
  const preview = note.content ? stripMarkdown(note.content) : "";
  const words = wordCount(note.content);
  return (
    <Link
      to={`/notes/${note.id}`}
      className="group flex min-h-36 flex-col rounded-xl border border-border bg-card/60 p-4 transition-colors hover:border-primary/40 hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <div className="flex items-start gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/60 text-base leading-none" aria-hidden>
          {note.emoji ?? <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
        </span>
        <h3 className="line-clamp-2 pt-0.5 text-sm font-semibold leading-snug">{note.title || "Untitled"}</h3>
      </div>
      <p className="mt-2.5 line-clamp-3 flex-1 text-[13px] leading-relaxed text-muted-foreground">
        {preview || <span className="italic text-muted-foreground/60">Empty note</span>}
      </p>
      <p className="mt-3 text-[11px] text-muted-foreground/70">
        Edited {timeSince(note.updatedAt)}
        {words > 0 && <> · {words} word{words !== 1 ? "s" : ""}</>}
      </p>
    </Link>
  );
};

const Notes = () => {
  const { data: notes = [], isLoading, isError } = useNotes();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (isError) toast.error("Couldn't load your notes.");
  }, [isError]);

  const q = query.trim().toLowerCase();
  const groups = useMemo(
    () =>
      groupNotes(
        notes.filter((n) => !q || n.title.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q))
      ),
    [notes, q]
  );

  return (
    <PageContainer className="gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading…" : `${notes.length} note${notes.length !== 1 ? "s" : ""}`}
        </p>
        <label className="relative ml-auto w-full sm:w-72">
          <span className="sr-only">Search notes</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles and content…"
            className="h-9 w-full rounded-lg border border-border bg-card/60 pl-8 pr-8 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </label>
      </div>

      {isLoading ? (
        <div className={GRID} aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex min-h-36 flex-col gap-3 rounded-xl border border-border bg-card/60 p-4">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 animate-pulse rounded-md bg-primary/10" />
                <div className="h-3.5 w-2/5 animate-pulse rounded bg-primary/10" />
              </div>
              <div className="h-3 w-full animate-pulse rounded bg-primary/10" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-primary/10" />
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-14 text-center">
          <StickyNote className="h-6 w-6 text-muted-foreground/50" />
          <div>
            <p className="text-sm font-medium">{q ? `No notes match “${query.trim()}”` : "No notes yet"}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {q ? "Search looks in titles and note content." : "Jot down snippets, decisions and meeting notes — Markdown welcome."}
            </p>
          </div>
          {!q && (
            <Link
              to="/notes/new"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
            >
              <Plus className="h-3.5 w-3.5" /> Write a note
            </Link>
          )}
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.label} className="flex flex-col gap-2.5">
            <h2 className="text-xs font-medium text-muted-foreground">
              {group.label} <span className="tabular-nums text-muted-foreground/60">{group.notes.length}</span>
            </h2>
            <div className={GRID}>
              {group.notes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          </section>
        ))
      )}
    </PageContainer>
  );
};

export default Notes;
