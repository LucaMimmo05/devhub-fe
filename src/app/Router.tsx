import { createBrowserRouter } from "react-router-dom";

import AppLayout from "@/layouts/AppLayout";
import AuthLayout from "@/layouts/AuthLayout";
import PrivateRoute from "@/utils/PrivateRoute";

import Dashboard from "@/pages/Dashboard/Dashboard";
import Projects from "@/pages/Projects/Projects";
import Tasks from "@/pages/Tasks/Tasks";
import Github from "@/pages/Github/Github";
import Notes from "@/pages/Notes/Notes";
import Commands from "@/pages/Commands/Commands";
import Settings from "@/pages/Settings/Settings";

import Login from "@/pages/Authentication/Login";
import Register from "@/pages/Authentication/Register";
import NotFound from "@/pages/NotFound/NotFound";
export type RouteHandle = {
  title?: string;
  header?: {
    showSearch?: boolean;
    actions?: string[];
  };
};

const userDataString = localStorage.getItem("userData");
const userData = userDataString ? JSON.parse(userDataString) : null;
const fullName = userData?.firstName + " " + userData?.lastName || "User";

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/auth/login", element: <Login /> },
      { path: "/auth/register", element: <Register /> },
    ],
  },
  {
    element: (
      <PrivateRoute>
        <AppLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
        handle: {
          title: `Welcome back ${fullName}!`,
          header: { showSearch: false },
        } satisfies RouteHandle,
      },
      {
        path: "projects",
        element: <Projects />,
        handle: {
          title: "Projects",
          header: { showSearch: true, actions: ["add", "filter"] },
        } satisfies RouteHandle,
      },
      {
        path: "tasks",
        element: <Tasks />,
        handle: {
          title: "Tasks",
          header: { showSearch: true, actions: ["add"] },
        } satisfies RouteHandle,
      },
      {
        path: "github",
        element: <Github />,
        handle: {
          title: "GitHub",
          header: { actions: ["sync"] },
        } satisfies RouteHandle,
      },
      {
        path: "notes",
        element: <Notes />,
        handle: {
          title: "Notes",
          header: { showSearch: true, actions: ["add"] },
        } satisfies RouteHandle,
      },
      {
        path: "commands",
        element: <Commands />,
        handle: {
          title: "Commands",
        } satisfies RouteHandle,
      },
      {
        path: "settings",
        element: <Settings />,
        handle: {
          title: "Settings",
        } satisfies RouteHandle,
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

export default router;
