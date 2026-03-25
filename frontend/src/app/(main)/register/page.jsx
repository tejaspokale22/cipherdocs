"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { User, Briefcase, CheckCircle2 } from "lucide-react";
import { verifyUser } from "@/app/lib/authApi";
import Spinner from "@/app/components/Spinner";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
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
      toast.error("username is required");
      return;
    }

    if (!name.trim()) {
      toast.error("name is required");
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

      await verifyUser({
        walletAddress: tempAuth.walletAddress,
        signature: tempAuth.signature,
        username,
        name,
        role,
      });

      sessionStorage.removeItem("tempAuth");

      toast.success("Registration is successful. Now you can log in.", {
        id: "register",
      });

      router.push("/");
    } catch (error) {
      toast.error(error.message || "something went wrong", {
        id: "register",
      });
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
    <main className="min-h-screen bg-linear-to-b from-black/5 to-white flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-10 relative">
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border-2 border-black/10 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-6">
            <h1 className="text-2xl font-semibold">
              Complete your Registration
            </h1>
            <p className="text-sm text-black/50 mt-1">
              One last step to get started with cipherdocs.
            </p>
          </div>

          <div className="p-7">
            {/* Wallet Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 rounded-lg bg-green-100 border-2 border-green-700 mb-6">
              <div className="flex items-center gap-2 max-w-full overflow-hidden">
                <CheckCircle2 className="h-6 w-6 text-green-700" />
                <div>
                  <p className="text-sm font-semibold text-black/90">
                    MetaMask Wallet Connected
                  </p>
                  <p className="text-xs font-medium text-black/70 break-all">
                    {tempAuth.walletAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Username<span className="text-red-500">*</span>
                </label>
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

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Name<span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-black/30" />
                  <input
                    type="text"
                    placeholder="Enter a name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-black/10 bg-black/2 text-base placeholder:text-black/40 focus:outline-none focus:border-black/30 focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* Role */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Role<span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* User */}
                  <button
                    type="button"
                    onClick={() => setRole("user")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition cursor-pointer ${
                      role === "user"
                        ? "border-black bg-black/5"
                        : "border-black/10 hover:border-black/20"
                    }`}
                  >
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        role === "user"
                          ? "bg-black text-white"
                          : "bg-black/5 text-black/50"
                      }`}
                    >
                      <User className="h-6 w-6" />
                    </div>
                    <span className="font-medium">User</span>
                    <span className="text-xs text-black/50 text-center">
                      Receive & verify certificates
                    </span>
                  </button>

                  {/* Issuer */}
                  <button
                    type="button"
                    onClick={() => setRole("issuer")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition cursor-pointer ${
                      role === "issuer"
                        ? "border-black bg-black/5"
                        : "border-black/10 hover:border-black/20"
                    }`}
                  >
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        role === "issuer"
                          ? "bg-black text-white"
                          : "bg-black/5 text-black/50"
                      }`}
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

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="w-full py-4 rounded-lg bg-black text-white font-medium hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
              >
                {loading ? (
                  <Spinner size="md" variant="light" />
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
