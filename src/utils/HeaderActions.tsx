import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";
import { Plus, Filter, RefreshCw, ChevronDown, Trash2, Edit } from "lucide-react";

export const HEADER_ACTIONS: Record<string, React.ReactNode> = {
  addDropdown: (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default">
          Create New <ChevronDown className="ml-1" size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Project</DropdownMenuItem>
        <DropdownMenuItem>Task</DropdownMenuItem>
        <DropdownMenuItem>Command</DropdownMenuItem>
        <DropdownMenuItem>Note</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  add: (
    <Button>
      <Plus />
    </Button>
  ),
  filter: (
    <Button variant="outline">
      <Filter />
    </Button>
  ),
  sync: (
    <Button variant="outline">
      <RefreshCw />
    </Button>
  ),
  edit: (
    <Button variant="outline">
      <Edit/>
    </Button>
  ),
  delete: (
    <Button variant="destructive">
        <Trash2/>
    </Button>
  ),
};
