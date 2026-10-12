import { Outlet, useMatches, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import PageHeader from "./PageHeader";
import type { RouteHandle } from "@/app/Router";
import { getHeaderActions } from "@/utils/HeaderActions";
import { useEffect, useState } from "react";
import SearchCommand from "@/components/ui/SearchCommand";

type CurrentMatch<TData = unknown> = {
  handle?: RouteHandle<TData>;
  data?: TData;
  params: Record<string, string>;
};

const AppLayout = () => {
  const navigate = useNavigate();

  const matches = useMatches() as CurrentMatch<{
    project?: { name: string };
  }>[];
  const current = matches[matches.length - 1];
  const handle = current?.handle as RouteHandle | undefined;
  const headerActions = getHeaderActions({
    onNavigate: (path) => navigate(path),
    createPath: handle?.header?.createPath,
    createLabel: handle?.header?.createLabel,
  });

  const actionIds = handle?.header?.actions ?? [];
  const actions = actionIds.map((id) => headerActions[id]).filter(Boolean);

  let title = "";
  if (current?.handle?.title) {
    title =
      typeof current.handle.title === "function"
        ? current.handle.title(current.params, current.data)
        : current.handle.title;
  }
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      if (isCtrlOrCmd && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsSearching((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <aside className="hidden w-52 shrink-0 lg:block">
          <AppSidebar onSearch={() => setIsSearching(true)} />
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <PageHeader
            title={title}
            showSearch={handle?.header?.showSearch}
            actions={actions}
            handleClick={() => setIsSearching(true)}
            isSearching={isSearching}
          />

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </div>


          {isSearching && (
            <SearchCommand onClose={() => setIsSearching(false)} />
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
