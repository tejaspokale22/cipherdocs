"use client";

import { useAuth } from "@/app/context/AuthContext";

export default function AuthGate({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          zIndex: 50,
        }}
      >
        <span
          style={{
            fontSize: "2.6rem",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "#111827",
            background:
              "linear-gradient(90deg, #111827 25%, #9ca3af 50%, #111827 75%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "shimmer 2s ease-in-out infinite",
          }}
        >
          cipherdocs.
        </span>

        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% center; }
            100% { background-position: -200% center; }
          }
        `}</style>
      </div>
    );
  }

  return children;
}
