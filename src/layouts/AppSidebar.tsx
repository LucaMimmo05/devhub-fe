import Logo from "@/assets/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
  SidebarMenuBadge,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import ShortcutHint from "@/components/ui/ShortcutHint";
import { useSidebar } from "@/components/ui/sidebar-context";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/hooks/queries/useProjects";
import { useMyTasks } from "@/hooks/queries/useTasks";
import { useNotes } from "@/hooks/queries/useNotes";
import { useCommands } from "@/hooks/queries/useCommands";
import { differenceInCalendarDays } from "date-fns";
import {
  CheckSquare,
  ChevronsUpDown,
  Command,
  FolderGit2,
  GitBranch,
  Home,
  LogOut,
  Search,
  Settings,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  count?: number;
  /** Shows a red dot next to the count (e.g. overdue tasks). */
  alert?: boolean;
  soon?: boolean;
};

const NavGroup = ({ label, items, onNavigate }: { label: string; items: NavItem[]; onNavigate: () => void }) => {
  const { pathname } = useLocation();
  return (
    <SidebarGroup className="px-0 py-1.5">
      <SidebarGroupLabel className="h-7 px-2 text-[11px] font-medium text-muted-foreground/70">{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {items.map((item) => {
            // Sections stay highlighted on their sub-pages (a project, a note…); Home only on "/".
            const active = item.url === "/" ? pathname === "/" : pathname === item.url || pathname.startsWith(`${item.url}/`);
            return (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild isActive={active} className="h-8 gap-2.5 text-muted-foreground data-[active=true]:text-foreground">
                  <NavLink to={item.url} onClick={onNavigate}>
                    <item.icon className={cn(active && "text-primary")} />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
                {item.soon ? (
                  <SidebarMenuBadge className="right-1.5 rounded border border-border px-1 text-[10px] font-medium text-muted-foreground">
                    Soon
                  </SidebarMenuBadge>
                ) : item.count !== undefined && item.count > 0 ? (
                  <SidebarMenuBadge className="right-1.5 gap-1 text-[11px] text-muted-foreground">
                    {item.alert && <span className="h-1.5 w-1.5 rounded-full bg-red-400" aria-label="Has overdue items" />}
                    {item.count}
                  </SidebarMenuBadge>
                ) : null}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

const AppSidebar = ({ onSearch }: { onSearch: () => void }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { isMobile, setOpenMobile } = useSidebar();

  // Counts come from queries the pages already use, so they're cached and stay in sync.
  const { data: projects } = useProjects();
  const { data: tasks } = useMyTasks();
  const { data: notes } = useNotes();
  const { data: commands } = useCommands();

  const openTasks = tasks?.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS");
  const hasOverdue = !!openTasks?.some((t) => t.dueDate && differenceInCalendarDays(new Date(t.dueDate), new Date()) < 0);

  // In drawer mode, close the drawer once a destination is picked.
  const closeDrawer = () => {
    if (isMobile) setOpenMobile(false);
  };

  const workspace: NavItem[] = [
    { title: "Home", url: "/", icon: Home },
    {
      title: "Projects",
      url: "/projects",
      icon: FolderGit2,
      count: projects?.filter((p) => p.status === "PENDING" || p.status === "IN_PROGRESS").length,
    },
    { title: "Tasks", url: "/tasks", icon: CheckSquare, count: openTasks?.length, alert: hasOverdue },
  ];
  const tools: NavItem[] = [
    { title: "Notes", url: "/notes", icon: StickyNote, count: notes?.length },
    { title: "Commands", url: "/commands", icon: Command, count: commands?.length },
    { title: "GitHub", url: "/github", icon: GitBranch, soon: true },
  ];

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "Account";
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}` || user?.username?.slice(0, 2) || "?";

  return (
    <Sidebar className="fixed h-screen w-52 border-r border-sidebar-border">
      {/* Same height and bottom line as the page header, so the top edge reads as one bar */}
      <SidebarHeader className="h-14 shrink-0 flex-row items-center border-b border-sidebar-border px-4 py-0">
        <Link to="/" onClick={closeDrawer} aria-label="DevHub home" className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Logo size="xs" className="h-auto w-[84px]" />
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-2 pt-3">
        <button
          type="button"
          onClick={() => {
            closeDrawer();
            onSearch();
          }}
          className="mb-1 flex h-8 w-full items-center gap-2 rounded-md border border-sidebar-border bg-background/40 px-2.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-left">Search…</span>
          <ShortcutHint />
        </button>
        <NavGroup label="Workspace" items={workspace} onNavigate={closeDrawer} />
        <NavGroup label="Tools" items={tools} onNavigate={closeDrawer} />
      </SidebarContent>

      <SidebarFooter className="gap-1.5 border-t border-sidebar-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-md p-1.5 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-sidebar-accent">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-8 w-8 shrink-0 rounded-md object-cover" />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-xs font-semibold uppercase text-primary">
                {initials}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium leading-tight">{fullName}</span>
              <span className="block truncate text-xs leading-tight text-muted-foreground">@{user?.username}</span>
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-(--radix-dropdown-menu-trigger-width) min-w-48">
            <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">Signed in as @{user?.username}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NavLink to="/settings" onClick={closeDrawer} className="gap-2">
                <Settings className="h-4 w-4" /> Settings
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                await logout();
                navigate("/auth/login", { replace: true });
              }}
              className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <p className="px-1.5 text-[10px] tracking-wide text-muted-foreground/50">
          Crafted by{" "}
          <a
            href="https://github.com/LucaMimmo05"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-muted-foreground/70 transition-colors hover:text-foreground"
          >
            Luca Mimmo
          </a>{" "}
          × Claude
        </p>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
