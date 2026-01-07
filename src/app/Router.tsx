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
import ProjectDetails from "@/pages/ProjectDetails/ProjectDetails";
import { projectMock } from "@/mock/dashboard-mock";

export type RouteHandle<TData = unknown> = {
  title?: string | ((params: Record<string, string>, data?: TData) => string);
  header?: {
    showSearch?: boolean;
    actions?: string[];
  };
};

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
          header: { showSearch: true, actions: ["addDropdown"] },
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
        path: "projects/:projectId",
        element: <ProjectDetails />,
        loader: async ({ params }) => {
          const project = projectMock.find(
            (p) => p.id.toString() === params.projectId
          );
          if (!project) throw new Response("Not Found", { status: 404 });
          return { project };
        },
        handle: {
          title: (params, data) => data?.project?.name || "Project",
          header: { showSearch: false, actions: ["edit", "delete"] },
        } satisfies RouteHandle<{
          project: { id: number; name: string; description: string };
        }>,
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
