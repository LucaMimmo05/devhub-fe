import { Input } from "@/components/ui/input";
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
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between md:justify-end lg:justify-between border-b bg-background px-6">
      <SidebarTrigger className="md:hidden"></SidebarTrigger>
      <h1 className="text-lg hidden lg:block font-semibold">
        {isHome ? `Welcome back, ${fullName}!` : title}
      </h1>

      <div className="flex items-center gap-2">
        {showSearch && !isSearching && (
          <div
            className="relative md:w-64 w-9 h-9 md:h-auto flex items-center justify-center md:block cursor-pointer hover:bg-muted/50 rounded-md md:hover:bg-transparent transition-colors"
            onClick={handleClick}
          >
            <Search className="md:absolute md:left-3 md:top-1/2 h-4 w-4 md:-translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search…"
              className="pl-9 md:block hidden cursor-pointer"
              readOnly
            />
            <div className="hidden md:block">
              <ShortcutHint />
            </div>
          </div>
        )}
        {actions}
      </div>
    </header>
  );
};

export default PageHeader;
