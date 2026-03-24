"use client";

import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

/**
 * Trust Score Display Component
 * Shows trust score with visual indicators
 */
export default function TrustScoreDisplay({ trustScoreData }) {
  if (!trustScoreData) return null;

  const {
    trust_score,
    trust_level,
    similarity_score,
    structural_score,
    metadata_score,
    analysis,
    recommendations,
  } = trustScoreData;

  // Determine color and icon based on trust level
  const getLevelConfig = (level) => {
    switch (level) {
      case "HIGH":
        return {
          color: "text-green-600",
          bg: "bg-green-50",
          border: "border-green-200",
          icon: CheckCircle,
          label: "High Trust",
        };
      case "MEDIUM":
        return {
          color: "text-yellow-600",
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          icon: AlertTriangle,
          label: "Medium Trust",
        };
      case "LOW":
        return {
          color: "text-red-600",
          bg: "bg-red-50",
          border: "border-red-200",
          icon: XCircle,
          label: "Low Trust",
        };
      default:
        return {
          color: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-200",
          icon: Shield,
          label: "Unknown",
        };
    }
  };

  const config = getLevelConfig(trust_level);
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      {/* Main Trust Score */}
      <div
        className={`rounded-lg border-2 ${config.border} ${config.bg} p-6`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={`h-8 w-8 ${config.color}`} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Trust Score
              </h3>
              <p className={`text-sm font-medium ${config.color}`}>
                {config.label}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${config.color}`}>
              {trust_score}
            </div>
            <div className="text-sm text-gray-500">out of 100</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full transition-all duration-500 ${
              trust_level === "HIGH"
                ? "bg-green-600"
                : trust_level === "MEDIUM"
                  ? "bg-yellow-600"
                  : "bg-red-600"
            }`}
            style={{ width: `${trust_score}%` }}
          />
        </div>
      </div>

      {/* Detailed Scores */}
      <div className="grid gap-4 md:grid-cols-3">
        <ScoreCard
          title="Content Similarity"
          score={similarity_score}
          description="Text matching with original"
        />
        <ScoreCard
          title="Structural Integrity"
          score={structural_score}
          description="Layout and format consistency"
        />
        <ScoreCard
          title="Metadata Consistency"
          score={metadata_score}
          description="Document properties match"
        />
      </div>

      {/* Analysis */}
      {analysis && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h4 className="mb-3 font-semibold text-gray-900">Analysis</h4>
          <p className="text-sm leading-relaxed text-gray-700">{analysis}</p>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h4 className="mb-3 font-semibold text-gray-900">Recommendations</h4>
          <ul className="space-y-2">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <span className="mt-1 text-gray-400">•</span>
                <span className="text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ title, score, description }) {
  const getColor = (score) => {
    if (score >= 85) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <h5 className="text-sm font-medium text-gray-700">{title}</h5>
        <span className={`text-2xl font-bold ${getColor(score)}`}>
          {score}
        </span>
      </div>
      <p className="text-xs text-gray-500">{description}</p>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full transition-all ${
            score >= 85
              ? "bg-green-600"
              : score >= 60
                ? "bg-yellow-600"
                : "bg-red-600"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
