"use client";

import { useState, useEffect, useMemo } from "react";
import { FileText, Download, CheckCircle, Clock, QrCode } from "lucide-react";
import Spinner from "@/app/components/Spinner";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import toast from "react-hot-toast";
import { MY_CERTIFICATES } from "@/app/lib/constants";
import { fetcher } from "@/app/lib/fetcher";
import useSWR from "swr";
import QRCode from "qrcode";
import QrModal from "@/app/components/QrModal";

export default function UserDashboardPage() {
  const {
    data: certificates = [],
    error,
    isLoading,
  } = useSWR(MY_CERTIFICATES, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });
  const [downloadingId, setDownloadingId] = useState(null);
  const [qrMap, setQrMap] = useState({});
  const [qrModal, setQrModal] = useState({
    open: false,
    src: null,
    link: null,
  });

  // show error toast safely
  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to fetch certificates");
    }
  }, [error]);

  // memoized stats
  const { total, active, others } = useMemo(() => {
    const total = certificates.length;
    const active = certificates.filter((c) => c.status === "active").length;
    const others = total - active;

    return { total, active, others };
  }, [certificates]);

  // download certificate
  const handleDownload = async (cert) => {
    try {
      setDownloadingId(cert._id);

      if (!cert.fileBase64) {
        toast.error("File not available");
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
      toast.error("Download failed");
    } finally {
      setDownloadingId(null);
    }
  };

  // generate QR code
  const generateQR = async (cert) => {
    try {
      const verifyUrl = `${process.env.NEXT_PUBLIC_API_URL}/verify/${cert.contractCertificateId}`;
      const qrImage = await QRCode.toDataURL(verifyUrl);
      setQrMap((prev) => ({
        ...prev,
        [cert._id]: qrImage,
      }));
      setQrModal({ open: true, src: qrImage, link: verifyUrl });
    } catch (err) {
      toast.error("Failed to generate QR. Please try again.");
    }
  };

  return (
    <ProtectedRoute requiredRole="user">
      <main className="min-h-screen bg-white pt-24 pb-12 px-6 md:px-20 lg:px-36">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-black">
              My Certificates
            </h1>
            <p className="text-black/50 mt-1">
              View and download your received certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={<FileText className="h-5 w-5 text-black/50" />}
              label="Total Received"
              value={total}
            />
            <StatCard
              icon={<CheckCircle className="h-5 w-5 text-black/50" />}
              label="Active"
              value={active}
            />
            <StatCard
              icon={<Clock className="h-5 w-5 text-black/50" />}
              label="Revoked / Expired"
              value={others}
            />
          </div>

          <div className="bg-white rounded-xl border border-black/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-black/10">
              <h2 className="font-semibold">My Certificates</h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center p-16">
                <Spinner size="lg" />
              </div>
            ) : certificates.length === 0 ? (
              <div className="p-12 text-center">
                <Download className="h-12 w-12 text-black/20 mx-auto mb-4" />
                <p className="text-black/50">No certificates received yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/5">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Issuer</th>
                      <th className="px-6 py-3">Issued On</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.map((cert) => (
                      <tr key={cert._id} className="border-t border-black/10">
                        <td className="px-6 py-4 font-medium">{cert.name}</td>
                        <td className="px-6 py-4">
                          {cert.issuer?.username || "Unknown"}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(cert.issueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={cert.status} />
                        </td>
                        <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                          <button
                            onClick={() => generateQR(cert)}
                            className="text-sm bg-black text-white px-4 py-2 rounded-md hover:bg-black/80 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                          >
                            <QrCode className="h-4 w-4" />
                            Show QR
                          </button>
                          <button
                            onClick={() => handleDownload(cert)}
                            disabled={downloadingId === cert._id}
                            className="text-sm bg-black text-white px-3 py-2 rounded-md hover:bg-black/80 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Download className="h-4 w-4" />
                            {downloadingId === cert._id
                              ? "Downloading..."
                              : "Download"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      <QrModal
        open={qrModal.open}
        onClose={() => setQrModal({ open: false, src: null, link: null })}
        qrSrc={qrModal.src}
        verifyUrl={qrModal.link}
      />
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

function StatusBadge({ status }) {
  const base = "px-3 py-1 rounded-full text-xs font-medium";

  if (status === "active") {
    return (
      <span className={`${base} bg-green-100 text-green-700`}>Active</span>
    );
  }

  if (status === "revoked") {
    return <span className={`${base} bg-red-100 text-red-700`}>Revoked</span>;
  }

  return (
    <span className={`${base} bg-yellow-100 text-yellow-700`}>Expired</span>
  );
}
