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
} from "@/components/ui/sidebar";
import {
  CheckSquare,
  ChevronUp,
  Command,
  FolderGit2,
  GitBranch,
  Home,
  StickyNote,
  User2,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const AppSidebar = () => {
  const workspaceItems = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: FolderGit2,
    },
    {
      title: "Tasks",
      url: "/tasks",
      icon: CheckSquare,
    },
  ];
  const utilitiesItems = [
    {
      title: "Github ",
      url: "/github",
      icon: GitBranch,
    },
    {
      title: "Notes",
      url: "/notes",
      icon: StickyNote,
    },
    {
      title: "Commands",
      url: "/commands",
      icon: Command,
    },
  ];
  return (
    <Sidebar className="relative h-screen  border-r transition-all duration-300">
      <SidebarHeader
        className="
    px-4 py-6 flex items-center justify-between
    group-data-[state=collapsed]:justify-center
  "
      >
        {" "}
        <Logo
          size="sm"
          className="
    transition-all duration-200
    group-data-[state=collapsed]:hidden
  "
        />
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarMenu>
          <SidebarGroup>
            <SidebarGroupLabel>WORKSPACE</SidebarGroupLabel>
            <SidebarGroupContent>
              {workspaceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>UTILITIES</SidebarGroupLabel>
            <SidebarGroupContent>
              {utilitiesItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 w-full">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> Username
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="
    min-w-(--radix-dropdown-menu-trigger-width)
    w-(--radix-dropdown-menu-trigger-width)
  "
              >
                <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="data-highlighted:bg-destructive
    data-highlighted:text-destructive-foreground"
                >
                  <span>Sign out</span>
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
