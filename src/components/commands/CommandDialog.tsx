import { useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateCommand, useDeleteCommand, useUpdateCommand } from "@/hooks/queries/useCommands";
import type { CommandType } from "@/types/commandType";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { categoryDot } from "./commandUtils";

type Props = {
  open: boolean;
  /** The command being edited; omit to create a new one. */
  command?: CommandType | null;
  categories: string[];
  onClose: () => void;
};

const label = "text-xs font-medium text-muted-foreground";
const field =
  "w-full rounded-lg border border-border bg-background/40 px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-ring";

/** Create or edit a command snippet. Content mounts per open, so the form starts fresh each time. */
const CommandDialog = ({ open, command, categories, onClose }: Props) => (
  <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className="flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg flex-col gap-0 overflow-hidden p-0">
      <CommandForm command={command} categories={categories} onClose={onClose} />
    </DialogContent>
  </Dialog>
);

const CommandForm = ({ command, categories, onClose }: Omit<Props, "open">) => {
  const create = useCreateCommand();
  const update = useUpdateCommand();
  const remove = useDeleteCommand();

  const [cmd, setCmd] = useState(command?.command ?? "");
  const [title, setTitle] = useState(command?.title ?? "");
  const [category, setCategory] = useState(command?.category ?? categories[0] ?? "Bash");
  const [newCategory, setNewCategory] = useState<string | null>(null);
  const [description, setDescription] = useState(command?.description ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const resolvedCategory = (newCategory ?? category).trim();
  const saving = create.isPending || update.isPending;
  const changed =
    !command ||
    cmd.trim() !== command.command ||
    title.trim() !== command.title ||
    resolvedCategory !== command.category ||
    description.trim() !== (command.description ?? "");
  const canSave =
    changed && !!cmd.trim() && !!title.trim() && !!resolvedCategory && resolvedCategory.length <= 50 && !saving;

  const save = async () => {
    if (!canSave) return;
    const data = {
      title: title.trim(),
      command: cmd.trim(),
      category: resolvedCategory,
      description: description.trim() || undefined,
    };
    try {
      if (command) await update.mutateAsync({ id: command.id, data });
      else await create.mutateAsync(data);
      toast.success(command ? "Command updated" : "Command saved");
      onClose();
    } catch {
      toast.error("Couldn't save the command. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!command) return;
    try {
      await remove.mutateAsync(command.id);
      toast.success("Command deleted");
      onClose();
    } catch {
      toast.error("Couldn't delete the command.");
    }
  };

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          save();
        }
      }}
    >
      <div className="shrink-0 px-5 pb-1 pt-5 sm:px-6">
        <DialogTitle>{command ? "Edit command" : "New command"}</DialogTitle>
        <DialogDescription className="mt-1">Save it once, copy it with one click from now on.</DialogDescription>
      </div>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5 sm:px-6">
        {/* The command comes first: it's usually what you have on the clipboard */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cmd-command" className={label}>Command</label>
          <div className="flex rounded-lg border border-border bg-background/60 focus-within:ring-1 focus-within:ring-ring">
            <span className="select-none pl-3 pt-2.5 font-mono text-sm text-emerald-400/80" aria-hidden>$</span>
            <textarea
              id="cmd-command"
              value={cmd}
              onChange={(e) => setCmd(e.target.value)}
              placeholder="docker compose up -d --build"
              autoFocus={!command}
              rows={2}
              spellCheck={false}
              className="min-h-16 w-full resize-none bg-transparent [overflow-wrap:anywhere] px-2.5 py-2.5 font-mono text-sm leading-relaxed outline-none field-sizing-content placeholder:text-muted-foreground/40"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="cmd-title" className={label}>Name</label>
          <input
            id="cmd-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="e.g. Rebuild and start containers"
            className={cn(field, "h-9")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={label}>Category</span>
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Category">
            {categories.map((c) => {
              const active = newCategory === null && c === category;
              return (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => { setCategory(c); setNewCategory(null); }}
                  className={cn(
                    "flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors",
                    active
                      ? "border-primary/60 bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", categoryDot(c))} />
                  {c}
                </button>
              );
            })}
            {newCategory === null ? (
              <button
                type="button"
                onClick={() => setNewCategory("")}
                className="flex h-7 items-center gap-1 rounded-md border border-dashed border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <Plus className="h-3 w-3" /> New
              </button>
            ) : (
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); setNewCategory(null); } }}
                autoFocus
                maxLength={50}
                placeholder="e.g. Kubernetes"
                aria-label="New category"
                className="h-7 w-36 rounded-md border border-primary/60 bg-background/40 px-2.5 text-xs outline-none"
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="cmd-desc" className={label}>
            Notes <span className="font-normal text-muted-foreground/60">(optional)</span>
          </label>
          <textarea
            id="cmd-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="When to use it, flags to remember…"
            className={cn(field, "resize-none py-2 leading-relaxed field-sizing-content")}
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border/60 px-5 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          {command && !confirmDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          )}
          {command && confirmDelete && (
            <>
              <Button type="button" size="sm" variant="destructive" onClick={handleDelete} disabled={remove.isPending}>
                Delete
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>Keep</Button>
            </>
          )}
        </div>
        {!confirmDelete && (
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" disabled={!canSave}>
              {saving && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
              {command ? "Save changes" : "Save command"}
            </Button>
          </div>
        )}
      </div>
    </form>
  );
};

export default CommandDialog;
