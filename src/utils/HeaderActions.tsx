import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Plus, RefreshCw, ChevronDown, Trash2, Edit, Ellipsis } from "lucide-react";

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

  editProjectDropdown: (
    <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="p-3" variant={"outline"}>
              <Ellipsis size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Manage Project</DropdownMenuLabel>
            <DropdownMenuSeparator/>
            <DropdownMenuGroup>
              <DropdownMenuItem>Rename Project</DropdownMenuItem>
              <DropdownMenuItem>Project Settings</DropdownMenuItem>
              <DropdownMenuItem>Manage members</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem >
                Archive Project
              </DropdownMenuItem>
              <DropdownMenuItem >
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
  ),
  add: (
    <Button>
      <Plus />
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
