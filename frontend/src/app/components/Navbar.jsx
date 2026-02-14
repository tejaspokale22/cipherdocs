"use client";

import Link from "next/link";
import { Home, LayoutDashboard } from "lucide-react";
import ConnectWallet from "./ConnectWallet";
import Logo from "./Logo";
import { useAuth } from "@/app/context/AuthContext";
import { useMediaQuery } from "react-responsive";

import { useState } from "react";

export default function Navbar() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const isTablet = useMediaQuery({ maxWidth: 1023 });
  const dashboardHref =
    user?.role === "issuer" ? "/issuer-dashboard" : "/user-dashboard";

  // Navigation links config
  const navLinks = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      show: true,
    },
    {
      href: dashboardHref,
      label: "Dashboard",
      icon: LayoutDashboard,
      show: !!user,
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-black text-white w-full">
      <nav className="mx-auto flex h-16 items-center justify-between px-3 sm:px-4 md:px-8 lg:px-20 xl:px-36 max-w-full">
        <Logo size={isTablet ? 130 : 170} variant="light" />
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks
            .filter((l) => l.show)
            .map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors px-2 py-1 rounded"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          <ConnectWallet />
        </div>
        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center p-1 focus:outline-none"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>
      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out bg-black/95 text-white w-full shadow-lg overflow-hidden ${
          menuOpen
            ? "max-h-96 opacity-100"
            : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-1 px-3 pt-2 pb-4">
          {navLinks
            .filter((l) => l.show)
            .map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2 text-base text-white/80 hover:text-white transition-colors px-2 py-2 rounded"
                onClick={() => setMenuOpen(false)}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
          <div className="mt-2">
            <ConnectWallet />
          </div>
        </div>
      </div>
    </header>
  );
}
