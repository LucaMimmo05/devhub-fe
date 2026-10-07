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
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between gap-3 border-b bg-background px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="-ml-1 shrink-0 lg:hidden" />
        <h1 className="truncate text-base font-semibold sm:text-lg">
          {isHome ? (
            <>
              <span className="hidden sm:inline">Welcome back, {fullName}!</span>
              <span className="sm:hidden">Home</span>
            </>
          ) : (
            title
          )}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {showSearch && !isSearching && (
          <button
            onClick={handleClick}
            aria-label="Search"
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
