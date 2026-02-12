import { ArrowRight, Shield, Zap } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-black to-black/90 p-8 sm:p-12 lg:p-16">
          {/* Background decoration */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Ready to Eliminate Document Fraud?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/80 sm:text-lg">
              Join thousands of organizations already using CipherDocs to issue
              and verify documents with blockchain-backed security.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-black transition-all hover:bg-white/90 sm:px-8 sm:py-4"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-6 py-3 text-base font-semibold text-white transition-all hover:border-white hover:bg-white/10 sm:px-8 sm:py-4"
              >
                View Demo
              </Link>
            </div>

            <div className="mt-10 flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-12">
              <div className="flex items-center gap-2 text-white/80">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">
                  No credit card required
                </span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Zap className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Setup in under 5 minutes
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
