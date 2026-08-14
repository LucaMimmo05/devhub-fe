import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotes } from "@/hooks/queries/useNotes";
import { toast } from "sonner";
import { timeSince } from "@/utils/getRelativeTime";
import { Plus, Search, StickyNote } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageContainer from "@/layouts/PageContainer";

const Notes = () => {
  const navigate = useNavigate();
  const { data: notes = [], isError } = useNotes();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isError) toast.error("Failed to load notes.");
  }, [isError]);

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={() => navigate("/notes/new")}>
          <Plus className="h-4 w-4 mr-1.5" /> New note
        </Button>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-220px)] gap-3 text-center">
          <StickyNote className="h-12 w-12 text-muted-foreground/30" />
          <div>
            <h3 className="font-semibold text-lg">
              {search ? "No notes match your search" : "No notes yet"}
            </h3>
            <p className="text-muted-foreground text-sm">
              {search ? "Try a different search." : "Click New note to write your first one."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              onClick={() => navigate(`/notes/${note.id}`)}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card px-4 py-3 text-left hover:border-primary/40 hover:bg-muted/40 transition-colors"
            >
              <p className="text-sm font-semibold truncate">{note.title || "Untitled"}</p>
              <p className="text-xs text-muted-foreground line-clamp-3 min-h-8">
                {note.content?.trim() || "No content yet."}
              </p>
              <p className="text-[11px] text-muted-foreground/70 mt-1">{timeSince(note.updatedAt)}</p>
            </button>
          ))}
        </div>
      )}
    </PageContainer>
  );
};

export default Notes;
