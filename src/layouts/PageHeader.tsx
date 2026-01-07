import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { Search } from "lucide-react";
import { useLocation } from "react-router-dom";

type PageHeaderProps = {
  title?: string;
  showSearch?: boolean;
  actions?: React.ReactNode;
};

const PageHeader = ({ title, showSearch, actions }: PageHeaderProps) => {
  const { user } = useAuth();
  const location = useLocation();

  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : "User";

  const isHome = location.pathname === "/";

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b bg-background px-6">
      <SidebarTrigger className="md:hidden"></SidebarTrigger>
      <h1 className="text-lg hidden sm:block font-semibold">
        {isHome ? `Welcome back, ${fullName}!` : title}
      </h1>

      <div className="flex items-center gap-2">
        {showSearch && (
          <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search…" className="pl-9" />
        </div>
        )}
        {actions}
      </div>
    </header>
  );
};

export default PageHeader;
