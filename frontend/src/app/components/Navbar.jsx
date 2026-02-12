"use client";

import Link from "next/link";
import { Home, LayoutDashboard } from "lucide-react";
import ConnectWallet from "./ConnectWallet";
import Logo from "./Logo";
import { useAuth } from "@/app/context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();
  const dashboardHref =
    user?.role === "issuer" ? "/issuer-dashboard" : "/user-dashboard";

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-black text-white">
      <nav className="mx-auto flex h-16 items-center justify-between px-6 md:px-20 lg:px-36">
        <Logo size={180} variant="light" />
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          {user && (
            <Link
              href={dashboardHref}
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          )}
          <ConnectWallet />
        </div>
      </nav>
    </header>
  );
}
