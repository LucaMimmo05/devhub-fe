import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Loader2, SmilePlus, Trash2 } from "lucide-react";
import PageContainer from "@/layouts/PageContainer";
import MarkdownEditor from "@/components/notes/MarkdownEditor";
import EmojiPicker from "@/components/notes/EmojiPicker";
import { Button } from "@/components/ui/button";
import { useCreateNote, useDeleteNote, useUpdateNote } from "@/hooks/queries/useNotes";
import { timeSince } from "@/utils/getRelativeTime";
import { wordCount } from "@/utils/markdown";
import type { NoteType } from "@/types/noteType";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CLOSE_PATH = "/notes";
const AUTOSAVE_MS = 800;

type Draft = { title: string; content: string; emoji: string | null };
type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * Note editor for both new and existing notes, inside the app shell. There's no "create"
 * button: a new note is created by the first autosave, then keeps saving like
 * any other. Pending edits are flushed before closing, so nothing typed is lost.
 */
const NoteEditor = ({ note }: { note?: NoteType }) => {
  const navigate = useNavigate();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [emoji, setEmoji] = useState<string | null>(note?.emoji ?? null);
  const [updatedAt, setUpdatedAt] = useState(note?.updatedAt);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Refs hold the latest values for the debounced/queued saves and the unmount flush.
  const noteId = useRef<string | null>(note?.id ?? null);
  const latest = useRef<Draft>({ title, content, emoji });
  const dirty = useRef(false);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusBody = useRef<(() => void) | null>(null);

  const persist = async () => {
    if (!dirty.current) return;
    const draft = latest.current;
    // Don't create an empty note just because the editor was opened.
    if (!noteId.current && !draft.title.trim() && !draft.content.trim()) return;
    dirty.current = false;
    setSaveState("saving");
    const payload = { title: draft.title.trim() || "Untitled", content: draft.content, emoji: draft.emoji ?? "" };
    try {
      const saved = noteId.current
        ? await updateNote.mutateAsync({ id: noteId.current, data: payload })
        : await createNote.mutateAsync(payload);
      if (!noteId.current) {
        noteId.current = saved.id;
        // Swap /notes/new for the real URL without remounting the editor (keeps cursor and focus).
        window.history.replaceState(window.history.state, "", `/notes/${saved.id}`);
      }
      setUpdatedAt(saved.updatedAt);
      setSaveState("saved");
    } catch {
      dirty.current = true;
      setSaveState("error");
    }
  };

  // Saves run one after another, so a slow first save can't create the note twice.
  const flush = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    queue.current = queue.current.then(persist);
    return queue.current;
  };

  const change = (patch: Partial<Draft>, immediate = false) => {
    latest.current = { ...latest.current, ...patch };
    dirty.current = true;
    if (immediate) {
      flush();
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, AUTOSAVE_MS);
  };

  const close = async () => {
    await flush();
    if (dirty.current) {
      toast.error("Couldn't save your last changes. Check your connection and try again.");
      return;
    }
    navigate(CLOSE_PATH);
  };

  // Leaving by any other route (sidebar, back button): still save what's pending.
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      if (dirty.current) queue.current.then(persist);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount-only flush; persist reads refs
    []
  );

  const handleDelete = async () => {
    if (timer.current) clearTimeout(timer.current);
    dirty.current = false;
    await queue.current;
    if (!noteId.current) {
      navigate(CLOSE_PATH);
      return;
    }
    try {
      await deleteNote.mutateAsync(noteId.current);
      toast.success("Note deleted");
      navigate(CLOSE_PATH);
    } catch {
      toast.error("Couldn't delete the note.");
    }
  };

  const words = wordCount(content);

  return (
    <PageContainer className="gap-0">
      <div className="mx-auto w-full max-w-3xl">
        {/* Top bar: back, save state, delete */}
        <div className="mb-6 flex min-h-8 items-center gap-3">
          <a
            href={CLOSE_PATH}
            onClick={(e) => {
              e.preventDefault();
              close();
            }}
            className="-ml-1 flex items-center gap-1.5 rounded-md px-1 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All notes
          </a>
          <span
            aria-live="polite"
            className={cn("ml-auto flex items-center gap-1.5 text-xs", saveState === "error" ? "text-destructive" : "text-muted-foreground")}
          >
            {saveState === "saving" && <><Loader2 className="h-3 w-3 animate-spin" /> Saving…</>}
            {saveState === "saved" && <><Check className="h-3 w-3 text-emerald-400" /> Saved</>}
            {saveState === "error" && "Not saved — retrying on next edit"}
          </span>
          {!confirmDelete ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete note"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="hidden text-xs text-destructive sm:inline">Delete this note?</span>
              <Button size="sm" variant="destructive" className="h-8" onClick={handleDelete} disabled={deleteNote.isPending}>
                Delete
              </Button>
              <Button size="sm" variant="ghost" className="h-8" onClick={() => setConfirmDelete(false)}>Keep</Button>
            </div>
          )}
        </div>

        <article className="group/head flex flex-col">
          {/* Icon: shown big when set; otherwise a quiet "Add icon" that appears on hover (always on touch) */}
          <div className="mb-2 h-12">
            <EmojiPicker
              value={emoji}
              onChange={(e) => { setEmoji(e); change({ emoji: e }, true); }}
              onRemove={() => { setEmoji(null); change({ emoji: null }, true); }}
              label={emoji ? "Change icon" : "Add icon"}
              triggerClassName={cn(
                "rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                emoji
                  ? "-ml-1 flex h-12 w-12 items-center justify-center text-4xl leading-none hover:bg-muted/60"
                  : "flex h-8 items-center gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground sm:opacity-0 sm:group-hover/head:opacity-100 sm:focus-visible:opacity-100 data-[state=open]:opacity-100"
              )}
            >
              {emoji ?? <><SmilePlus className="h-4 w-4" /> Add icon</>}
            </EmojiPicker>
          </div>

          <textarea
            value={title}
            onChange={(e) => {
              const v = e.target.value.replace(/\n/g, " ");
              setTitle(v);
              change({ title: v });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                focusBody.current?.();
              }
            }}
            rows={1}
            maxLength={100}
            autoFocus={!note}
            aria-label="Note title"
            placeholder="Untitled"
            className="w-full resize-none bg-transparent text-3xl font-bold leading-tight tracking-tight outline-none field-sizing-content placeholder:text-muted-foreground/30 sm:text-4xl"
          />

          <p className="mb-6 mt-2 text-xs text-muted-foreground">
            {updatedAt ? `Edited ${timeSince(updatedAt)}` : "Not saved yet — starts saving as you type"}
            {words > 0 && <> · {words} word{words !== 1 ? "s" : ""}</>}
          </p>

          <MarkdownEditor
            content={content}
            toolbar
            focusRef={focusBody}
            onChange={(md) => {
              setContent(md);
              change({ content: md });
            }}
            placeholder="Start writing… Markdown formats as you type: # heading, - list, **bold**"
          />
        </article>
      </div>
    </PageContainer>
  );
};

export default NoteEditor;
