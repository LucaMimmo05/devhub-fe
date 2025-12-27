import { Outlet, useLocation } from "react-router-dom"
import Sidebar from "./Sidebar"
const AppLayout = () => {
  const {pathname} = useLocation();
    const hideSidebar = pathname.startsWith("/auth");
  return (
    <div className="flex min-h-screen overflow-x-hidden">
      {!hideSidebar && <Sidebar />}
      <main className="flex-1">
        <Outlet/>
      </main>
    </div>
  )
}

export default AppLayout