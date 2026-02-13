"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSession } from "@/app/lib/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const start = Date.now();

      try {
        const data = await getSession();
        setUser(data);
      } catch {
        setUser(null);
      }

      const minimumDuration = 700; // 1 second
      const elapsed = Date.now() - start;

      if (elapsed < minimumDuration) {
        await new Promise((resolve) =>
          setTimeout(resolve, minimumDuration - elapsed),
        );
      }

      setLoading(false);
    }

    loadSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
