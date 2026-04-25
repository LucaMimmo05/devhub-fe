import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";
import { Plus, RefreshCw, ChevronDown, Trash2, Edit, FolderGit2, CheckSquare, FileText, Terminal } from "lucide-react";

interface HeaderActionsHandlers {
  onCreateProject?: () => void;
  onCreateTask?: () => void;
  onSync?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onNavigate?: (path: string) => void;
}

export const getHeaderActions = (
  handlers: HeaderActionsHandlers
): Record<string, React.ReactNode> => ({
  addDropdown: (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>
          Create New <ChevronDown className="ml-1" size={16} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handlers.onNavigate?.("/projects")}>
          <FolderGit2 className="mr-2 h-4 w-4" />
          Project
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlers.onNavigate?.("/tasks")}>
          <CheckSquare className="mr-2 h-4 w-4" />
          Task
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlers.onNavigate?.("/notes")}>
          <FileText className="mr-2 h-4 w-4" />
          Note
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlers.onNavigate?.("/commands")}>
          <Terminal className="mr-2 h-4 w-4" />
          Command
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),

  add: (
    <Button onClick={handlers.onCreateProject}>
      <Plus />
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
