"use client";

import { useAuth } from "@/app/context/AuthContext";
import Spinner from "@/app/components/Spinner";

export default function AuthGate({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <Spinner size="lg" variant="dark" />
      </div>
    );
  }

  return children;
}
