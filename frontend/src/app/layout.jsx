import { Poppins } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/app/context/AuthContext";
import AuthGate from "@/app/components/AuthGate";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "cipherdocs",
  description:
    "cipherdocs is a Polygon-based decentralized document issuance and verification platform that ensures authenticity, integrity, and tamper resistance by storing cryptographic hashes and metadata on the blockchain with off-chain decentralized storage.",
};.

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
        <AuthProvider>
          <AuthGate>{children}</AuthGate>
        </AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 1600,
          }}
        />
      </body>
    </html>
  );
}
