"use client";

import { useState, useMemo } from "react";
import { Briefcase, FileText, Plus, Users } from "lucide-react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Link from "next/link";
import useSWR from "swr";
import toast from "react-hot-toast";

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
  const { totalIssued, uniqueRecipients, pendingCount } = useMemo(() => {
    const totalIssued = certificates.length;

    const uniqueRecipients = new Set(certificates.map((c) => c.recipient?._id))
      .size;

    const pendingCount = certificates.filter(
      (c) => c.status === "pending",
    ).length;

    return { totalIssued, uniqueRecipients, pendingCount };
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

      const contract = await getCipherDocsContract();
      const tx = await contract.revokeCertificate(
        selectedCert.contractCertificateId,
      );

      await tx.wait();

      toast.success("Certificate revoked successfully");

      await mutate();

      setConfirmOpen(false);
      setSelectedCert(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to revoke certificate");
    } finally {
      setRevokingId(null);
    }
  };

  if (error) {
    toast.error("Failed to load issued certificates");
  }

  return (
    <ProtectedRoute requiredRole="issuer">
      <main className="min-h-screen bg-white pt-24 pb-12 px-6 md:px-20 lg:px-36">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-black">
                Issuer Dashboard
              </h1>
              <p className="text-black/50 mt-2">
                Manage and issue certificates to users
              </p>
            </div>

            <Link
              href="/issue-certificate"
              className="flex items-center gap-2 bg-black text-white rounded-lg hover:bg-black/80 transition whitespace-nowrap px-3 py-2 text-xs sm:px-4 sm:py-2 sm:text-sm"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              Issue Certificate
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              label="Pending"
              value={pendingCount}
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-black/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-black/10">
              <h2 className="font-semibold">Issued Certificates</h2>
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
                <table className="w-full text-sm text-left">
                  <thead className="bg-black/5">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Recipient</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Issued On</th>
                      <th className="px-6 py-3">Action</th>
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
                          <td className="px-6 py-3">{cert.name}</td>
                          <td className="px-6 py-3">
                            {cert.recipient?.username || "N/A"}
                          </td>
                          <td className="px-6 py-3">{statusLabel}</td>
                          <td className="px-6 py-3">
                            {new Date(cert.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-3">
                            {statusLabel === "Active" && (
                              <button
                                className="px-3 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600 transition disabled:opacity-60"
                                onClick={() => {
                                  setSelectedCert(cert);
                                  setConfirmOpen(true);
                                }}
                                disabled={revokingId === cert._id}
                              >
                                {revokingId === cert._id ? (
                                  <Spinner size="sm" variant="light" />
                                ) : (
                                  "Revoke"
                                )}
                              </button>
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
              revokingId ? <Spinner size="sm" variant="light" /> : "Revoke"
            }
            cancelText="Cancel"
          />
        </div>
      </main>
    </ProtectedRoute>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-black/5 rounded-xl p-6 border border-black/10">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm text-black/50">{label}</span>
      </div>
      <p className="text-3xl font-semibold">{value}</p>
    </div>
  );
}
