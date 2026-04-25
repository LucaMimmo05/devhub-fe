import Logo from "@/assets/Logo";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import PageContainer from "./PageContainer";
import AuthHero from "@/pages/Authentication/AuthHero";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

// Pagine auth accessibili anche da utenti autenticati
const AUTH_ONLY_PATHS = ["/auth/verify-email", "/auth/forgot-password", "/auth/reset-password"];

const AuthLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { status } = useAuth();
  useEffect(() => {
    if (status === "authenticated" && !AUTH_ONLY_PATHS.includes(location.pathname)) {
      navigate("/", { replace: true });
    }
  }, [status, location.pathname]);

  return (
    <PageContainer className="py-6 min-h-screen flex relative flex-row items-center justify-center xl:gap-64 md:gap-20 lg:gap-32 ">
      <Logo size="sm" className="absolute top-6 left-4 sm:left-6 lg:left-8" />
      <AuthHero />

      <Outlet />
    </PageContainer>
  );
};

export default AuthLayout;
