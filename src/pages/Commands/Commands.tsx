import { useEffect, useMemo, useState } from "react";
import { Link, useMatch, useNavigate } from "react-router-dom";
import { Check, Copy, Pencil, Plus, Search, Terminal, X } from "lucide-react";
import PageContainer from "@/layouts/PageContainer";
import CommandDialog from "@/components/commands/CommandDialog";
import { allCategories, categoryDot } from "@/components/commands/commandUtils";
import { useCommands } from "@/hooks/queries/useCommands";
import type { CommandType } from "@/types/commandType";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const GRID = "grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3";

const CommandCard = ({ cmd, onEdit }: { cmd: CommandType; onEdit: () => void }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(cmd.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Couldn't copy to the clipboard.");
    }
  };

  return (
    <article className="group flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-4 transition-colors hover:border-primary/30">
      <header className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <span className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <span className={cn("h-1.5 w-1.5 rounded-full", categoryDot(cmd.category))} />
            {cmd.category}
          </span>
          <h3 className="truncate text-sm font-semibold">{cmd.title}</h3>
          {cmd.description && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{cmd.description}</p>}
        </div>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit "${cmd.title}"`}
          className="-mr-1.5 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </header>

      {/* The command itself is the copy button: one click, visible feedback */}
      <button
        type="button"
        onClick={copy}
        title="Click to copy"
        aria-label={`Copy command: ${cmd.command}`}
        className={cn(
          "group/cmd relative mt-auto flex w-full items-start gap-2 rounded-lg border bg-background/70 px-3 py-2.5 text-left font-mono text-xs leading-relaxed transition-colors focus-visible:outline-2 focus-visible:outline-ring",
          copied ? "border-emerald-500/50" : "border-border/60 hover:border-primary/40"
        )}
      >
        <span className="select-none text-emerald-400/80" aria-hidden>$</span>
        <code className="line-clamp-4 min-w-0 flex-1 whitespace-pre-wrap pr-14 [overflow-wrap:anywhere] text-foreground/90">{cmd.command}</code>
        <span
          className={cn(
            "absolute right-2 top-2 flex items-center gap-1 rounded-md px-1.5 py-0.5 font-sans text-[11px] font-medium transition-opacity",
            copied
              ? "bg-emerald-500/15 text-emerald-400 opacity-100"
              : "bg-muted text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover/cmd:opacity-100 sm:group-focus-visible/cmd:opacity-100"
          )}
        >
          {copied ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
        </span>
      </button>
    </article>
  );
};

const Commands = () => {
  const navigate = useNavigate();
  const creating = !!useMatch("/commands/new");
  const { data: commands = [], isLoading, isError } = useCommands();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<CommandType | null>(null);

  useEffect(() => {
    if (isError) toast.error("Couldn't load your commands.");
  }, [isError]);

  // Only categories that have commands get a filter chip, with their counts.
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of commands) map.set(c.category, (map.get(c.category) ?? 0) + 1);
    return map;
  }, [commands]);
  const filterCategories = allCategories(commands.map((c) => c.category)).filter((c) => counts.has(c));

  // Client-side filtering: the list is small, and search also looks inside the command text.
  const q = query.trim().toLowerCase();
  const visible = commands.filter(
    (c) =>
      (category === "All" || c.category === category) &&
      (!q ||
        c.title.toLowerCase().includes(q) ||
        c.command.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q))
  );

  return (
    <PageContainer className="gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Category">
          {["All", ...filterCategories].map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                category === c
                  ? "border-primary/50 bg-primary/10 text-foreground"
                  : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
              )}
            >
              {c !== "All" && <span className={cn("h-1.5 w-1.5 rounded-full", categoryDot(c))} />}
              {c}
              <span className="tabular-nums text-muted-foreground/70">
                {c === "All" ? commands.length : counts.get(c)}
              </span>
            </button>
          ))}
        </div>

        <label className="relative ml-auto w-full sm:w-72">
          <span className="sr-only">Search commands</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search names and commands…"
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
            <div key={i} className="flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-4">
              <div className="h-2.5 w-12 animate-pulse rounded bg-primary/10" />
              <div className="h-3.5 w-1/2 animate-pulse rounded bg-primary/10" />
              <div className="h-10 animate-pulse rounded-lg bg-primary/10" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-14 text-center">
          <Terminal className="h-6 w-6 text-muted-foreground/50" />
          <div>
            <p className="text-sm font-medium">{q || category !== "All" ? "No commands match" : "No commands yet"}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {q || category !== "All"
                ? "Search looks in names, commands and notes."
                : "Save the commands you keep looking up, then copy them with one click."}
            </p>
          </div>
          {!q && category === "All" && (
            <Link
              to="/commands/new"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
            >
              <Plus className="h-3.5 w-3.5" /> Save a command
            </Link>
          )}
        </div>
      ) : (
        <div className={GRID}>
          {visible.map((cmd) => (
            <CommandCard key={cmd.id} cmd={cmd} onEdit={() => setEditing(cmd)} />
          ))}
        </div>
      )}

      {/* /commands/new opens the same dialog on top of the list */}
      <CommandDialog
        open={creating || !!editing}
        command={editing}
        categories={allCategories(commands.map((c) => c.category))}
        onClose={() => {
          setEditing(null);
          if (creating) navigate("/commands");
        }}
      />
    </PageContainer>
  );
};

export default Commands;
