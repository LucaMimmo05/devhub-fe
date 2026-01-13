import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";
import { Plus, RefreshCw, ChevronDown, Trash2, Edit } from "lucide-react";

interface HeaderActionsHandlers {
  onCreateProject?: () => void;
  onCreateTask?: () => void;
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
        <Button>
          Create New <ChevronDown className="ml-1" size={16} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handlers.onCreateProject?.()}>
          Project
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlers.onCreateTask?.()}>
          Task
        </DropdownMenuItem>
        <DropdownMenuItem>Command</DropdownMenuItem>
        <DropdownMenuItem>Note</DropdownMenuItem>
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

