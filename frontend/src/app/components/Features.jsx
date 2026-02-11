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
    <section className="bg-white text-black">
      <div className="mx-auto w-full max-w-[90vw] px-6 pb-20">
        <h2 className="text-2xl font-semibold md:text-3xl">
          What You Can Do with CipherDocs
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex min-h-45 flex-col justify-between rounded-lg bg-black/5 p-6 hover:bg-black/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-black/70">
                      {feature.description}
                    </p>
                  </div>
                  <Icon className="h-9 w-9 text-black/70" />
                </div>
                <button className="mt-6 w-fit rounded-full bg-white px-4 py-2 text-sm font-medium text-black">
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
