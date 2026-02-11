import ConnectWallet from "./ConnectWallet";
import Logo from "./Logo";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-black text-white">
      <nav className="mx-auto flex h-16 items-center justify-between px-6 md:px-20 lg:px-36">
        <Logo size={180} variant="light" />
        <div className="flex items-center">
          <ConnectWallet />
        </div>
      </nav>
    </header>
  );
}
