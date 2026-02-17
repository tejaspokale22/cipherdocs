"use client";

import { useParams } from "next/navigation";
import { useState, useRef } from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

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

      const res = await fetch("http://localhost:5000/api/certificates/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certId,
          originalDocumentHash: hashHex,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Verification failed");
      }

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

  const statusStyles = {
    valid: "border-green-500 bg-green-50 text-green-800",
    revoked: "border-red-500 bg-red-50 text-red-800",
    expired: "border-orange-500 bg-orange-50 text-orange-800",
    tampered: "border-red-500 bg-red-50 text-red-800",
    error: "border-red-500 bg-red-50 text-red-800",
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-6xl mx-auto px-6 py-28">
        {/* header */}
        <header className="text-center mb-6">
          <h1 className="text-4xl font-semibold tracking-tight">
            Verify Certificate Authenticity
          </h1>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Upload the original PDF certificate to validate its authenticity
            against immutable blockchain records.
          </p>
        </header>

        {/* upload card */}
        <div className="flex justify-center">
          <div
            className={cn(
              "w-full max-w-2xl border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-300 cursor-pointer",
              dragActive
                ? "border-black bg-gray-100 scale-[1.01]"
                : "border-gray-300 hover:border-black",
            )}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
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

            <p className="text-lg font-medium">
              Drag & drop PDF here or click to browse
            </p>

            <p className="mt-3 text-sm text-gray-500">
              Only PDF files are supported
            </p>

            {file && (
              <p className="mt-6 text-sm text-gray-700">
                Selected file: <span className="font-medium">{file.name}</span>
              </p>
            )}
          </div>
        </div>

        {/* loading */}
        {loading && (
          <div className="mt-12 text-center text-gray-600 animate-pulse">
            Verifying certificate...
          </div>
        )}

        {/* error */}
        {error && <div className="mt-12 text-center text-red-600">{error}</div>}

        {/* result */}
        {result?.status && (
          <section
            className={cn(
              "mt-20 border-2 rounded-3xl p-8 transition-all duration-300",
              statusStyles[result.status],
            )}
          >
            <h2 className="text-2xl font-semibold capitalize">
              {result.status === "valid"
                ? "Certificate Verified"
                : result.status}
            </h2>

            {result.status === "valid" && (
              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 text-sm">
                <InfoBlock label="Issuer Wallet" value={result.issuer} />
                <InfoBlock label="User Wallet" value={result.user} />
                <InfoBlock
                  label="Issued At"
                  value={
                    result.issuedAt
                      ? new Date(Number(result.issuedAt)).toLocaleString()
                      : "-"
                  }
                />
                <InfoBlock
                  label="Blockchain Transaction"
                  value={result.blockchainTxHash}
                />
              </div>
            )}

            {result.message && <p className="mt-8 text-sm">{result.message}</p>}
          </section>
        )}
      </div>
    </div>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="mt-2 break-all font-medium">{value}</p>
    </div>
  );
}
