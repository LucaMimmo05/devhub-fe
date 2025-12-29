import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
const AppLayout = () => {
  return (
    <div className="flex min-h-screen overflow-x-hidden">
   <Sidebar />
      <main className="flex-1">
        <Outlet/>
      </main>
    </div>
  )
}

export default AppLayout