"use client";

import { useState, useEffect } from "react";
import { Shield, Upload, AlertCircle } from "lucide-react";
import { useAIOperation } from "@/app/hooks/useAIOperation";
import AIOperationWrapper from "./AIOperationWrapper";
import { calculateTrustScore } from "@/app/lib/aiEnhancedApi";

/**
 * Trust Score Component for Verification Page
 *
 * This component allows users to upload a document and compare it with
 * the original certificate using semantic similarity and AI analysis.
 *
 * Usage:
 * <VerificationTrustScore originalCertificateId="cert_id_123" verificationFile={file} />
 */
export default function VerificationTrustScore({
  originalCertificateId,
  verificationFile,
}) {
  const [uploadedFile, setUploadedFile] = useState(verificationFile || null);
  const [autoCalculated, setAutoCalculated] = useState(false);
  const { loading, error, result, execute, reset } = useAIOperation();

  // Auto-calculate trust score when verification file is provided
  useEffect(() => {
    if (verificationFile && !autoCalculated && !loading && !result) {
      setUploadedFile(verificationFile);
      setAutoCalculated(true);
      // Auto-calculate after a short delay to let the UI render
      setTimeout(() => {
        execute(() =>
          calculateTrustScore(verificationFile, originalCertificateId),
        );
      }, 500);
    }
  }, [
    verificationFile,
    autoCalculated,
    loading,
    result,
    originalCertificateId,
    execute,
  ]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];
      if (!validTypes.includes(file.type)) {
        alert("Please upload a PDF or image file (JPG, PNG)");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      setUploadedFile(file);
    }
  };

  const handleCalculate = async () => {
    if (!uploadedFile) {
      alert("Please upload a document first");
      return;
    }

    await execute(() =>
      calculateTrustScore(uploadedFile, originalCertificateId),
    );
  };

  const handleReset = () => {
    setUploadedFile(null);
    setAutoCalculated(false);
    reset(); // Reset the AI operation state
  };

  return (
    <div className="rounded-lg border border-black/30 bg-white p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          AI Trust Score
        </h3>
      </div>

      {/* Description */}
      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        {verificationFile ? (
          <>
            Using the uploaded verification document to calculate trust score.
            Our AI will analyze semantic similarity, structure, and metadata to
            calculate a trust score (0-100).
          </>
        ) : (
          <>
            Upload a document to verify its authenticity against the original
            certificate. Our AI will analyze semantic similarity, structure, and
            metadata to calculate a trust score (0-100).
          </>
        )}
      </p>

      {/* File Upload Section */}
      {!result && (
        <div className="mt-5 space-y-5">
          {/* Upload Area */}
          <label className="block">
            <div
              className={`flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${uploadedFile
                ? "border-green-500 bg-green-50"
                : "border-gray-300 bg-gray-50 hover:border-gray-400"
                }`}
            >
              <div className="text-center">
                <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                {uploadedFile ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {uploadedFile.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Click to upload document
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      PDF, JPG, or PNG (max 10MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {uploadedFile && (
            <div className="flex gap-3">
              <button
                onClick={handleCalculate}
                disabled={loading}
                className="flex-1 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400 cursor-pointer"
              >
                {loading ? "Analyzing..." : "Calculate Trust Score"}
              </button>
              <button
                onClick={handleReset}
                disabled={loading}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:bg-gray-100 cursor-pointer"
              >
                Reset
              </button>
            </div>
          )}

          {/* How It Works */}
          <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
            <div className="text-xs leading-relaxed text-blue-900">
              <p className="font-medium">How it works:</p>
              <ul className="mt-1.5 list-inside list-disc space-y-1">
                <li>Extracts text from both documents</li>
                <li>Compares semantic similarity using AI embeddings</li>
                <li>Analyzes document structure and metadata</li>
                <li>Generates a comprehensive trust score (0-100)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      <AIOperationWrapper
        loading={loading}
        error={error}
        result={result}
        loadingMessage="Analyzing document authenticity..."
        renderResult={(data) => (
          <div className="space-y-6 mt-4">
            {/* Trust Score Display */}
            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 p-6 text-center">
              <div
                className={`mb-2 text-5xl font-bold ${data.trust_level === "HIGH"
                  ? "text-green-600"
                  : data.trust_level === "MEDIUM"
                    ? "text-yellow-600"
                    : "text-red-600"
                  }`}
              >
                {data.trust_score}
              </div>
              <div className="mb-1 text-lg font-semibold text-gray-900">
                {data.trust_level} Trust Level
              </div>
              <div className="text-sm text-gray-600">
                {data.trust_level === "HIGH" && "✓ Document appears authentic"}
                {data.trust_level === "MEDIUM" &&
                  "⚠ Document may have minor differences"}
                {data.trust_level === "LOW" &&
                  "✗ Document has significant differences"}
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                <div className="mb-1 text-2xl font-bold text-gray-900">
                  {data.similarity_score}
                </div>
                <div className="text-xs font-medium text-gray-600">
                  Text Similarity
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Semantic content match
                </div>
              </div>
              <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                <div className="mb-1 text-2xl font-bold text-gray-900">
                  {data.structural_score}
                </div>
                <div className="text-xs font-medium text-gray-600">
                  Structure
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Format & layout match
                </div>
              </div>
              <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                <div className="mb-1 text-2xl font-bold text-gray-900">
                  {data.metadata_score}
                </div>
                <div className="text-xs font-medium text-gray-600">
                  Metadata
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Properties match
                </div>
              </div>
            </div>

            {/* Analysis Details */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 text-sm font-semibold text-gray-900">
                Detailed Analysis
              </h4>
              <p className="text-sm leading-relaxed text-gray-700">
                {data.analysis}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Verify Another Document
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
}
