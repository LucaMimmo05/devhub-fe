import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Search } from "lucide-react";

type PageHeaderProps = {
  title?: string;
  actions?: React.ReactNode;
};

const PageHeader = ({ title, actions }: PageHeaderProps) => {
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b bg-background px-6">
      <SidebarTrigger className="md:hidden">
      </SidebarTrigger>
      <h1 className="text-lg font-semibold">{title}</h1>

      <div className="flex items-center gap-2">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search…" className="pl-9" />
        </div>
        {actions}
      </div>
    </header>
  );
};

export default PageHeader;
