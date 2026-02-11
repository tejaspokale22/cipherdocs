import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {/* Top Section */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link
              href="/"
              className="inline-block text-2xl font-normal tracking-wide"
            >
              CipherDocs
            </Link>
            <p className="mt-4 text-sm text-white/70 leading-relaxed max-w-sm">
              A decentralized document issuance and verification platform
              powered by Polygon blockchain, designed to eliminate forgery and
              restore digital trust.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6">
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="mailto:contact@cipherdocs.com"
                className="text-white/50 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide">
              Platform
            </p>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link className="hover:text-white transition-colors" href="#">
                  Issue Documents
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="#">
                  Verify Documents
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="#">
                  My Certificates
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="#">
                  Audit Trail
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide">
              Resources
            </p>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link className="hover:text-white transition-colors" href="#">
                  Documentation
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="#">
                  How It Works
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="#">
                  Smart Contracts
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="#">
                  API Reference
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide">
              Legal
            </p>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <Link className="hover:text-white transition-colors" href="#">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="#">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link className="hover:text-white transition-colors" href="#">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-white/10 sm:my-12" />

        {/* Bottom Bar */}
        <div className="flex flex-col gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left text-sm text-white/60">
          <p>© {new Date().getFullYear()} CipherDocs. All rights reserved.</p>
          <p className="text-white/40 text-xs sm:text-sm">
            Powered by Polygon • Secured by Cryptography • Stored on IPFS
          </p>
        </div>
      </div>
    </footer>
  );
}
