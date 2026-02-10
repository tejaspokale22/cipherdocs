import { Poppins } from "next/font/google";
import "@/app/globals.css";
import Navbar from "@/app/components/Navbar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      <body className={`${poppins.className} antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
