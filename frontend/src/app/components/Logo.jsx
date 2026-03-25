import Image from "next/image";
import Link from "next/link";
import logoLight from "../../../public/logo-light.png";
import logoDark from "../../../public/logo-dark.png";

export default function Logo({
  size = 32,
  variant = "light",
  linkable = true,
}) {
  const image = (
    <Image
      src={variant === "light" ? logoLight : logoDark}
      alt="CipherDocs Logo"
      width={size}
      height={size}
      priority
    />
  );

  if (!linkable) {
    return image;
  }

  return (
    <Link href="/" className="inline" aria-label="CipherDocs home">
      {image}
    </Link>
  );
}
