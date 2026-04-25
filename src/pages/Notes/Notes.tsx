import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHeaderActions } from "@/context/HeaderActionsContext";
import { cn } from "@/lib/utils";
import { createNote, deleteNote, getMyNotes, updateNote } from "@/services/noteService";
import { toast } from "sonner";
import type { NoteType } from "@/types/noteType";
import { timeSince } from "@/utils/getRelativeTime";
import { ArrowLeft, Eye, EyeOff, Loader2, Plus, Search, StickyNote, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const proseClass = [
  "text-sm text-foreground leading-relaxed",
  "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:mt-5 [&_h1]:first:mt-0",
  "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4",
  "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3",
  "[&_p]:mb-3",
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3",
  "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3",
  "[&_li]:mb-1",
  "[&_code]:bg-muted [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs",
  "[&_pre]:bg-muted [&_pre]:rounded-md [&_pre]:p-4 [&_pre]:mb-3 [&_pre]:overflow-x-auto",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:mb-3",
  "[&_a]:text-primary [&_a]:underline",
  "[&_hr]:border-border [&_hr]:my-4",
  "[&_strong]:font-semibold",
  "[&_table]:w-full [&_table]:border-collapse [&_table]:mb-3 [&_table]:text-sm",
  "[&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-1.5 [&_th]:bg-muted [&_th]:font-semibold [&_th]:text-left",
  "[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-1.5",
].join(" ");

const Notes = () => {
  const { setOnCreate } = useHeaderActions();

  const [notes, setNotes] = useState<NoteType[]>([]);
  const [selectedNote, setSelectedNote] = useState<NoteType | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [search, setSearch] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedNoteRef = useRef<NoteType | null>(null);
  const location = useLocation();

  useEffect(() => { selectedNoteRef.current = selectedNote; }, [selectedNote]);

  useEffect(() => {
    const targetId = (location.state as { noteId?: string } | null)?.noteId;
    getMyNotes().then((loaded: NoteType[]) => {
      setNotes(loaded);
      if (targetId) {
        const match = loaded.find((n) => n.id === targetId);
        if (match) selectNote(match);
      }
    }).catch(() => toast.error("Failed to load notes."));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setOnCreate?.(() => () => handleCreateNote());
    return () => setOnCreate?.(undefined);
  }, [setOnCreate]);

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase())
  );

  const selectNote = (note: NoteType) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content ?? "");
    setIsDirty(false);
    setConfirmDelete(false);
    setShowEditor(true);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleCreateNote = async () => {
    setCreating(true);
    try {
      const created = await createNote({ title: "Untitled", content: "" });
      setNotes((prev) => [created, ...prev]);
      selectNote(created);
    } catch {
      toast.error("Failed to create note.");
    } finally {
      setCreating(false);
    }
  };

  const saveNote = useCallback(async (noteId: string, t: string, c: string) => {
    if (!t.trim()) return;
    setSaving(true);
    setSaveStatus("saving");
    try {
      const updated = await updateNote(noteId, { title: t, content: c });
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      setSelectedNote(updated);
      setIsDirty(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      toast.error("Failed to save note.");
      setSaveStatus("idle");
    } finally {
      setSaving(false);
    }
  }, []);

  const scheduleAutoSave = useCallback((t: string, c: string) => {
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    autoSaveTimeout.current = setTimeout(() => {
      const note = selectedNoteRef.current;
      if (note) saveNote(note.id, t, c);
    }, 1000);
  }, [saveNote]);

  const handleSave = () => {
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    const note = selectedNoteRef.current;
    if (note) saveNote(note.id, title, content);
  };

  const handleDelete = async () => {
    if (!selectedNote) return;
    try {
      await deleteNote(selectedNote.id);
      const remaining = notes.filter((n) => n.id !== selectedNote.id);
      setNotes(remaining);
      if (remaining.length > 0) {
        selectNote(remaining[0]);
      } else {
        setSelectedNote(null);
        setTitle("");
        setContent("");
        setShowEditor(false);
      }
      setConfirmDelete(false);
      toast.success("Note deleted.");
    } catch {
      toast.error("Failed to delete note.");
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <div className={cn(
        "flex flex-col border-r w-64 shrink-0 h-full",
        showEditor ? "hidden lg:flex" : "flex w-full lg:w-64"
      )}>
        <div className="flex items-center gap-2 px-3 py-3 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="pl-8 h-8 text-sm"
            />
          </div>
          <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={handleCreateNote} disabled={creating}>
            {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-4">
              <StickyNote className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">
                {search ? "No notes match your search." : "No notes yet. Click + to create one."}
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isSelected = selectedNote?.id === note.id;
              return (
                <button
                  key={note.id}
                  onClick={() => selectNote(note)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-md transition-colors border",
                    isSelected
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "border-transparent hover:bg-muted text-foreground"
                  )}
                >
                  {/* Show live title for selected note, saved title for others */}
                  <p className="text-sm font-medium truncate">
                    {isSelected ? (title || "Untitled") : (note.title || "Untitled")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{timeSince(note.updatedAt)}</p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Editor ──────────────────────────────────────────────────── */}
      <div className={cn(
        "flex flex-col flex-1 h-full min-w-0",
        !showEditor && "hidden lg:flex"
      )}>
        {!selectedNote ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <StickyNote className="h-12 w-12 opacity-20" />
            <p className="text-sm">Select a note or create a new one</p>
            <Button variant="outline" size="sm" onClick={handleCreateNote} disabled={creating}>
              {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
              New Note
            </Button>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 py-2 border-b shrink-0">
              <Button size="icon" variant="ghost" className="h-7 w-7 lg:hidden" onClick={() => setShowEditor(false)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Input
                value={title}
                onChange={(e) => {
                  const v = e.target.value;
                  setTitle(v);
                  setIsDirty(true);
                  scheduleAutoSave(v, content);
                }}
                placeholder="Note title"
                className="border-0 shadow-none text-base font-semibold px-0 h-8 focus-visible:ring-0 flex-1"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
                {!saving && saveStatus === "saved" && <span className="text-xs text-muted-foreground">Saved</span>}
                {!saving && saveStatus === "idle" && isDirty && <span className="text-xs text-muted-foreground">Unsaved</span>}

                <Button
                  size="icon"
                  variant={showPreview ? "default" : "outline"}
                  className="h-8 w-8"
                  onClick={() => setShowPreview((v) => !v)}
                  title={showPreview ? "Hide preview" : "Show preview"}
                >
                  {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>

                <Button size="sm" onClick={handleSave} disabled={saving || !title.trim()}>
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                  Save
                </Button>

                {!confirmDelete ? (
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setConfirmDelete(true)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-destructive">Delete?</span>
                    <Button size="sm" variant="destructive" onClick={handleDelete}>Yes</Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>No</Button>
                  </div>
                )}
              </div>
            </div>

            {/* Content area */}
            {showPreview ? (
              /* Split: write top, live preview bottom */
              <div className="flex flex-col flex-1 min-h-0">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => { const v = e.target.value; setContent(v); setIsDirty(true); scheduleAutoSave(title, v); }}
                  placeholder={"Start writing..."}
                  className="w-full resize-none p-6 font-mono text-sm bg-transparent focus:outline-none leading-relaxed border-b"
                  style={{ height: "50%", minHeight: 0 }}
                  spellCheck={false}
                />
                <div className="overflow-y-auto p-6" style={{ height: "50%" }}>
                  {content.trim() ? (
                    <div className={proseClass}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Nothing to preview.</p>
                  )}
                </div>
              </div>
            ) : (
              /* Write only */
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => { const v = e.target.value; setContent(v); setIsDirty(true); scheduleAutoSave(title, v); }}
                placeholder={"Start writing..."}
                className="flex-1 w-full resize-none p-6 font-mono text-sm bg-transparent focus:outline-none leading-relaxed"
                spellCheck={false}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notes;
