"use client";

import { useState, useMemo } from "react";
import { Ban, Briefcase, FileText, Plus, Users } from "lucide-react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Link from "next/link";
import useSWR from "swr";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import { ISSUED_CERTIFICATES } from "@/app/lib/constants";
import { fetcher } from "@/app/lib/fetcher";
import { getCipherDocsContract } from "@/app/lib/contract";
import Spinner from "@/app/components/Spinner";
import ConfirmModal from "@/app/components/ConfirmModal";

export default function IssuerDashboardPage() {
  const {
    data: certificates = [],
    isLoading,
    error,
    mutate,
  } = useSWR(ISSUED_CERTIFICATES, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  const [revokingId, setRevokingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  // memoized stats
  const { totalIssued, uniqueRecipients, revokedExpired } = useMemo(() => {
    const totalIssued = certificates.length;

    const uniqueRecipients = new Set(certificates.map((c) => c.recipient?._id))
      .size;

    const revokedExpired = certificates.filter((c) => {
      const isRevoked = c.status === "revoked" || c.revoked;
      const isExpiredValue =
        c.expiryDate && new Date(c.expiryDate) < new Date();
      return isRevoked || isExpiredValue;
    }).length;

    return { totalIssued, uniqueRecipients, revokedExpired };
  }, [certificates]);

  // check expiry
  const isExpired = (cert) => {
    if (!cert.expiryDate) return false;
    return new Date(cert.expiryDate) < new Date();
  };

  // revoke handler
  const handleRevoke = async () => {
    if (!selectedCert) return;

    try {
      setRevokingId(selectedCert._id);

      // connect to contract
      const contract = await getCipherDocsContract();

      // send revoke transaction
      const tx = await contract.revokeCertificate(
        selectedCert.contractCertificateId,
        {
          maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),
          maxFeePerGas: ethers.parseUnits("50", "gwei"),
        },
      );

      // wait for confirmation
      const receipt = await tx.wait();

      // ensure transaction succeeded
      if (receipt.status !== 1) {
        throw new Error("Blockchain transaction failed.");
      }

      // sync backend database
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/certificates/revoke/${selectedCert.contractCertificateId}`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to sync revoke status with server.");
      }

      toast.success("Certificate revoked successfully.");

      // refresh issuer dashboard data
      await mutate();

      setConfirmOpen(false);
      setSelectedCert(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to revoke certificate.");
    } finally {
      setRevokingId(null);
    }
  };

  if (error) {
    toast.error("Failed to load issued certificates.");
  }

  return (
    <ProtectedRoute requiredRole="issuer">
      <main className="min-h-screen bg-white pt-24 pb-12 px-4 sm:px-6 md:px-16 lg:px-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-black">
                Issuer Dashboard
              </h1>
              <p className="text-sm text-black/60 mt-2">
                Manage and issue certificates to users.
              </p>
            </div>

            <div className="flex flex-col items-stretch sm:items-end gap-2">
              <Link
                href="/issue-certificate"
                className="inline-flex items-center justify-center gap-2 bg-black text-white rounded-lg hover:bg-black/80 transition whitespace-nowrap px-3 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                Issue Certificate
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <StatCard
              icon={<FileText className="h-5 w-5 text-black/50" />}
              label="Total Issued"
              value={totalIssued}
            />
            <StatCard
              icon={<Users className="h-5 w-5 text-black/50" />}
              label="Recipients"
              value={uniqueRecipients}
            />
            <StatCard
              icon={<Briefcase className="h-5 w-5 text-black/50" />}
              label="Revoked / Expired"
              value={revokedExpired}
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-black/10 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-black/10">
              <h2 className="font-semibold text-black text-sm sm:text-base">
                Issued Certificates
              </h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center p-16">
                <Spinner size="lg" />
              </div>
            ) : certificates.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="h-12 w-12 text-black/20 mx-auto mb-4" />
                <p className="text-black/50">No certificates issued yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm text-left">
                  <thead className="bg-black/5">
                    <tr>
                      <th className="px-4 sm:px-6 py-3">Name</th>
                      <th className="px-4 sm:px-6 py-3">Recipient</th>
                      <th className="px-4 sm:px-6 py-3">Status</th>
                      <th className="px-4 sm:px-6 py-3">Issued On</th>
                      <th className="px-4 sm:px-6 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.map((cert) => {
                      let statusLabel;

                      if (cert.status === "revoked" || cert.revoked) {
                        statusLabel = "Revoked";
                      } else if (isExpired(cert)) {
                        statusLabel = "Expired";
                      } else if (cert.status === "active") {
                        statusLabel = "Active";
                      } else {
                        statusLabel =
                          cert.status.charAt(0).toUpperCase() +
                          cert.status.slice(1);
                      }

                      return (
                        <tr key={cert._id} className="border-t border-black/10">
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            {cert.name}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            {cert.recipient?.username || "N/A"}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <StatusBadge status={statusLabel} />
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            {new Date(cert.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            {statusLabel === "Active" ? (
                              <button
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border border-red-500 bg-white text-red-600 text-xs hover:bg-red-50 transition disabled:opacity-60 w-full sm:w-auto cursor-pointer"
                                onClick={() => {
                                  setSelectedCert(cert);
                                  setConfirmOpen(true);
                                }}
                                disabled={revokingId === cert._id}
                              >
                                {revokingId === cert._id ? (
                                  <Spinner size="sm" variant="light" />
                                ) : (
                                  <>
                                    <Ban className="h-3 w-3" />
                                    <span>Revoke</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="text-[11px] text-black/40">
                                Not available
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <ConfirmModal
            open={confirmOpen}
            onClose={() => {
              setConfirmOpen(false);
              setSelectedCert(null);
            }}
            onConfirm={handleRevoke}
            title="Revoke Certificate?"
            description="Are you sure you want to revoke this certificate? This action cannot be undone."
            confirmText={
              revokingId ? <Spinner size="sm" variant="dark" /> : "Revoke"
            }
            cancelText="Cancel"
            loading={!!revokingId}
          />
        </div>
      </main>
    </ProtectedRoute>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-black/5 rounded-xl p-4 sm:p-6 border border-black/10 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-xs sm:text-sm text-black/60">{label}</span>
      </div>
      <p className="text-2xl sm:text-3xl font-semibold text-black">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const base = "px-3 py-1 rounded-full text-xs font-medium";

  if (status === "Active") {
    return (
      <span className={`${base} bg-green-100 text-green-700`}>Active</span>
    );
  }

  if (status === "Revoked") {
    return <span className={`${base} bg-red-100 text-red-700`}>Revoked</span>;
  }

  if (status === "Expired") {
    return (
      <span className={`${base} bg-yellow-100 text-yellow-700`}>Expired</span>
    );
  }

  return <span className={`${base} bg-black/10 text-black/70`}>{status}</span>;
}
