import ShortcutHint from "@/components/ui/ShortcutHint";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { Search } from "lucide-react";
import { useLocation } from "react-router-dom";

type PageHeaderProps = {
  title?: string;
  showSearch?: boolean;
  actions?: React.ReactNode;
  handleClick: () => void;
  isSearching: boolean;
};

const PageHeader = ({
  title,
  showSearch,
  actions,
  handleClick,
  isSearching,
}: PageHeaderProps) => {
  const { user } = useAuth();
  const location = useLocation();

  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : "User";

  const isHome = location.pathname === "/";

  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between md:justify-end lg:justify-between border-b bg-background px-3 sm:px-4 md:px-6">
      <SidebarTrigger className="md:hidden"></SidebarTrigger>
      <h1 className="text-lg hidden lg:block font-semibold">
        {isHome ? `Welcome back, ${fullName}!` : title}
      </h1>

      <div className="flex items-center gap-2">
        {showSearch && !isSearching && (
          <button
            onClick={handleClick}
            className="flex items-center gap-2 h-9 rounded-lg border border-border bg-muted/40 hover:bg-muted transition-colors px-3 text-sm text-muted-foreground md:w-56 w-9 justify-center md:justify-start"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden md:inline flex-1 text-left">Search…</span>
            <ShortcutHint />
          </button>
        )}
        {actions}
      </div>
    </header>
  );
};

export default PageHeader;
