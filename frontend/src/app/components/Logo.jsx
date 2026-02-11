import Image from "next/image";
import Link from "next/link";
import logoLight from "../../../public/logo-light.png";
import logoDark from "../../../public/logo-dark.png";

export default function Logo({ size = 32, variant = "light" }) {
  return (
    <Link href="/" className="inline" aria-label="CipherDocs home">
      <Image
        src={variant === "light" ? logoLight : logoDark}
        alt="CipherDocs Logo"
        width={size}
        height={size}
        priority
      />
    </Link>
  );
}
