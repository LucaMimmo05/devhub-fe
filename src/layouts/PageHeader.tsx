import { SidebarTrigger } from "@/components/ui/sidebar";
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
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="sticky top-0 z-20 flex h-14 w-full shrink-0 items-center justify-between gap-3 border-b border-sidebar-border bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="-ml-1 shrink-0 lg:hidden" />
        <h1 className="truncate text-sm font-semibold sm:text-base">
          {isHome ? "Home" : title}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* On desktop search lives in the sidebar; phones get an icon here since the sidebar is a drawer */}
        {showSearch && !isSearching && (
          <button
            onClick={handleClick}
            aria-label="Search"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted lg:hidden"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        )}
        {actions}
      </div>
    </header>
  );
};

export default PageHeader;
