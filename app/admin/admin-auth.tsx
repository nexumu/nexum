"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ADMIN_STORAGE_KEY = "admin-auth";
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

type AdminAuthContextValue = {
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) =>
    | { ok: true }
    | { ok: false; error: string };
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(ADMIN_STORAGE_KEY);
    setIsAdmin(stored === "true");
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string) => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      window.localStorage.setItem(ADMIN_STORAGE_KEY, "true");
      return { ok: true } as const;
    }

    setIsAdmin(false);
    window.localStorage.removeItem(ADMIN_STORAGE_KEY);
    return { ok: false, error: "Usuario o contraseña inválidos." } as const;
  };

  const logout = () => {
    setIsAdmin(false);
    window.localStorage.removeItem(ADMIN_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({ isAdmin, isLoading, login, logout }),
    [isAdmin, isLoading]
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}

export const adminCredentials = {
  username: ADMIN_USERNAME,
  password: ADMIN_PASSWORD,
};
