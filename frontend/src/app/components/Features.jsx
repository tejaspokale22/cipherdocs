import {
  FileCheck2,
  QrCode,
  Ban,
  ShieldCheck,
  ClipboardList,
  Share2,
} from "lucide-react";

const features = [
  {
    title: "Issue Documents",
    description:
      "Blockchain-based issuance for tamper-proof, verifiable documents.",
    action: "Start issuing",
    icon: FileCheck2,
  },
  {
    title: "Verify Instantly",
    description:
      "QR-based verification for quick, trusted authenticity checks.",
    action: "Verify now",
    icon: QrCode,
  },
  {
    title: "Revoke & Expire",
    description:
      "Smart contract controls for revocation and lifecycle updates.",
    action: "Manage lifecycle",
    icon: Ban,
  },
  {
    title: "Secure Storage",
    description:
      "Encrypted IPFS storage that keeps documents private and safe.",
    action: "View storage",
    icon: ShieldCheck,
  },
  {
    title: "Trust & Audit",
    description:
      "Transparent logs and trust scores for accountable verification.",
    action: "See audit trail",
    icon: ClipboardList,
  },
  {
    title: "Share Securely",
    description:
      "Share verified documents with anyone via secure, tamper-proof links.",
    action: "Share document",
    icon: Share2,
  },
];

export default function Features() {
  return (
    <section className="bg-white pb-10 pt-2 sm:pb-16">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-black/10 px-3 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm font-medium text-black">
            Features
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-black sm:mt-8 sm:text-3xl lg:text-4xl">
            What You Can Do with cipherdocs
            <span className="text-green-500">.</span>
          </h2>
        </div>
        <div className="mt-8 grid gap-4 xs:grid-cols-1 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex min-h-40 flex-col justify-between rounded-xl bg-black/5 p-4 xs:p-5 sm:p-6 hover:bg-black/10 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <h3 className="text-base sm:text-lg font-semibold">
                      {feature.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-black/70">
                      {feature.description}
                    </p>
                  </div>
                  <Icon className="h-7 w-7 sm:h-9 sm:w-9 text-black shrink-0" />
                </div>
                <button className="mt-4 sm:mt-6 w-fit rounded-full bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-black shadow-sm hover:bg-black hover:text-white transition-colors">
                  {feature.action}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
