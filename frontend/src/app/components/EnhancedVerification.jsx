"use client";

import { useState } from "react";
import { Shield, Loader2, AlertCircle } from "lucide-react";
import { calculateTrustScore } from "@/app/lib/aiEnhancedApi";
import TrustScoreDisplay from "./TrustScoreDisplay";

/**
 * Enhanced Verification Component
 * Adds AI-powered trust score to verification
 */
export default function EnhancedVerification({ certificateId, file }) {
  const [loading, setLoading] = useState(false);
  const [trustScore, setTrustScore] = useState(null);
  const [error, setError] = useState(null);

  const handleCalculateTrustScore = async () => {
    if (!file || !certificateId || loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await calculateTrustScore(file, certificateId);
      setTrustScore(result);
    } catch (err) {
      console.error("Trust score error:", err);
      setError(err.message || "Failed to calculate trust score");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Calculate Button */}
      {!trustScore && (
        <button
          onClick={handleCalculateTrustScore}
          disabled={loading}
          className="w-full rounded-lg bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Calculating Trust Score...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Shield className="h-5 w-5" />
              Calculate AI Trust Score
            </span>
          )}
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-red-900">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Trust Score Calculation Failed</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Trust Score Display */}
      {trustScore && <TrustScoreDisplay trustScoreData={trustScore} />}
    </div>
  );
}
