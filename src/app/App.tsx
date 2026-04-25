import { RouterProvider } from "react-router-dom";
import router from "./Router";
import { AuthProvider } from "@/context/AuthProvider";
import { BackendWakeupBanner } from "@/components/ui/BackendWakeupBanner";
import { Toaster } from "sonner";

 const App = () => {
  return (
    <AuthProvider>
      <BackendWakeupBanner />
      <Toaster richColors position="top-right" />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
