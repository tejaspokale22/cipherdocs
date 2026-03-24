"use client";

import { useState } from "react";
import { Upload, Loader2, FileText, ArrowRight } from "lucide-react";
import { checkSimilarity } from "@/app/lib/aiEnhancedApi";

/**
 * Similarity Checker Component
 * Compare two documents for similarity
 */
export default function SimilarityChecker() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCompare = async () => {
    if (!file1 || !file2 || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await checkSimilarity(file1, file2);
      setResult(data);
    } catch (error) {
      console.error("Similarity check error:", error);
      alert(error.message || "Similarity check failed");
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case "IDENTICAL":
        return "text-green-600 bg-green-50 border-green-200";
      case "SIMILAR":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "PARTIALLY_SIMILAR":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "DIFFERENT":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* File Uploads */}
      <div className="grid gap-6 md:grid-cols-2">
        <FileUploadBox
          label="First Document"
          file={file1}
          onChange={(f) => setFile1(f)}
        />
        <FileUploadBox
          label="Second Document"
          file={file2}
          onChange={(f) => setFile2(f)}
        />
      </div>

      {/* Compare Button */}
      {file1 && file2 && (
        <button
          onClick={handleCompare}
          disabled={loading}
          className="w-full rounded-lg bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Analyzing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Compare Documents
              <ArrowRight className="h-5 w-5" />
            </span>
          )}
        </button>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
          {/* Verdict */}
          <div
            className={`rounded-lg border-2 p-6 ${getVerdictColor(result.verdict)}`}
          >
            <div className="text-center">
              <h3 className="mb-2 text-2xl font-bold">
                {result.verdict.replace("_", " ")}
              </h3>
              <p className="text-4xl font-bold">
                {result.similarity_percentage.toFixed(1)}%
              </p>
              <p className="mt-1 text-sm opacity-80">Similarity</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Similarity Score</span>
              <span>{(result.similarity_score * 100).toFixed(1)}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                style={{ width: `${result.similarity_score * 100}%` }}
              />
            </div>
          </div>

          {/* Differences */}
          {result.differences && result.differences.length > 0 && (
            <div>
              <h4 className="mb-3 font-semibold text-gray-900">
                Key Differences
              </h4>
              <ul className="space-y-2">
                {result.differences.map((diff, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-900"
                  >
                    <span className="mt-0.5">•</span>
                    <span>{diff}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Common Elements */}
          {result.common_elements && result.common_elements.length > 0 && (
            <div>
              <h4 className="mb-3 font-semibold text-gray-900">
                Common Elements
              </h4>
              <ul className="space-y-2">
                {result.common_elements.map((elem, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-900"
                  >
                    <span className="mt-0.5">•</span>
                    <span>{elem}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FileUploadBox({ label, file, onChange }) {
  const handleChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onChange(selectedFile);
    }
  };

  return (
    <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6">
      <input
        type="file"
        accept=".pdf,image/*"
        onChange={handleChange}
        className="hidden"
        id={`file-${label}`}
      />
      <label htmlFor={`file-${label}`} className="cursor-pointer space-y-3">
        <div className="flex items-center justify-center">
          {file ? (
            <FileText className="h-10 w-10 text-green-600" />
          ) : (
            <Upload className="h-10 w-10 text-gray-400" />
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">{label}</p>
          <p className="mt-1 text-xs text-gray-500">
            {file ? file.name : "Click to upload"}
          </p>
        </div>
      </label>
      {file && (
        <button
          onClick={() => onChange(null)}
          className="mt-3 w-full text-sm text-red-600 hover:text-red-700"
        >
          Remove
        </button>
      )}
    </div>
  );
}
