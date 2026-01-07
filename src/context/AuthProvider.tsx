import {
  refresh,
  login as loginService,
  logout as logoutService,
} from "@/services/authService";
import axios from "axios";
import { useEffect, useState, useRef, type ReactNode } from "react";
import {
  AuthContext,
  type AuthContextValue,
  type AuthStatus,
  type User,
} from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<null | User>(null);
  const initialized = useRef(false);

  const login = async (email: string, password: string) => {
    setStatus("loading");
    try {
      const data = await loginService(email, password);

      localStorage.setItem("accessToken", data.accessToken);

      if (data.userProfile) {
        localStorage.setItem("userData", JSON.stringify(data.userProfile));
        setUser(JSON.parse(JSON.stringify(data.userProfile)));
      }

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${data.accessToken}`;

      setStatus("authenticated");
    } catch (error) {
      setStatus("unauthenticated");
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch (error) {
      console.error("Logout backend failed:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");

      delete axios.defaults.headers.common["Authorization"];

      setUser(null);
      setStatus("unauthenticated");
    }
  };

  const refreshAuth = async () => {
    const storedUser = localStorage.getItem("userData");

    try {
      const refreshData = await refresh();

      localStorage.setItem("accessToken", refreshData.accessToken);

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${refreshData.accessToken}`;

      if (refreshData.userProfile) {
        setUser(refreshData.userProfile);
        localStorage.setItem(
          "userData",
          JSON.stringify(refreshData.userProfile)
        );
      } else if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setStatus("authenticated");
    } catch (error) {
      setStatus("unauthenticated");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
      console.error("Token refresh failed:", error);
    }
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let isMounted = true;

    const init = async () => {
      if (!isMounted) return;

      await refreshAuth();
      
    };
    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const contextValue: AuthContextValue = {
    status,
    isAuthenticated: status === "authenticated",
    user,
    refreshAuth,
    login,
    logout,
  };
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
