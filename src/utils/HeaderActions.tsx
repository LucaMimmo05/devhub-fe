import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";
import { Plus, RefreshCw, ChevronDown, Trash2, Edit, FolderGit2, FileText, Terminal, ListChecks } from "lucide-react";

interface HeaderActionsHandlers {
  onNavigate?: (path: string) => void;
  /** Target path for the plain "add" header button. */
  createPath?: string;
  /** Label for the "add" button; shown from `sm` up, icon-only below. */
  createLabel?: string;
  onSync?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const getHeaderActions = (
  handlers: HeaderActionsHandlers
): Record<string, React.ReactNode> => ({
  addDropdown: (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" aria-label="Create new" className="h-8 gap-1.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New</span>
          <ChevronDown className="hidden h-3.5 w-3.5 opacity-70 sm:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handlers.onNavigate?.("/projects/new")}>
          <FolderGit2 className="mr-2 h-4 w-4" />
          Project
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlers.onNavigate?.("/tasks/new")}>
          <ListChecks className="mr-2 h-4 w-4" />
          Task
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlers.onNavigate?.("/notes/new")}>
          <FileText className="mr-2 h-4 w-4" />
          Note
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlers.onNavigate?.("/commands/new")}>
          <Terminal className="mr-2 h-4 w-4" />
          Command
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),

  add: (
    <Button
      size="sm"
      className="h-8 gap-1.5"
      aria-label={handlers.createLabel ?? "Create"}
      onClick={() => handlers.createPath && handlers.onNavigate?.(handlers.createPath)}
    >
      <Plus className="h-4 w-4" />
      {handlers.createLabel && <span className="hidden sm:inline">{handlers.createLabel}</span>}
    </Button>
  ),

  sync: (
    <Button variant="outline" onClick={() => handlers.onSync?.()}>
      <RefreshCw />
    </Button>
  ),

  edit: (
    <Button variant="outline" onClick={handlers.onEdit}>
      <Edit />
    </Button>
  ),

  delete: (
    <Button variant="destructive" onClick={handlers.onDelete}>
      <Trash2 />
    </Button>
  ),
});
