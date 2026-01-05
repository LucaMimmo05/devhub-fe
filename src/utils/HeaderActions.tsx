import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";
import { Plus, Filter, RefreshCw } from "lucide-react";

export const HEADER_ACTIONS: Record<string, React.ReactNode> = {
  addDropdown: (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Plus />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>New Project</DropdownMenuItem>
        <DropdownMenuItem>New Task</DropdownMenuItem>
        <DropdownMenuItem>New Command</DropdownMenuItem>
        <DropdownMenuItem>New Note</DropdownMenuItem>
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
};
