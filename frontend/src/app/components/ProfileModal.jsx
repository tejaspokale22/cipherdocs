"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { LayoutDashboard, LogOut, Copy, Check } from "lucide-react";
import { useState } from "react";
import { logout } from "@/app/lib/authApi";
import { useAuth } from "@/app/context/AuthContext";

export default function ProfileModal({ user, onClose }) {
  const router = useRouter();
  const { setUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const isIssuer = user?.role === "issuer";

  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
      toast.success("logged out");
      onClose?.();
      router.push("/");
    } catch (error) {
      toast.error("failed to sign out");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(user?.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("failed to copy");
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-white border border-black/10 shadow-xl overflow-hidden z-50">
      {/* Header with user info */}
      <div className="px-4 pt-4 pb-3 border-b border-black/10">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center text-base font-semibold bg-black text-white`}
          >
            {isIssuer ? "I" : "U"}
          </div>
          <div>
            <p className="font-semibold text-black">{user?.username}</p>
            <span className="text-xs text-black/50">
              {isIssuer ? "Issuer Account" : "User Account"}
            </span>
          </div>
        </div>
      </div>

      {/* Wallet Address */}
      <div className="px-4 py-3 border-b border-black/10">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-medium text-black/50">Wallet Address</p>
          <button
            onClick={handleCopy}
            className="text-xs text-black/50 hover:text-black flex items-center gap-1 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-black font-mono bg-black/5 px-3 py-2 rounded-lg break-all leading-relaxed">
          {user?.walletAddress}
        </p>
      </div>

      {/* Actions */}
      <div className="p-2">
        <Link
          href={isIssuer ? "/issuer-dashboard" : "/user-dashboard"}
          onClick={onClose}
          className="flex items-center gap-3 w-full py-2.5 px-3 text-sm text-black font-medium hover:bg-black/5 rounded-lg transition-colors"
        >
          <LayoutDashboard className="h-4 w-4 text-black/60" />
          Dashboard
        </Link>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full py-2.5 px-3 text-sm text-red-500 font-medium hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
