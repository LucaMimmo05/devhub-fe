import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Command as CommandPrimitive } from "cmdk";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { getUserProject } from "@/services/projectService";
import { getMyTasks } from "@/services/taskService";
import { getMyNotes } from "@/services/noteService";
import { getMyCommands } from "@/services/commandService";
import type { ProjectType } from "@/types/projectType";
import type { TaskType } from "@/types/taskType";
import type { NoteType } from "@/types/noteType";
import type { CommandType } from "@/types/commandType";
import { CheckSquare, FileText, FolderKanban, Loader2, Search, Terminal } from "lucide-react";

import { cn } from "@/lib/utils";

type Results = {
  projects: ProjectType[];
  tasks: TaskType[];
  notes: NoteType[];
  commands: CommandType[];
};

const EMPTY: Results = { projects: [], tasks: [], notes: [], commands: [] };

const statusLabel: Record<string, string> = {
  COMPLETED: "Completed",
  IN_PROGRESS: "In progress",
  PENDING: "Pending",
  TODO: "To do",
};

const priorityColor: Record<string, string> = {
  HIGH: "text-red-500",
  MEDIUM: "text-yellow-500",
  LOW: "text-green-500",
};

const isMac =
  typeof navigator !== "undefined" &&
  navigator.userAgent.toUpperCase().includes("MAC");

/* ── Tiny section label ── */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 select-none">
    {children}
  </div>
);

const SearchCommand = ({ onClose }: { onClose: () => void }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results>(EMPTY);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults(EMPTY); setLoading(false); return; }

    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const lower = q.toLowerCase();
        const [projects, tasks, notes, commands] = await Promise.all([
          getUserProject().then((all: ProjectType[]) =>
            all.filter((p) => p.title?.toLowerCase().includes(lower)).slice(0, 4)
          ),
          getMyTasks({ search: q }).then((r: TaskType[]) => r.slice(0, 4)),
          getMyNotes().then((all: NoteType[]) =>
            all
              .filter(
                (n) =>
                  n.title?.toLowerCase().includes(lower) ||
                  n.content?.toLowerCase().includes(lower)
              )
              .slice(0, 4)
          ),
          getMyCommands(undefined, q).then((r: CommandType[]) => r.slice(0, 4)),
        ]);
        setResults({ projects, tasks, notes, commands });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const go = (path: string) => { navigate(path); onClose(); };
  const hasResults = Object.values(results).some((r) => r.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[13vh] px-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[540px] h-[480px] rounded-xl border border-border/60 bg-background shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
      <Command shouldFilter={false} className="flex-1 flex flex-col overflow-hidden rounded-none border-none shadow-none bg-transparent">
        {/* ── Search bar ── */}
        <div className="flex items-center gap-3 px-4 border-b border-border/60 h-14">
          {loading
            ? <Loader2 className="h-4 w-4 shrink-0 text-muted-foreground animate-spin" />
            : <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          }
          <CommandPrimitive.Input
            autoFocus
            placeholder="Search anything…"
            value={query}
            onValueChange={setQuery}
            className="flex-1 h-full bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground/50"
          />
        </div>

        {/* ── Body ── */}
        <CommandList className="flex-1 overflow-y-auto">

          {/* Idle */}
          {!query.trim() && (
            <div className="py-14 text-center">
              <p className="text-sm text-muted-foreground">
                Search across projects, tasks, notes and commands
              </p>
            </div>
          )}

          {/* No results */}
          {!loading && query.trim() && !hasResults && (
            <div className="py-14 text-center">
              <p className="text-sm text-muted-foreground">
                No results for{" "}
                <span className="text-foreground font-medium">"{query}"</span>
              </p>
            </div>
          )}

          {/* ── Projects ── */}
          {results.projects.length > 0 && (
            <>
              <SectionLabel>Projects</SectionLabel>
              {results.projects.map((p) => (
                <CommandItem
                  key={`project-${p.id}`}
                  value={`project-${p.id}`}
                  onSelect={() => go(`/projects/${p.id}`)}
                  className="flex items-center gap-3 px-3 mx-1.5 py-2.5 rounded-lg cursor-pointer text-sm"
                >
                  <FolderKanban className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate font-medium">{p.title}</span>
                  {p.priority && (
                    <span className={cn("text-xs font-medium shrink-0", priorityColor[p.priority])}>
                      {p.priority}
                    </span>
                  )}
                </CommandItem>
              ))}
            </>
          )}

          {/* ── Tasks ── */}
          {results.tasks.length > 0 && (
            <>
              <SectionLabel>Tasks</SectionLabel>
              {results.tasks.map((t) => (
                <CommandItem
                  key={`task-${t.id}`}
                  value={`task-${t.id}`}
                  onSelect={() => go("/tasks")}
                  className="flex items-start gap-3 px-3 mx-1.5 py-2.5 rounded-lg cursor-pointer text-sm"
                >
                  <CheckSquare className="h-4 w-4 shrink-0 text-muted-foreground mt-px" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className={cn(
                      "font-medium truncate leading-snug",
                      t.status === "COMPLETED" && "line-through text-muted-foreground"
                    )}>
                      {t.title}
                    </span>
                    {t.projectTitle && (
                      <span className="text-xs text-muted-foreground truncate mt-0.5">{t.projectTitle}</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 mt-px">
                    {statusLabel[t.status] ?? t.status}
                  </span>
                </CommandItem>
              ))}
            </>
          )}

          {/* ── Notes ── */}
          {results.notes.length > 0 && (
            <>
              <SectionLabel>Notes</SectionLabel>
              {results.notes.map((n) => (
                <CommandItem
                  key={`note-${n.id}`}
                  value={`note-${n.id}`}
                  onSelect={() => go("/notes")}
                  className="flex items-start gap-3 px-3 mx-1.5 py-2.5 rounded-lg cursor-pointer text-sm"
                >
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground mt-px" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium truncate leading-snug">
                      {n.title || "Untitled"}
                    </span>
                    {n.content && (
                      <span className="text-xs text-muted-foreground truncate mt-0.5">
                        {n.content.replace(/[#*`>\-_[\]()]/g, "").trim().slice(0, 80)}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </>
          )}

          {/* ── Commands ── */}
          {results.commands.length > 0 && (
            <>
              <SectionLabel>Commands</SectionLabel>
              {results.commands.map((c) => (
                <CommandItem
                  key={`cmd-${c.id}`}
                  value={`cmd-${c.id}`}
                  onSelect={() => go("/commands")}
                  className="flex items-start gap-3 px-3 mx-1.5 py-2.5 rounded-lg cursor-pointer text-sm"
                >
                  <Terminal className="h-4 w-4 shrink-0 text-muted-foreground mt-px" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium truncate leading-snug">{c.title}</span>
                    <span className="text-xs text-muted-foreground font-mono truncate mt-0.5">{c.command}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 mt-px">{c.category}</span>
                </CommandItem>
              ))}
            </>
          )}

          {/* bottom padding */}
          {hasResults && <div className="h-2" />}
        </CommandList>
      </Command>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-2 text-[11px] text-muted-foreground/60 shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>
              open
            </span>
          </div>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              {isMac ? "⌘K" : "Ctrl+K"}
            </kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchCommand;
