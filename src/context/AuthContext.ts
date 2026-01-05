import { createContext, useContext } from "react";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

 export type AuthContextValue = {
  status: AuthStatus;
  isAuthenticated: boolean;
  user: null | User;
  refreshAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export type User = {
  id: number;
  fullName: string;
  email: string;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve essere utilizzato all'interno di un AuthProvider");
  }

  return context;
};
