"use client";

import { useState } from "react";
import { Upload, Sparkles } from "lucide-react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useAIOperation } from "@/app/hooks/useAIOperation";
import AIOperationWrapper from "@/app/components/AIOperationWrapper";
import { ErrorDisplay, LoadingDisplay, ResultDisplay } from "@/app/components/ErrorDisplay";
import {
  extractText,
  extractStructuredData,
  calculateTrustScore,
  askQuestion,
  checkSimilarity,
} from "@/app/lib/aiEnhancedApi";

/**
 * AI Demo Page
 * Demonstrates all AI features with browser UI display
 */
function AIDemoPage() {
  const [activeDemo, setActiveDemo] = useState("extract");

  const demos = [
    { id: "extract", label: "Text Extraction", component: TextExtractionDemo },
    { id: "entities", label: "Entity Extraction", component: EntityExtractionDemo },
    { id: "trust", label: "Trust Score", component: TrustScoreDemo },
    { id: "qa", label: "Q&A", component: QADemo },
    { id: "similarity", label: "Similarity Check", component: SimilarityDemo },
  ];

  const ActiveComponent = demos.find((d) => d.id === activeDemo)?.component;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-black" />
            <h1 className="text-4xl font-bold text-gray-900">AI Features Demo</h1>
          </div>
          <p className="text-lg text-gray-600">
            All results are displayed in the browser - no console.log needed!
          </p>
        </div>

        {/* Demo Selector */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {demos.map((demo) => (
            <button
              key={demo.id}
              onClick={() => setActiveDemo(demo.id)}
              className={`rounded-lg px-6 py-3 font-medium transition-all ${
                activeDemo === demo.id
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {demo.label}
            </button>
          ))}
        </div>

        {/* Active Demo */}
        <div className="rounded-lg bg-white p-8 shadow-sm">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
}

/**
 * Text Extraction Demo
 */
function TextExtractionDemo() {
  const [file, setFile] = useState(null);
  const { loading, error, result, execute } = useAIOperation();

  const handleExtract = async () => {
    if (!file) return;
    await execute(() => extractText(file));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold">Text Extraction</h2>
        <p className="text-gray-600">
          Extract text from PDFs and images using Mixtral OCR
        </p>
      </div>

      {/* File Upload */}
      <div>
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => setFile(e.target.files?.[0])}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        {file && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: {file.name}
          </p>
        )}
      </div>

      {/* Extract Button */}
      <button
        onClick={handleExtract}
        disabled={!file || loading}
        className="w-full rounded-lg bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400"
      >
        {loading ? "Extracting..." : "Extract Text"}
      </button>

      {/* Results */}
      <AIOperationWrapper
        loading={loading}
        error={error}
        result={result}
        loadingMessage="Extracting text from document..."
        renderResult={(data) => (
          <ResultDisplay title="Extraction Results">
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Words: {data.word_count}</span>
                <span>Pages: {data.page_count}</span>
              </div>
              <div className="max-h-96 overflow-y-auto rounded-lg bg-gray-50 p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">
                  {data.text}
                </pre>
              </div>
            </div>
          </ResultDisplay>
        )}
      />
    </div>
  );
}

/**
 * Entity Extraction Demo
 */
function EntityExtractionDemo() {
  const [file, setFile] = useState(null);
  const { loading, error, result, execute } = useAIOperation();

  const handleExtract = async () => {
    if (!file) return;
    await execute(() => extractStructuredData(file));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold">Entity Extraction</h2>
        <p className="text-gray-600">
          Extract names, dates, IDs, and other entities using NLP
        </p>
      </div>

      <div>
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => setFile(e.target.files?.[0])}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <button
        onClick={handleExtract}
        disabled={!file || loading}
        className="w-full rounded-lg bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400"
      >
        {loading ? "Extracting..." : "Extract Entities"}
      </button>

      <AIOperationWrapper
        loading={loading}
        error={error}
        result={result}
        loadingMessage="Extracting entities..."
        renderResult={(data) => (
          <ResultDisplay title="Extracted Entities">
            <div className="space-y-4">
              {data.entities.persons.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium text-gray-700">Persons</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.entities.persons.map((person, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                      >
                        {person}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {data.entities.organizations.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium text-gray-700">Organizations</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.entities.organizations.map((org, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
                      >
                        {org}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {data.dates.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium text-gray-700">Dates</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.dates.map((date, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800"
                      >
                        {date}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {data.document_ids.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium text-gray-700">Document IDs</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.document_ids.map((id, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-800"
                      >
                        {id}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ResultDisplay>
        )}
      />
    </div>
  );
}

/**
 * Trust Score Demo
 */
function TrustScoreDemo() {
  const [file, setFile] = useState(null);
  const [certId, setCertId] = useState("");
  const { loading, error, result, execute } = useAIOperation();

  const handleCalculate = async () => {
    if (!file || !certId) return;
    await execute(() => calculateTrustScore(file, certId));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold">Trust Score Calculator</h2>
        <p className="text-gray-600">
          Calculate document authenticity score (0-100)
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Upload Document
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0])}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Certificate ID
          </label>
          <input
            type="text"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            placeholder="Enter certificate ID"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <button
        onClick={handleCalculate}
        disabled={!file || !certId || loading}
        className="w-full rounded-lg bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400"
      >
        {loading ? "Calculating..." : "Calculate Trust Score"}
      </button>

      <AIOperationWrapper
        loading={loading}
        error={error}
        result={result}
        loadingMessage="Calculating trust score..."
        renderResult={(data) => (
          <ResultDisplay>
            <div className="space-y-6">
              {/* Main Score */}
              <div className="text-center">
                <div
                  className={`text-6xl font-bold ${
                    data.trust_level === "HIGH"
                      ? "text-green-600"
                      : data.trust_level === "MEDIUM"
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {data.trust_score}
                </div>
                <div className="mt-2 text-lg font-medium text-gray-600">
                  {data.trust_level} Trust Level
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {data.similarity_score}
                  </div>
                  <div className="text-sm text-gray-600">Content Similarity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {data.structural_score}
                  </div>
                  <div className="text-sm text-gray-600">Structural Integrity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {data.metadata_score}
                  </div>
                  <div className="text-sm text-gray-600">Metadata Consistency</div>
                </div>
              </div>

              {/* Analysis */}
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-2 font-medium">Analysis</h4>
                <p className="text-sm text-gray-700">{data.analysis}</p>
              </div>

              {/* Recommendations */}
              {data.recommendations && data.recommendations.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">Recommendations</h4>
                  <ul className="space-y-1">
                    {data.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ResultDisplay>
        )}
      />
    </div>
  );
}

/**
 * Q&A Demo
 */
function QADemo() {
  const [question, setQuestion] = useState("");
  const [certId, setCertId] = useState("");
  const { loading, error, result, execute } = useAIOperation();

  const handleAsk = async () => {
    if (!question || !certId) return;
    await execute(() => askQuestion(question, certId));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold">Document Q&A</h2>
        <p className="text-gray-600">
          Ask questions about certificates using RAG
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Certificate ID
          </label>
          <input
            type="text"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            placeholder="Enter certificate ID"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Your Question
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What is the issue date?"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <button
        onClick={handleAsk}
        disabled={!question || !certId || loading}
        className="w-full rounded-lg bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400"
      >
        {loading ? "Asking..." : "Ask Question"}
      </button>

      <AIOperationWrapper
        loading={loading}
        error={error}
        result={result}
        loadingMessage="Finding answer..."
        renderResult={(data) => (
          <ResultDisplay title="Answer">
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-gray-900">{data.answer}</p>
              </div>

              <div className="text-sm text-gray-600">
                Confidence: {(data.confidence * 100).toFixed(0)}%
              </div>

              {data.sources && data.sources.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">Sources</h4>
                  <div className="space-y-2">
                    {data.sources.map((source, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg bg-gray-50 p-3 text-sm"
                      >
                        <p className="text-gray-700">{source.text}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          Relevance: {(source.score * 100).toFixed(0)}%
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ResultDisplay>
        )}
      />
    </div>
  );
}

/**
 * Similarity Demo
 */
function SimilarityDemo() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const { loading, error, result, execute } = useAIOperation();

  const handleCompare = async () => {
    if (!file1 || !file2) return;
    await execute(() => checkSimilarity(file1, file2));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold">Document Similarity</h2>
        <p className="text-gray-600">
          Compare two documents for similarity
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            First Document
          </label>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setFile1(e.target.files?.[0])}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          {file1 && (
            <p className="mt-1 text-xs text-gray-600">{file1.name}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Second Document
          </label>
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setFile2(e.target.files?.[0])}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          {file2 && (
            <p className="mt-1 text-xs text-gray-600">{file2.name}</p>
          )}
        </div>
      </div>

      <button
        onClick={handleCompare}
        disabled={!file1 || !file2 || loading}
        className="w-full rounded-lg bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400"
      >
        {loading ? "Comparing..." : "Compare Documents"}
      </button>

      <AIOperationWrapper
        loading={loading}
        error={error}
        result={result}
        loadingMessage="Comparing documents..."
        renderResult={(data) => (
          <ResultDisplay>
            <div className="space-y-6">
              {/* Main Result */}
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900">
                  {data.similarity_percentage.toFixed(1)}%
                </div>
                <div className="mt-2 text-lg font-medium text-gray-600">
                  {data.verdict}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                  style={{ width: `${data.similarity_percentage}%` }}
                />
              </div>

              {/* Differences */}
              {data.differences && data.differences.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">Key Differences</h4>
                  <ul className="space-y-1">
                    {data.differences.map((diff, idx) => (
                      <li
                        key={idx}
                        className="rounded-lg bg-red-50 p-2 text-sm text-red-900"
                      >
                        • {diff}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common Elements */}
              {data.common_elements && data.common_elements.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">Common Elements</h4>
                  <ul className="space-y-1">
                    {data.common_elements.map((elem, idx) => (
                      <li
                        key={idx}
                        className="rounded-lg bg-green-50 p-2 text-sm text-green-900"
                      >
                        • {elem}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ResultDisplay>
        )}
      />
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute>
      <AIDemoPage />
    </ProtectedRoute>
  );
}
