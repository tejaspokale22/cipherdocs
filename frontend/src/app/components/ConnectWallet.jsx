"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import metamaskIcon from "../../../public/metamask.svg";
import { requestNonce, verifyUser } from "@/app/lib/authApi";
import { useAuth } from "@/app/context/AuthContext";
import Spinner from "./Spinner";
import Profile from "./Profile";

export default function ConnectWalletButton() {
  const router = useRouter();
  const { user, loading: authLoading, setUser } = useAuth();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    if (connecting) return;

    try {
      if (!window.ethereum) {
        toast.error("metamask not installed");
        return;
      }

      setConnecting(true);
      toast.loading("connecting wallet...", { id: "wallet" });

      // request wallet connection
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const address = accounts[0];

      // get nonce + new user info
      const { nonce, isNewUser } = await requestNonce(address);

      // sign message
      const message = `Login to CipherDocs: ${nonce}`;
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, address],
      });

      if (isNewUser) {
        // store temporary auth info for registration page
        sessionStorage.setItem(
          "tempAuth",
          JSON.stringify({ walletAddress: address, signature }),
        );

        toast.success("wallet connected", { id: "wallet" });
        router.push("/register");
        return;
      }

      // existing user → verify and login
      const data = await verifyUser({
        walletAddress: address,
        signature,
      });

      setUser(data); // update global auth state
      toast.success("Logged in successfully", { id: "wallet" });

      // redirect based on role
      if (data.role === "issuer") {
        router.push("/issuer-dashboard");
      } else {
        router.push("/user-dashboard");
      }
    } catch (error) {
      console.error(error);
      toast.error("authentication failed", { id: "wallet" });
    } finally {
      setConnecting(false);
    }
  };

  // Show spinner while checking auth state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center w-35 h-10">
        <Spinner size="sm" variant="light" />
      </div>
    );
  }

  // Authenticated user - show profile button
  if (user) {
    return <Profile user={user} />;
  }

  // Not authenticated - show connect wallet button
  return (
    <button
      onClick={handleConnect}
      disabled={connecting}
      className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-base font-semibold text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
    >
      <Image src={metamaskIcon} alt="MetaMask" width={20} height={20} />
      {connecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
