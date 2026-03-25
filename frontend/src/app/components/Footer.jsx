import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-black text-white w-full">
      <div className="mx-auto max-w-7xl px-3 py-8 xs:px-4 xs:py-10 sm:px-6 sm:py-16 lg:px-8">
        {/* Top Section */}
        <div className="grid gap-8 xs:gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link
              href="/"
              className="inline-block text-xl xs:text-2xl font-normal tracking-wide"
            >
              <Logo size={140} variant="light" linkable={false} />
            </Link>
            <p className="mt-2 text-xs xs:text-sm text-white/70 leading-relaxed max-w-xs xs:max-w-sm">
              A decentralized document issuance and verification platform
              powered by Polygon blockchain, designed to eliminate forgery and
              restore digital trust.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 xs:gap-4 mt-5 xs:mt-6">
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors hover:underline"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors hover:underline"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="mailto:contact@cipherdocs.com"
                className="text-white/50 hover:text-white transition-colors hover:underline"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3 xs:space-y-4">
            <p className="text-xs xs:text-sm font-semibold uppercase tracking-wide">
              Platform
            </p>
            <ul className="space-y-2 xs:space-y-3 text-xs xs:text-sm text-white/70">
              <li>
                <Link
                  className="hover:text-white transition-colors hover:underline"
                  href="#"
                >
                  Issue Documents
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors hover:underline"
                  href="#"
                >
                  Verify Documents
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors hover:underline"
                  href="#"
                >
                  My Certificates
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors hover:underline"
                  href="#"
                >
                  Audit Trail
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-3 xs:space-y-4">
            <p className="text-xs xs:text-sm font-semibold uppercase tracking-wide">
              Resources
            </p>
            <ul className="space-y-2 xs:space-y-3 text-xs xs:text-sm text-white/70">
              <li>
                <Link
                  className="hover:text-white transition-colors hover:underline"
                  href="#"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors hover:underline"
                  href="#"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors hover:underline"
                  href="#"
                >
                  Smart Contracts
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors hover:underline"
                  href="#"
                >
                  API Reference
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-3 xs:space-y-4">
            <p className="text-xs xs:text-sm font-semibold uppercase tracking-wide">
              Legal
            </p>
            <ul className="space-y-2 xs:space-y-3 text-xs xs:text-sm text-white/70">
              <li>
                <Link
                  className="hover:text-white transition-colors hover:underline"
                  href="#"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors hover:underline"
                  href="#"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-white transition-colors hover:underline"
                  href="#"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-white/10 xs:my-8 sm:my-12" />

        {/* Bottom Bar */}
        <div className="flex flex-col gap-2 xs:gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left text-xs xs:text-sm text-white/60">
          <p>© {new Date().getFullYear()} CipherDocs. All rights reserved.</p>
          <p className="text-white/40 text-[10px] xs:text-xs sm:text-sm">
            Powered by Polygon • Secured by Cryptography • Stored on IPFS
          </p>
        </div>
      </div>
    </footer>
  );
}
