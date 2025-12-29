import { createContext, type ReactNode } from "react";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
    status: AuthStatus;
    isAuthenticated: boolean;
    refreshAuth: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {

    //TODO implement auth provider logic
  return (
    <AuthContext.Provider value={null}>{children}</AuthContext.Provider>
  )
  
}