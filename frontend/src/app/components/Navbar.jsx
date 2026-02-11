import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black text-white">
      <nav className="mx-auto flex h-16 items-center justify-between px-6 md:px-20 lg:px-36">
        <Link
          href="/"
          className="text-2xl font-normal"
          aria-label="CipherDocs home"
        >
          CipherDocs
        </Link>
        <div className="flex items-center">
          <button className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-base font-semibold text-black hover:bg-white/90 cursor-pointer">
            <Image src="/metamask.svg" alt="MetaMask" width={20} height={20} />
            Connect Wallet
          </button>
        </div>
      </nav>
    </header>
  );
}
