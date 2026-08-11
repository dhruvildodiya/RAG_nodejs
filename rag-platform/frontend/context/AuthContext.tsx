"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  organizationId: string | null;
  organizationName: string | null;
}

export type WorkspaceScope = "individual" | "org";

interface AuthContextType {
  user: User | null;
  token: string | null;
  scope: WorkspaceScope;
  setScope: (scope: WorkspaceScope) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [scope, setScopeState] = useState<WorkspaceScope>("individual");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("nexus_rag_token");
    const savedUser = localStorage.getItem("nexus_rag_user");
    const savedScope = localStorage.getItem("nexus_rag_scope") as WorkspaceScope;

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("nexus_rag_token");
        localStorage.removeItem("nexus_rag_user");
      }
    }

    if (savedScope === "individual" || savedScope === "org") {
      setScopeState(savedScope);
    }

    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("nexus_rag_token", newToken);
    localStorage.setItem("nexus_rag_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setScopeState("individual");
    localStorage.removeItem("nexus_rag_token");
    localStorage.removeItem("nexus_rag_user");
    localStorage.removeItem("nexus_rag_scope");
  };

  const setScope = (newScope: WorkspaceScope) => {
    setScopeState(newScope);
    localStorage.setItem("nexus_rag_scope", newScope);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        scope,
        setScope,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
