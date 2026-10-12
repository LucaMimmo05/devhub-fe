import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Command as CommandPrimitive } from "cmdk";
import {
  CheckSquare,
  Copy,
  CornerDownLeft,
  FileText,
  FolderKanban,
  Home,
  ListChecks,
  Plus,
  Search,
  Settings,
  StickyNote,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { useProjects } from "@/hooks/queries/useProjects";
import { useMyTasks } from "@/hooks/queries/useTasks";
import { useNotes } from "@/hooks/queries/useNotes";
import { useCommands } from "@/hooks/queries/useCommands";
import { relativeDue } from "@/components/projects/projectUtils";
import { stripMarkdown } from "@/utils/markdown";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const PER_GROUP = 5;

/** Ranks a match: title prefix beats title substring beats a hit elsewhere; 0 = no match. */
const score = (q: string, title: string, ...rest: (string | undefined)[]) => {
  const t = title.toLowerCase();
  if (t.startsWith(q)) return 3;
  if (t.includes(q)) return 2;
  return rest.some((r) => r?.toLowerCase().includes(q)) ? 1 : 0;
};

const rank = <T,>(items: T[], q: string, fields: (item: T) => [string, ...(string | undefined)[]]) =>
  items
    .map((item) => ({ item, s: score(q, ...fields(item)) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, PER_GROUP)
    .map((r) => r.item);

/** Wraps the matched part of `text` in a highlight. */
const Highlight = ({ text, q }: { text: string; q: string }) => {
  const i = q ? text.toLowerCase().indexOf(q) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-sm bg-primary/25 text-foreground">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
};

const Group = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="pb-1">
    <div className="select-none px-4 pb-1 pt-3 text-[11px] font-medium text-muted-foreground/70">{label}</div>
    {children}
  </div>
);

const Item = ({
  value,
  icon: Icon,
  iconNode,
  title,
  subtitle,
  meta,
  hint,
  onSelect,
}: {
  value: string;
  icon?: LucideIcon;
  iconNode?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  /** Shown on the highlighted row, e.g. "Copy" for commands. */
  hint?: string;
  onSelect: () => void;
}) => (
  <CommandItem
    value={value}
    onSelect={onSelect}
    className="group mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm data-[selected=true]:bg-muted"
  >
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground group-data-[selected=true]:bg-background/60">
      {iconNode ?? (Icon && <Icon className="h-3.5 w-3.5" />)}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block truncate font-medium leading-snug">{title}</span>
      {subtitle && <span className="block truncate text-xs leading-snug text-muted-foreground">{subtitle}</span>}
    </span>
    {meta && <span className="shrink-0 text-xs text-muted-foreground">{meta}</span>}
    <span className="hidden shrink-0 items-center gap-1 text-[11px] text-muted-foreground group-data-[selected=true]:flex">
      {hint === "Copy" ? <Copy className="h-3 w-3" /> : <CornerDownLeft className="h-3 w-3" />}
      {hint ?? "Open"}
    </span>
  </CommandItem>
);

const SearchCommand = ({ onClose }: { onClose: () => void }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  // Everything comes from the React Query cache the pages already fill: instant, no extra requests.
  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useMyTasks();
  const { data: notes = [] } = useNotes();
  const { data: commands = [] } = useCommands();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  const copy = async (text: string, title: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied “${title}”`);
      onClose();
    } catch {
      toast.error("Couldn't copy to the clipboard.");
    }
  };

  const openTasks = tasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS");

  // A few dozen items at most: ranking on every keystroke is instant, no memoization needed.
  const results = q
    ? {
        projects: rank(projects, q, (p) => [p.title, p.description]),
        tasks: rank(tasks, q, (t) => [t.title, t.description, t.projectTitle]),
        notes: rank(notes, q, (n) => [n.title, n.content]),
        commands: rank(commands, q, (c) => [c.title, c.command, c.description, c.category]),
      }
    : null;

  const pages: { label: string; path: string; icon: LucideIcon }[] = [
    { label: "Home", path: "/", icon: Home },
    { label: "Projects", path: "/projects", icon: FolderKanban },
    { label: "Tasks", path: "/tasks", icon: CheckSquare },
    { label: "Notes", path: "/notes", icon: StickyNote },
    { label: "Commands", path: "/commands", icon: Terminal },
    { label: "Settings", path: "/settings", icon: Settings },
  ];
  const creates: { label: string; path: string; icon: LucideIcon }[] = [
    { label: "New task", path: "/tasks/new", icon: ListChecks },
    { label: "New note", path: "/notes/new", icon: FileText },
    { label: "New project", path: "/projects/new", icon: FolderKanban },
    { label: "New command", path: "/commands/new", icon: Terminal },
  ];
  // Actions and pages also match the query, so "new note" or "settings" work as commands.
  const matchingActions = q ? [...creates, ...pages].filter((a) => a.label.toLowerCase().includes(q)) : [];

  const dueSoon = [...openTasks]
    .filter((t) => t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 4);

  const taskRow = (t: (typeof tasks)[number]) => {
    const due = relativeDue(t.dueDate, t.status);
    return (
      <Item
        key={t.id}
        value={`task-${t.id}`}
        icon={CheckSquare}
        title={
          <span className={cn(t.status === "COMPLETED" && "text-muted-foreground line-through")}>
            <Highlight text={t.title} q={q} />
          </span>
        }
        subtitle={t.projectTitle}
        meta={
          due?.rel ? (
            <span className={cn(due.late && "font-medium text-red-400")}>{due.rel}</span>
          ) : t.status === "COMPLETED" ? (
            "Done"
          ) : undefined
        }
        onSelect={() => go(`/tasks?task=${t.id}`)}
      />
    );
  };

  const total = results
    ? results.projects.length + results.tasks.length + results.notes.length + results.commands.length + matchingActions.length
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-3 pt-[10vh] backdrop-blur-sm sm:px-4 sm:pt-[13vh]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        className="flex max-h-[min(560px,75vh)] w-full max-w-[600px] flex-col overflow-hidden rounded-xl border border-border/70 bg-popover shadow-2xl shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        <Command shouldFilter={false} loop className="flex min-h-0 flex-1 flex-col rounded-none border-none bg-transparent shadow-none">
          <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border/60 px-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <CommandPrimitive.Input
              autoFocus
              placeholder="Search projects, tasks, notes, commands… or type an action"
              value={query}
              onValueChange={setQuery}
              className="h-full flex-1 bg-transparent p-0 text-[15px] outline-none placeholder:text-muted-foreground/50"
            />
            <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px] text-muted-foreground sm:block">Esc</kbd>
          </div>

          <CommandList className="max-h-none min-h-0 flex-1 overflow-y-auto pb-2">
            {!results ? (
              <>
                <Group label="Create">
                  {creates.map((a) => (
                    <Item key={a.path} value={a.path} icon={Plus} title={a.label} onSelect={() => go(a.path)} />
                  ))}
                </Group>
                {dueSoon.length > 0 && (
                  <Group label="Coming up">
                    {dueSoon.map(taskRow)}
                  </Group>
                )}
                <Group label="Go to">
                  {pages.map((p) => (
                    <Item key={p.path} value={`page-${p.path}`} icon={p.icon} title={p.label} onSelect={() => go(p.path)} />
                  ))}
                </Group>
              </>
            ) : total === 0 ? (
              <div className="px-6 py-14 text-center">
                <p className="text-sm text-muted-foreground">
                  Nothing matches <span className="font-medium text-foreground">“{query.trim()}”</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">Search looks in titles, descriptions, note text and commands.</p>
              </div>
            ) : (
              <>
                {matchingActions.length > 0 && (
                  <Group label="Actions">
                    {matchingActions.map((a) => (
                      <Item key={a.path} value={`action-${a.path}`} icon={a.icon} title={<Highlight text={a.label} q={q} />} onSelect={() => go(a.path)} />
                    ))}
                  </Group>
                )}
                {results.tasks.length > 0 && <Group label="Tasks">{results.tasks.map(taskRow)}</Group>}
                {results.projects.length > 0 && (
                  <Group label="Projects">
                    {results.projects.map((p) => (
                      <Item
                        key={p.id}
                        value={`project-${p.id}`}
                        icon={FolderKanban}
                        title={<Highlight text={p.title} q={q} />}
                        subtitle={p.description}
                        meta={p.status === "ARCHIVED" ? "Archived" : undefined}
                        onSelect={() => go(`/projects/${p.id}`)}
                      />
                    ))}
                  </Group>
                )}
                {results.notes.length > 0 && (
                  <Group label="Notes">
                    {results.notes.map((n) => (
                      <Item
                        key={n.id}
                        value={`note-${n.id}`}
                        iconNode={n.emoji ? <span className="text-sm leading-none">{n.emoji}</span> : <FileText className="h-3.5 w-3.5" />}
                        title={<Highlight text={n.title || "Untitled"} q={q} />}
                        subtitle={n.content ? stripMarkdown(n.content).slice(0, 120) : undefined}
                        onSelect={() => go(`/notes/${n.id}`)}
                      />
                    ))}
                  </Group>
                )}
                {results.commands.length > 0 && (
                  <Group label="Commands">
                    {results.commands.map((c) => (
                      <Item
                        key={c.id}
                        value={`cmd-${c.id}`}
                        icon={Terminal}
                        title={<Highlight text={c.title} q={q} />}
                        subtitle={<span className="font-mono">{c.command}</span>}
                        meta={c.category}
                        hint="Copy"
                        onSelect={() => copy(c.command, c.title)}
                      />
                    ))}
                  </Group>
                )}
              </>
            )}
          </CommandList>
        </Command>

        <div className="hidden shrink-0 items-center gap-4 border-t border-border/60 px-4 py-2 text-[11px] text-muted-foreground/70 sm:flex">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px]">↑↓</kbd> move
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px]">↵</kbd> open · copy commands
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[10px]">Esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchCommand;
