import { createBrowserRouter } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import Dashboard from "@/pages/Dashboard/Dashboard";
import Authentication from "@/pages/Authentication/Authentication";
import Projects from "@/pages/Projects/Projects";
import Tasks from "@/pages/Tasks/Tasks";
import Notes from "@/pages/Notes/Notes";
import Commands from "@/pages/Commands/Commands";
import Settings from "@/pages/Settings/Settings";
import PrivateRoute from "@/utils/PrivateRoute";



const Router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
      },
      {
        path: "/projects",
        element: (
          <PrivateRoute>
            <Projects />
          </PrivateRoute>
        ),
      },
      {
        path: "/tasks",
        element: (
          <PrivateRoute>
            <Tasks />
          </PrivateRoute>
        ),
      },
      {
        path: "/notes",
        element: (
          <PrivateRoute>
            <Notes />
          </PrivateRoute>
        ),
      },
      {
        path: "/commands",
        element: (
          <PrivateRoute>
            <Commands />
          </PrivateRoute>
        ),
      },
      {
        path: "/settings",
        element: (
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "/auth",
    element: <Authentication />,
  },
]);
export default Router;