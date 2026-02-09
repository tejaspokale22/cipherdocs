import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "CipherDocs",
  description:
    "CipherDocs is a Polygon-based decentralized document issuance and verification platform that ensures authenticity, integrity, and tamper resistance by storing cryptographic hashes and metadata on the blockchain with off-chain decentralized storage.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
