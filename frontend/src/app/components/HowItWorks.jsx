import { Wallet, FileUp, Shield, QrCode } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Connect Wallet",
    description:
      "Link your MetaMask or any Web3 wallet to authenticate securely without passwords.",
    icon: Wallet,
  },
  {
    step: "02",
    title: "Upload Document",
    description:
      "Upload your certificate or document. It's encrypted and stored on IPFS for maximum security.",
    icon: FileUp,
  },
  {
    step: "03",
    title: "Issue On-Chain",
    description:
      "The document hash is recorded on Polygon blockchain, creating an immutable proof of authenticity.",
    icon: Shield,
  },
  {
    step: "04",
    title: "Verify Anywhere",
    description:
      "Anyone can scan the QR code or enter the certificate ID to instantly verify authenticity.",
    icon: QrCode,
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block rounded-full bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-600">
            Simple Process
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-black sm:text-4xl">
            How CipherDocs Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-black/60 sm:text-lg">
            Four simple steps to issue and verify documents with
            blockchain-backed security
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-12 hidden h-0.5 w-full bg-linear-to-r from-green-500/50 to-transparent lg:block" />
                )}

                <div className="relative flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-black transition-transform hover:scale-105">
                      <Icon className="h-10 w-10 text-white" />
                    </div>
                    <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-black">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-black/60">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
