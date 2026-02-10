export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Top Section */}
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-normal tracking-wide">CipherDocs</h2>
            <p className="text-sm text-white/70 leading-relaxed max-w-sm">
              CipherDocs is a decentralized document issuance and verification
              platform powered by blockchain and cryptography, designed to
              eliminate forgery and restore digital trust.
            </p>
            <a
              href="#"
              className="inline-block text-sm font-medium text-white hover:underline"
            >
              Visit Help Center →
            </a>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide">
              Platform
            </p>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <a className="hover:text-white" href="#">
                  Issue Documents
                </a>
              </li>
              <li>
                <a className="hover:text-white" href="#">
                  Verify Instantly
                </a>
              </li>
              <li>
                <a className="hover:text-white" href="#">
                  Revoke & Expire
                </a>
              </li>
              <li>
                <a className="hover:text-white" href="#">
                  Audit Logs
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide">
              Security
            </p>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <a className="hover:text-white" href="#">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a className="hover:text-white" href="#">
                  Encryption Model
                </a>
              </li>
              <li>
                <a className="hover:text-white" href="#">
                  Compliance
                </a>
              </li>
              <li>
                <a className="hover:text-white" href="#">
                  Responsible Disclosure
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide">
              Get Started
            </p>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <a className="hover:text-white" href="#">
                  Request Demo
                </a>
              </li>
              <li>
                <a className="hover:text-white" href="#">
                  Documentation
                </a>
              </li>
              <li>
                <a className="hover:text-white" href="#">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="my-12 h-px bg-white/10" />

        {/* Bottom Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-white/60">
          <p>© {new Date().getFullYear()} CipherDocs. All rights reserved.</p>
          <p className="text-white/50">
            Built on Polygon • Secured by Cryptography • Stored on IPFS
          </p>
        </div>
      </div>
    </footer>
  );
}
