import { RouterProvider } from "react-router-dom";
import router from "./Router";
import { AuthProvider } from "@/context/AuthProvider";

 const App = () => {
  return (
    <AuthProvider>
    <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
