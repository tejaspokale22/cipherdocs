"use client";

import { AlertCircle, CircleCheck, FileText, Upload, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useRef } from "react";
import Spinner from "@/app/components/Spinner";
import Link from "next/link";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const STATUS_CONFIG = {
  valid: {
    label: "Certificate is valid and authentic.",
    badge: "VERIFIED",
    badgeCls: "bg-green-600 text-white",
    headerCls: "bg-black text-white border-b border-white/10",
    cardCls: "bg-black text-white border-black",
    iconColor: "text-white",
    dividerCls: "border-b border-white/10",
    labelCls: "text-white/40",
    valueCls: "text-white",
  },
  revoked: {
    label: "Certificate has been revoked.",
    badge: "REVOKED",
    badgeCls: "bg-red-600 text-white",
    headerCls: "bg-red-50 text-black border-b border-red-100",
    cardCls: "bg-white text-black border-black/30",
    iconColor: "text-red-500",
    dividerCls: "border-b border-gray-100",
    labelCls: "text-gray-400",
    valueCls: "text-black",
  },
  expired: {
    label: "Certificate has been expired.",
    badge: "EXPIRED",
    badgeCls: "bg-orange-500 text-white",
    headerCls: "bg-orange-50 text-black border-b border-orange-100",
    cardCls: "bg-white text-black border-black/30",
    iconColor: "text-orange-500",
    dividerCls: "border-b border-gray-100",
    labelCls: "text-gray-400",
    valueCls: "text-black",
  },
  tampered: {
    label: "Document has been tampered.",
    badge: "TAMPERED",
    badgeCls: "bg-red-600 text-white",
    headerCls: "bg-red-50 text-black border-b border-red-100",
    cardCls: "bg-white text-black border-black/30",
    iconColor: "text-red-500",
    dividerCls: "border-b border-gray-100",
    labelCls: "text-gray-400",
    valueCls: "text-black",
  },
  error: {
    label: "Verification failed.",
    badge: "ERROR",
    badgeCls: "bg-gray-700 text-white",
    headerCls: "bg-gray-50 text-black border-b border-gray-100",
    cardCls: "bg-white text-black border-black/30",
    iconColor: "text-gray-500",
    dividerCls: "border-b border-gray-100",
    labelCls: "text-gray-400",
    valueCls: "text-black",
  },
};

