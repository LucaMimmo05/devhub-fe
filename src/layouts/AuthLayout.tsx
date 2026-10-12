import Logo from "@/assets/Logo";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AuthShowcase from "@/components/auth/AuthShowcase";
import { useAuth } from "@/context/AuthContext";

// Auth pages that signed-in users can still open
const AUTH_ONLY_PATHS = ["/auth/verify-email", "/auth/forgot-password", "/auth/reset-password"];

const AuthLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { status } = useAuth();
  useEffect(() => {
    if (status === "authenticated" && !AUTH_ONLY_PATHS.includes(location.pathname)) {
      navigate("/", { replace: true });
    }
  }, [status, location.pathname, navigate]);

  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <AuthShowcase />

      <div className="flex min-h-dvh flex-col px-5 py-6 sm:px-10">
        <header className="flex items-center lg:hidden">
          <Link to="/auth/login" aria-label="DevHub">
            <Logo size="xs" className="h-auto w-24" />
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center py-10">
          {/* Keyed by path so each page fades in on navigation */}
          <div key={location.pathname} className="w-full max-w-[400px] motion-safe:animate-[rise-in_0.3s_ease-out]">
            <Outlet />
          </div>
        </div>

        <footer className="text-center text-xs text-muted-foreground/70">
          DevHub · your projects, tasks and notes in one place
        </footer>
      </div>
    </main>
  );
};

export default AuthLayout;
