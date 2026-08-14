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
import VerifyEmail from "@/pages/Authentication/VerifyEmail";
import ForgotPassword from "@/pages/Authentication/ForgotPassword";
import ResetPassword from "@/pages/Authentication/ResetPassword";
import NotFound from "@/pages/NotFound/NotFound";
import ProjectDetails from "@/pages/ProjectDetails/ProjectDetails";
import { projectDetailsLoader } from "@/pages/ProjectDetails/projectDetailsUtils";
import NewProject from "@/pages/Projects/NewProject";
import NewNote from "@/pages/Notes/NewNote";
import NewCommand from "@/pages/Commands/NewCommand";
import NewTask from "@/pages/ProjectDetails/NewTask";

export type RouteHandle<TData = unknown> = {
  title?: string | ((params: Record<string, string>, data?: TData) => string);
  header?: {
    showSearch?: boolean;
    actions?: string[];
    /** Path the "add" header action navigates to. */
    createPath?: string;
  };
};

const router = createBrowserRouter([
  {
    path:"/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "verify-email", element: <VerifyEmail /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
    ],
  },
  {
    path: "/",
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
          header: { showSearch: true, actions: ["addDropdown"] },
        } satisfies RouteHandle,
      },
      {
        path: "projects",
        element: <Projects />,
        handle: {
          title: "Projects",
          header: { showSearch: true, actions: ["add"], createPath: "/projects/new" },
        } satisfies RouteHandle,
      },
      {
        path: "projects/:projectId",
        element: <ProjectDetails />,
        loader: async (args) => {
          return projectDetailsLoader(args);
        },
        handle: {
          title: "Overview",
          header: {
            showSearch: false,
            actions: [],
          },
        } satisfies RouteHandle<{
          project: { id: number; name: string; description: string };
        }>,
      },
      {
        path: "tasks",
        element: <Tasks />,
        handle: {
          title: "Personal Tasks",
          header: { showSearch: true },
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
          header: { showSearch: true, actions: ["add"], createPath: "/notes/new" },
        } satisfies RouteHandle,
      },
      {
        path: "commands",
        element: <Commands />,
        handle: {
          title: "Commands",
          header: { showSearch: true, actions: ["add"], createPath: "/commands/new" },
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
  {
    path: "projects/new",
    element: (
      <PrivateRoute>
        <NewProject />
      </PrivateRoute>
    ),
  },
  {
    path: "notes/new",
    element: (
      <PrivateRoute>
        <NewNote />
      </PrivateRoute>
    ),
  },
  {
    path: "commands/new",
    element: (
      <PrivateRoute>
        <NewCommand />
      </PrivateRoute>
    ),
  },
  {
    path: "projects/:projectId/tasks/new",
    element: (
      <PrivateRoute>
        <NewTask />
      </PrivateRoute>
    ),
  },
  { path: "*", element: <NotFound /> },
]);

export default router;
