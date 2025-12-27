import type { ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import Dashboard from "@/pages/Dashboard/Dashboard";
import Authentication from "@/pages/Authentication/Authentication";
import Projects from "@/pages/Projects/Projects";
import Tasks from "@/pages/Tasks/Tasks";
import Notes from "@/pages/Notes/Notes";
import Commands from "@/pages/Commands/Commands";
import Settings from "@/pages/Settings/Settings";



type AppRoutes = {
    path: string;
    label: string;
    element: ReactNode;
};

 const routes: AppRoutes[] = [
    {
        path: "/",
        label: "Dashboard",
        element: <Dashboard />,
    },
    {
        path: "/auth",
        label: "Authentication",
        element: <Authentication />,
    },
    {
        path: "/projects",
        label: "Projects",
        element: <Projects />,
    },
    {
        path: "/tasks",
        label: "Tasks",
        element: <Tasks />,
    },
    {
        path: "/notes",
        label: "Notes",
        element: <Notes />,
    },
    {
        path: "/commands",
        label: "Commands",
        element: <Commands />,
    },
    {
        path: "/settings",
        label: "Settings",
        element: <Settings />,
    },
];
  const Router = createBrowserRouter([
    {
        element: <AppLayout/>,
        children: routes.map((route) => ({
            path: route.path,
            element: route.element,
        }))
    }
  ])






export default Router;
