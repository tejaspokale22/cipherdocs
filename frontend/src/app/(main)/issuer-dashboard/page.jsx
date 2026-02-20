"use client";

import { useEffect, useMemo, useState } from "react";
import { Ban, Briefcase, FileText, Plus, Users, Download } from "lucide-react";
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

function getStatusLabel(status) {
  if (!status) return "Unknown";
  if (status === "revoked") return "Revoked";
  if (status === "expired") return "Expired";
  if (status === "active") return "Active";
  return `${status.charAt(0).toUpperCase()}${status.slice(1)}`;
}

function isExpired(cert) {
  const expiry = cert?.expiryDate;
  if (!expiry) return false;
  const d = new Date(expiry);
  if (Number.isNaN(d.getTime())) return false;
  return d < new Date();
}

function getEffectiveStatusLabel(cert) {
  const raw = getStatusLabel(cert?.status);
  if (raw === "Active" && isExpired(cert)) return "Expired";
  return raw;
}

function formatIssuedOn(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

export default function IssuerDashboardPage() {
  const { data, isLoading, isValidating, error, mutate } = useSWR(
    ISSUED_CERTIFICATES,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 0,
    },
  );

  const certificates = Array.isArray(data) ? data : [];

  // Show spinner when loading or when revalidating with empty/stale data (e.g. after issuing)
  const showLoadingSpinner =
    isLoading || (isValidating && certificates.length === 0);

  const [revokingId, setRevokingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    if (error) toast.error("Failed to load issued certificates.");
  }, [error]);

  // memoized stats
  const { totalIssued, isActive, uniqueRecipients, revokedExpired } =
    useMemo(() => {
      // Ensure certificates is always an array
      const safeCertificates = Array.isArray(certificates) ? certificates : [];

      const totalIssued = safeCertificates.length;

      const uniqueRecipients = new Set(
        safeCertificates.map((c) => c?.recipient?._id).filter(Boolean), // remove undefined/null
      ).size;

      const revokedExpired = safeCertificates.filter((c) => {
        if (!c) return false;

        const isRevoked = c.status === "revoked";

        const isExpiredValue =
          c?.expiryDate &&
          !isNaN(new Date(c.expiryDate)) &&
          new Date(c.expiryDate) < new Date();

        return isRevoked || isExpiredValue;
      }).length;

      const isActive = safeCertificates.filter((c) => {
        if (!c) return false;
        const isActive = c.status === "active";
        return isActive;
      }).length;

      return { totalIssued, isActive, uniqueRecipients, revokedExpired };
    }, [certificates]);

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

  // download certificate
  const handleDownload = async (cert) => {
    try {
      setDownloadingId(cert._id);

      if (!cert.fileBase64) {
        toast.error("File not available.");
        return;
      }

      const byteCharacters = atob(cert.fileBase64);
      const byteArray = Uint8Array.from(byteCharacters, (char) =>
        char.charCodeAt(0),
      );

      const blob = new Blob([byteArray], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${cert.name || "certificate"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Download failed.");
    } finally {
      setDownloadingId(null);
    }
  };

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
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
              icon={<Users className="h-5 w-5 text-black/50" />}
              label="Active"
              value={isActive}
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

            {showLoadingSpinner ? (
              <div className="flex flex-col items-center justify-center gap-4 p-16">
                <Spinner size="lg" />
                <p className="text-sm text-black/60">Loading certificates...</p>
              </div>
            ) : certificates.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-black/60">No certificates issued yet</p>
                <p className="text-sm text-black/40 mt-1">
                  Issue your first certificate to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs sm:text-sm text-left">
                  <thead className="bg-black/5">
                    <tr>
                      <th scope="col" className="px-4 sm:px-6 py-3">
                        Name
                      </th>
                      <th scope="col" className="px-4 sm:px-6 py-3">
                        Recipient
                      </th>
                      <th scope="col" className="px-4 sm:px-6 py-3">
                        Status
                      </th>
                      <th scope="col" className="px-4 sm:px-6 py-3">
                        Issued On
                      </th>
                      <th scope="col" className="px-4 sm:px-6 py-3 text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.map((cert) => {
                      const statusLabel = getEffectiveStatusLabel(cert);
                      const isRevoking = revokingId === cert?._id;
                      const isDownloading = downloadingId === cert?._id;

                      return (
                        <tr
                          key={cert?._id}
                          className="border-t border-black/10"
                        >
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            {cert?.name || "—"}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            {cert?.recipient?.username || "N/A"}
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <StatusBadge status={statusLabel} />
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            {formatIssuedOn(cert?.createdAt || cert?.issueDate)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-4">
                              {/* Left Slot (Fixed Width) */}
                              <div className="w-[110px] flex justify-center">
                                {statusLabel === "Active" ? (
                                  <button
                                    type="button"
                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border border-red-500 bg-white text-red-600 text-xs hover:bg-red-50 transition disabled:opacity-60 cursor-pointer w-full"
                                    onClick={() => {
                                      setSelectedCert(cert);
                                      setConfirmOpen(true);
                                    }}
                                    disabled={isRevoking}
                                  >
                                    <Ban className="h-3 w-3" />
                                    <span>Revoke</span>
                                  </button>
                                ) : (
                                  <span className="inline-flex items-center justify-center px-3 py-1.5 rounded border border-black/10 bg-black/5 text-black/60 text-xs w-full select-none">
                                    {statusLabel}
                                  </span>
                                )}
                              </div>

                              {/* Right Slot (Fixed Width) */}
                              <div className="w-[130px] flex justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleDownload(cert)}
                                  disabled={isDownloading}
                                  className="bg-black text-white px-4 py-1.5 rounded-md hover:bg-black/80 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm w-full cursor-pointer"
                                >
                                  <Download className="h-4 w-4" />
                                  {isDownloading
                                    ? "Downloading..."
                                    : "Download"}
                                </button>
                              </div>
                            </div>
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
