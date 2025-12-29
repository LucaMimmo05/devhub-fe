import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen overflow-x-hidden">
        <AppSidebar />
        <header className="flex h-14 items-center gap-4 px-4 md:hidden">
          <SidebarTrigger />
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
