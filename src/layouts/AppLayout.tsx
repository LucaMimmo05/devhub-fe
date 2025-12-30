import { Outlet, useMatches } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import PageHeader from "./PageHeader";
import type { RouteHandle } from "@/app/Router";
import { HEADER_ACTIONS } from "@/utils/HeaderActions";

const AppLayout = () => {
  const matches = useMatches();
  const current = matches[matches.length - 1];

  const handle = current?.handle as RouteHandle | undefined;
  const actionIds = handle?.header?.actions ?? [];
  const actions = actionIds.map((id) => HEADER_ACTIONS[id]).filter(Boolean);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <aside className="hidden md:block w-48 shrink-0">
          <AppSidebar />
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <PageHeader title={handle?.title} actions={actions} />
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