export default function VerifyCertificatePage() {
  const { certId } = useParams();

  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const inputRef = useRef(null);

  const resetState = () => {
    setError(null);
    setResult(null);
  };

  const handleFile = async (selectedFile) => {
    resetState();
    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }

    setFile(selectedFile);
    setLoading(true);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/certificates/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ certId, originalDocumentHash: hashHex }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");

      setResult(data);
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const cfg = result?.status ? STATUS_CONFIG[result.status] : null;
  const hasResult = !!(result?.status && cfg);
  const hasActivity = loading || error || hasResult;

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl mx-auto">
          {/* Page header */}
          <div className="mb-8">
            <div className="mt-2">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-black">
                Verify certificate authenticity
              </h1>
              <p className="mt-1 text-sm sm:text-base text-gray-500 max-w-2xl">
                Upload the original PDF to verify it against its immutable
                record on the blockchain.
              </p>
            </div>
          </div>

          {/* ── Two-column grid: left = form, right = result ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            {/* left */}
            <div className="bg-white rounded-2xl border border-black/30 shadow-sm overflow-hidden">
              {/* Card header */}
              <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md bg-black flex items-center justify-center shrink-0">
                    <Upload className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-400 tracking-[0.2em] uppercase">
                    Upload PDF
                  </span>
                </div>

                <p className="mt-1 text-sm sm:text-base text-gray-500 leading-relaxed">
                  Drag & drop the original certificate file here or browse from
                  your device.
                </p>
              </div>

              {/* Upload zone */}
              <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-2 sm:pt-3">
                <div
                  className={cn(
                    "border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200",
                    dragActive
                      ? "border-black bg-gray-100 scale-[1.005]"
                      : "border-black/20 bg-gray-50 hover:border-black/50 hover:bg-gray-50",
                  )}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => !loading && inputRef.current?.click()}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files?.[0] && handleFile(e.target.files[0])
                    }
                    disabled={loading}
                  />

                  <div className="py-7 flex flex-col items-center text-center px-4">
                    <div
                      className={cn(
                        "w-11 h-11 rounded-xl flex items-center justify-center mb-3.5 transition-all duration-200 border",
                        dragActive
                          ? "bg-black border-black text-white"
                          : "bg-white border-gray-200 text-gray-400",
                      )}
                    >
                      <Upload className="w-5 h-5" />
                    </div>

                    {!file ? (
                      <>
                        <p className="text-sm font-medium text-black">
                          Drop PDF here, or{" "}
                          <span className="underline decoration-dotted underline-offset-2 text-gray-600">
                            browse
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          PDF only · Max 50 MB
                        </p>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 max-w-full">
                        <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-700 font-medium truncate">
                          {file.name}
                        </span>
                        {!loading && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                              resetState();
                            }}
                            className="text-gray-400 hover:text-black shrink-0 transition-colors ml-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* right */}
            {hasActivity && (
              <div className="flex flex-col gap-4">
                {/* Loading */}
                {loading && (
                  <div className="bg-white rounded-2xl border border-black/30 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                      <Spinner size="md" variant="dark" />
                      <div>
                        <p className="text-sm font-semibold text-black">
                          Verifying certificate...
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          This may take a moment.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && !loading && (
                  <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-red-50 flex items-center gap-3 bg-red-50">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                      <p className="text-sm font-semibold text-red-700">
                        Verification Failed
                      </p>
                    </div>
                    <div className="px-5 py-4">
                      <p className="text-sm text-gray-600">{error}</p>
                    </div>
                  </div>
                )}

                {/* Result card */}
                {hasResult && cfg && (
                  <VerificationResult result={result} cfg={cfg} />
                )}

                {/* Verified file summary (shown alongside result) */}
                {hasResult && file && <VerifiedFileSummary file={file} />}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function VerificationResult({ result, cfg }) {
  const isValid = result.status === "valid";

  return (
    <div
      className={
        "rounded-2xl border overflow-hidden border-black/30 " + cfg.cardCls
      }
    >
      {/* Status header */}
      <div
        className={cn(
          "flex items-center justify-between px-5 py-4",
          cfg.headerCls,
        )}
      >
        <div className="flex items-center gap-2.5">
          {isValid ? (
            <CircleCheck className={cn("w-5 h-5 shrink-0", cfg.iconColor)} />
          ) : (
            <AlertCircle className={cn("w-5 h-5 shrink-0", cfg.iconColor)} />
          )}
          <span className="text-sm font-semibold">{cfg.label}</span>
        </div>
        <span
          className={cn(
            "font-mono text-xs font-semibold rounded-full px-2.5 py-0.5 tracking-widest",
            cfg.badgeCls,
          )}
        >
          {cfg.badge}
        </span>
      </div>

      {/* Detail rows — valid only */}
      {isValid && (
        <div>
          <DataRow
            cfg={cfg}
            label="Issuer Wallet Address"
            value={result.issuer}
            mono
          />
          <DataRow
            cfg={cfg}
            label="User Wallet Address"
            value={result.user}
            mono
          />
          <DataRow
            cfg={cfg}
            label="Certificate Issued At"
            value={
              result.issuedAt
                ? new Date(Number(result.issuedAt)).toLocaleString()
                : "—"
            }
          />
          <DataRow
            cfg={cfg}
            label="Blockchain Tx"
            value={
              result.blockchainTxHash ? (
                <Link
                  href={`https://amoy.polygonscan.com/tx/${result.blockchainTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 text-blue-500 hover:text-blue-600"
                >
                  {result.blockchainTxHash}
                </Link>
              ) : (
                "—"
              )
            }
            mono
            last
          />
        </div>
      )}

      {/* Non-valid message */}
      {!isValid && result.message && (
        <div className="px-5 py-4">
          <p className="text-sm text-gray-600">{result.message}</p>
        </div>
      )}
    </div>
  );
}

function VerifiedFileSummary({ file }) {
  const sizeInKb = (file.size / 1024).toFixed(1);

  return (
    <div className="bg-white rounded-2xl border border-black/30 px-5 py-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
        <FileText className="w-[18px] h-[18px] text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
          Verified File
        </p>
        <p className="text-sm font-medium text-black truncate">{file.name}</p>
      </div>
      <span className="text-xs text-gray-400 shrink-0">{sizeInKb} KB</span>
    </div>
  );
}

function DataRow({ cfg, label, value, mono, last }) {
  return (
    <div className={cn("px-5 py-3.5", !last && cfg.dividerCls)}>
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-widest mb-1",
          cfg.labelCls,
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "leading-snug break-all",
          mono ? "font-mono text-xs" : "text-sm font-medium",
          cfg.valueCls,
        )}
      >
        {value || "—"}
      </p>
    </div>
  );
}
