import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black text-white">
      <nav className="mx-auto flex h-16 items-center justify-between px-6 md:px-20 lg:px-36">
        <Link
          href="/"
          className="text-2xl font-normal tracking-wide"
          aria-label="CipherDocs home"
        >
          CipherDocs
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-base font-medium transition-colors hover:bg-white/10"
          >
            Log in
          </Link>
          <Link
            href="/"
            className="rounded-full bg-white px-4 py-2 text-base font-semibold text-black transition-colors hover:bg-gray-200"
          >
            Sign up
          </Link>
        </div>
      </nav>
    </header>
  );
}
