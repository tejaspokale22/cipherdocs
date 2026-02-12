import Image from "next/image";
import { Shield, Database, QrCode } from "lucide-react";
import heroImage from "../../../public/hero.png";

export default function Hero() {
  return (
    <section className="bg-white text-black min-h-screen flex items-center pt-20 md:pt-16">
      <div className="mx-auto flex w-full max-w-[90vw] flex-col items-center gap-6 px-4 sm:px-10 lg:flex-row lg:items-center lg:px-10">
        {/* Left Content */}
        <div className="flex-1 space-y-4 text-center lg:text-left">
          <h1 className="text-3xl font-semibold leading-[1.15] tracking-tight sm:text-4xl md:text-4xl lg:text-5xl">
            Trust any document with cipherdocs
            <span className="text-green-500">.</span>
          </h1>

          <p className="mx-auto max-w-md text-sm leading-relaxed text-black/60 sm:text-base lg:mx-0">
            Issue and verify critical and official documents with
            blockchain-backed authenticity, cryptographic hashing and QR-based
            verification.
          </p>

          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-black/5 px-3 py-2 sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm sm:h-10 sm:w-10 sm:rounded-xl">
                <Shield className="h-4 w-4 text-black/40 sm:h-5 sm:w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-black sm:text-base">
                  Tamper-proof Issuance
                </p>
                <p className="text-xs text-black/40 sm:text-sm">
                  Secured on Polygon network
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-black/5 px-3 py-2 sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm sm:h-10 sm:w-10 sm:rounded-xl">
                <Database className="h-4 w-4 text-black/40 sm:h-5 sm:w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-black sm:text-base">
                  Decentralized Storage
                </p>
                <p className="text-xs text-black/40 sm:text-sm">
                  Encrypted via IPFS
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-black/5 px-3 py-2 sm:gap-4 sm:rounded-2xl sm:px-4 sm:py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm sm:h-10 sm:w-10 sm:rounded-xl">
                <QrCode className="h-4 w-4 text-black/40 sm:h-5 sm:w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-black sm:text-base">
                  Instant Verification
                </p>
                <p className="text-xs text-black/40 sm:text-sm">
                  No intermediaries needed
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
            <button className="cursor-pointer rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-black/80 sm:px-7 sm:py-4 sm:text-base">
              Issue Certificate
            </button>
            <button className="cursor-pointer rounded-lg bg-black/10 px-5 py-3 text-sm font-medium text-black hover:bg-black/15 sm:px-7 sm:py-4 sm:text-base">
              Verify Certificate
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="hidden lg:flex lg:flex-[1.5] lg:justify-end">
          <div className="relative w-full">
            <Image
              src={heroImage}
              alt="Blockchain-based document verification"
              className="relative h-auto w-full rounded-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
