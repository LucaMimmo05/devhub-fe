import Logo from "@/assets/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import {
  CheckSquare,
  ChevronUp,
  Command,
  FolderGit2,
  GitBranch,
  Home,
  StickyNote,
  User2,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const workspaceItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Projects", url: "/projects", icon: FolderGit2 },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
];

const utilitiesItems = [
  { title: "Github", url: "/github", icon: GitBranch },
  { title: "Notes", url: "/notes", icon: StickyNote },
  { title: "Commands", url: "/commands", icon: Command },
];

const NavItems = ({ items, onNavigate }: { items: typeof workspaceItems; onNavigate: () => void }) => (
  <>
    {items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild className="h-10 text-sm">
          <NavLink
            to={item.url}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors ${
                isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""
              }`
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.title}</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ))}
  </>
);

const AppSidebar = () => {
  const { logout, user } = useAuth();
  const { isMobile, setOpenMobile } = useSidebar();
  const navigate = useNavigate();

  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const handleLogout = () => {
    closeMobile();
    logout();
  };

  const handleNavigate = (path: string) => {
    closeMobile();
    navigate(path);
  };

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4 flex flex-row items-center justify-between">
        <Logo size="sm" />
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={closeMobile}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-1">
        <SidebarMenu>
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] tracking-widest px-3 mb-1">
              WORKSPACE
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <NavItems items={workspaceItems} onNavigate={closeMobile} />
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-2">
            <SidebarGroupLabel className="text-[10px] tracking-widest px-3 mb-1">
              UTILITIES
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <NavItems items={utilitiesItems} onNavigate={closeMobile} />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-10 w-full flex items-center gap-3 px-3 rounded-md">
                  <User2 className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate text-sm">{user?.username}</span>
                  <ChevronUp className="h-4 w-4 shrink-0 ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-48">
                <DropdownMenuItem onClick={() => handleNavigate("/settings")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
