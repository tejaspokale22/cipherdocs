"use client";

import Image from "next/image";
import { Shield, Database, QrCode } from "lucide-react";
import heroImage from "../../../public/hero.png";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";
import { lazy, useState } from "react";

export default function Hero() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const handleLoad = () => {
    // keep skeleton visible for at least 800ms
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  return (
    <section className="bg-white text-black min-h-screen flex items-center md:pt-16 pt-10">
      <div className="mx-auto flex w-full max-w-[90vw] flex-col items-center gap-20 px-4 sm:px-10 lg:flex-row lg:items-center lg:px-12">
        {/* Left Content */}
        <div className="flex-1 space-y-4 text-left">
          <h1 className="text-3xl font-semibold leading-[1.15] tracking-tight sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">
            Trust any document with cipherdocs.
          </h1>

          <p className="max-w-md text-sm leading-relaxed text-black/60 lg:text-base">
            Issue & verify official and critical documents with blockchain
            integrity, cryptographic hashing and instant QR-based verification.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-xl bg-black/5 px-3 py-2 sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white sm:h-10 sm:w-10 sm:rounded-xl">
                <Shield className="h-4 w-4 text-black/40 sm:h-5 sm:w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-black sm:text-base">
                  Immutable Document Issuance
                </p>
                <p className="text-xs text-black/40 sm:text-sm">
                  Secured on Polygon network
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-black/5 px-3 py-2 sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white sm:h-10 sm:w-10 sm:rounded-xl">
                <Database className="h-4 w-4 text-black/40 sm:h-5 sm:w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-black sm:text-base">
                  Decentralized Encrypted Storage
                </p>
                <p className="text-xs text-black/40 sm:text-sm">
                  Stored securely on IPFS
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-black/5 px-3 py-2 sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white sm:h-10 sm:w-10 sm:rounded-xl">
                <QrCode className="h-4 w-4 text-black/40 sm:h-5 sm:w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-black sm:text-base">
                  Instant Document Verification
                </p>
                <p className="text-xs text-black/40 sm:text-sm">
                  Verify authenticity in seconds
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:flex-wrap justify-start">
            <button
              className="cursor-pointer rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-black/80 sm:px-7 sm:py-4 sm:text-base"
              onClick={() => {
                if (user) {
                  if (user.role === "issuer") {
                    router.push("/issuer-dashboard");
                  } else {
                    toast.error("Only issuers can issue certificates.");
                  }
                } else toast.error("Please connect your wallet to continue.");
              }}
            >
              Issue Certificate
            </button>
            <button
              className="cursor-pointer rounded-lg bg-black/10 px-5 py-3 text-sm font-medium text-black hover:bg-black/15 sm:px-7 sm:py-4 sm:text-base"
              onClick={() => router.push("/verify")}
            >
              Verify Certificate
            </button>
          </div>
        </div>

        <div className="hidden xl:flex lg:flex-[1.5] lg:justify-end">
          <div className="relative w-full overflow-hidden rounded-3xl">
            {/* Skeleton Loader */}
            {loading && (
              <div className="absolute inset-0 bg-gray-300">
                <div className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-white/70 to-transparent"></div>
              </div>
            )}

            {/* Image */}
            <Image
              src={heroImage}
              alt="Blockchain-based document verification"
              className={`relative h-auto w-full rounded-3xl transition-opacity duration-500 ${
                loading ? "opacity-0" : "opacity-100"
              }`}
              priority
              onLoadingComplete={handleLoad}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
