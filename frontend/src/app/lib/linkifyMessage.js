import Link from "next/link";

const LINK_MAP = {
  "https://cipherdocs.vercel.app/verify": {
    href: "/verify",
    label: "https://cipherdocs.vercel.app/verify",
  },
  "https://cipherdocs.vercel.app/user-dashboard": {
    href: "/user-dashboard",
    label: "https://cipherdocs.vercel.app/user-dashboard",
  },
  "https://cipherdocs.vercel.app/issuer-dashboard": {
    href: "/issuer-dashboard",
    label: "https://cipherdocs.vercel.app/issuer-dashboard",
  },
  "https://cipherdocs.vercel.app": {
    href: "/",
    label: "https://cipherdocs.vercel.app",
  },
};

export function linkifyMessage(text) {
  if (!text) return text;

  const parts = text.split(/(https?:\/\/[^\s]+)/g);

  return parts.map((part, index) => {
    const key = Object.keys(LINK_MAP)
      .sort((a, b) => b.length - a.length)
      .find((url) => part.startsWith(url));

    if (key) {
      const link = LINK_MAP[key];

      return (
        <Link
          key={index}
          href={link.href}
          className="text-blue-400 hover:underline hover:text-blue-300"
        >
          {link.label}
        </Link>
      );
    }

    return part;
  });
}
