"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { User, Briefcase, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { verifyUser } from "@/app/lib/authApi";
import Spinner from "@/app/components/Spinner";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [tempAuth, setTempAuth] = useState(null);

  useEffect(() => {
    const storedAuth = sessionStorage.getItem("tempAuth");
    if (!storedAuth) {
      toast.error("wallet connection required");
      router.push("/");
      return;
    }
    setTempAuth(JSON.parse(storedAuth));
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("username required");
      return;
    }

    if (!tempAuth) {
      toast.error("wallet connection required");
      router.push("/");
      return;
    }

    try {
      setLoading(true);
      toast.loading("completing registration...", { id: "register" });

      const data = await verifyUser({
        walletAddress: tempAuth.walletAddress,
        signature: tempAuth.signature,
        username,
        role,
      });

      sessionStorage.removeItem("tempAuth");
      toast.success("registration successful", { id: "register" });
      router.push("/");
    } catch (error) {
      toast.error(error.message, { id: "register" });
    } finally {
      setLoading(false);
    }
  };

  if (!tempAuth) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <Spinner size="xl" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-black/5 to-white flex items-center justify-center px-4 pt-24 pb-12 relative">
      {/* back link */}
      <Link
        href="/"
        className="absolute top-24 left-10 inline-flex items-center gap-2 text-base text-black/50 hover:text-black hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>
      <div className="w-full max-w-lg">
        {/* card */}
        <div className="bg-white rounded-2xl border border-black/10 overflow-hidden">
          {/* header */}
          <div className="px-8 pt-8 ">
            <h1 className="text-2xl font-semibold">
              Complete your Registration
            </h1>
            <p className="text-sm text-black/50 mt-1">
              One last step to get started with CipherDocs
            </p>
          </div>

          {/* content */}
          <div className="p-8">
            {/* wallet connected */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-black/5 border border-black mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-black/60" />
                <div>
                  <p className="text-sm font-medium text-black/90">
                    MetaMask Wallet Connected
                  </p>
                  <p className="text-xs text-black/70">
                    {tempAuth?.walletAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* username */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/30" />
                  <input
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-black/10 bg-black/2 text-base placeholder:text-black/40 focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* role */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("user")}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      role === "user"
                        ? "border-black bg-black/5"
                        : "border-black/10 hover:border-black/20"
                    }`}
                  >
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${role === "user" ? "bg-black text-white" : "bg-black/5 text-black/50"}`}
                    >
                      <User className="h-6 w-6" />
                    </div>
                    <span className="font-medium">User</span>
                    <span className="text-xs text-black/50 text-center">
                      Receive & verify certificates
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("issuer")}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      role === "issuer"
                        ? "border-black bg-black/5"
                        : "border-black/10 hover:border-black/20"
                    }`}
                  >
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${role === "issuer" ? "bg-black text-white" : "bg-black/5 text-black/50"}`}
                    >
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <span className="font-medium">Issuer</span>
                    <span className="text-xs text-black/50 text-center">
                      Issue & manage certificates
                    </span>
                  </button>
                </div>
              </div>

              {/* submit */}
              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="w-full py-4 rounded-lg bg-black text-white font-medium hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Spinner size="md" variant="light" />
                  </>
                ) : (
                  "Create Profile"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
