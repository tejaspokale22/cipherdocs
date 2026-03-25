"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center text-center gap-6 px-6">
        <h1 className="text-8xl font-semibold tracking-tight text-white bg-black p-3 rounded-xl">
          404
        </h1>

        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Page Not Found
        </h2>

        <p className="max-w-md text-lg text-black/60">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>

        <div className="flex gap-4 pt-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-black/80 cursor-pointer"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 rounded-lg bg-black/5 px-6 py-3 font-medium text-black hover:bg-black/10 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </section>
  );
}
