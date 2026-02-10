import Image from "next/image";
import { Shield, Database, QrCode } from "lucide-react";
import heroImage from "../../../public/hero.png";

export default function Hero() {
  return (
    <section className="bg-white text-black min-h-screen flex items-center pt-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-16 px-6 lg:flex-row lg:items-center">
        {/* Left Content */}
        <div className="flex-1 space-y-8">
          <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight md:text-4xl lg:text-5xl">
            Trust any document with CipherDocs.
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-black/60">
            CipherDocs helps institutions issue and verify critical documents
            using blockchain-backed authenticity, cryptographic hashing, and
            QR-based verification.
          </p>

          <div className="flex flex-col gap-3 text-sm text-black/70">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-black/50" />
              <span>Tamper-proof issuance on Polygon</span>
            </div>
            <div className="flex items-center gap-3">
              <Database className="h-4 w-4 text-black/50" />
              <span>Encrypted off-chain storage via IPFS</span>
            </div>
            <div className="flex items-center gap-3">
              <QrCode className="h-4 w-4 text-black/50" />
              <span>Instant verification without intermediaries</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <button className="cursor-pointer rounded-lg bg-black px-7 py-4 text-base font-medium text-white hover:bg-black/80">
              Issue Certificate
            </button>
            <button className="cursor-pointer rounded-lg bg-black/5 px-7 py-4 text-base font-medium text-black hover:bg-black/10">
              Verify Certificate
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="hidden lg:flex lg:flex-[1.4] lg:justify-end">
          <div className="relative w-full">
            <div className="absolute -inset-4" />
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
