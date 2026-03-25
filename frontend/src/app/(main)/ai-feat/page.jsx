"use client";

import { useState, useRef } from "react";
import {
  Upload,
  Sparkles,
  FileText,
  Users,
  ShieldCheck,
  MessageSquareText,
  GitCompareArrows,
  CloudUpload,
  FileUp,
} from "lucide-react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import { useAIOperation } from "@/app/hooks/useAIOperation";
import AIOperationWrapper from "@/app/components/AIOperationWrapper";
import { ResultDisplay } from "@/app/components/ErrorDisplay";
import {
  extractText,
  extractStructuredData,
  calculateTrustScore,
  askQuestion,
  checkSimilarity,
} from "@/app/lib/aiEnhancedApi";

/* ─── Reusable: File Drop Zone ───────────────────────────────── */
function FileDropZone({ file, onFileChange, accept = ".pdf,image/*", label = "Upload Document" }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onFileChange(dropped);
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 transition-colors cursor-pointer ${
        dragOver
          ? "border-black bg-gray-100"
          : file
            ? "border-green-400 bg-green-50"
            : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(e) => onFileChange(e.target.files?.[0])}
        className="hidden"
      />
      {file ? (
        <>
          <FileUp className="h-8 w-8 text-green-600" />
          <p className="text-sm font-medium text-green-700">{file.name}</p>
          <p className="text-xs text-green-600">Click or drop to replace</p>
        </>
      ) : (
        <>
          <CloudUpload className="h-8 w-8 text-gray-400" />
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-xs text-gray-400">Drag & drop or click to browse</p>
        </>
      )}
    </div>
  );
}

/* ─── Reusable: Action Button ────────────────────────────────── */
function ActionButton({ onClick, disabled, loading, loadingText, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl bg-black px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow-md active:scale-[0.98] disabled:pointer-events-none disabled:bg-gray-300 disabled:shadow-none"
    >
      {loading ? loadingText : children}
    </button>
  );
}

/* ─── Reusable: Section Header ───────────────────────────────── */
function SectionHeader({ title, description }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}

/* ─── Demo: Text Extraction ──────────────────────────────────── */
function TextExtractionDemo() {
  const [file, setFile] = useState(null);
  const { loading, error, result, execute } = useAIOperation();

  const handleExtract = async () => {
    if (!file) return;
    await execute(() => extractText(file));
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Text Extraction"
        description="Extract text from PDFs and images using Mixtral OCR"
      />
      <FileDropZone file={file} onFileChange={setFile} />
      <ActionButton onClick={handleExtract} disabled={!file || loading} loading={loading} loadingText="Extracting…">
        Extract Text
      </ActionButton>

      <AIOperationWrapper
        loading={loading}
        error={error}
        result={result}
        loadingMessage="Extracting text from document…"
        renderResult={(data) => (
          <ResultDisplay title="Extraction Results">
            <div className="space-y-3">
              <div className="flex gap-4 text-xs font-medium text-gray-500">
                <span>Words: {data.word_count}</span>
                <span>Pages: {data.page_count}</span>
              </div>
              <div className="max-h-80 overflow-y-auto rounded-lg bg-gray-50 p-4">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
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

/* ─── Demo: Entity Extraction ────────────────────────────────── */
function EntityExtractionDemo() {
  const [file, setFile] = useState(null);
  const { loading, error, result, execute } = useAIOperation();

  const handleExtract = async () => {
    if (!file) return;
    await execute(() => extractStructuredData(file));
  };

  const entityGroups = [
    { key: "persons", label: "Persons", color: "blue" },
    { key: "organizations", label: "Organizations", color: "green" },
  ];

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Entity Extraction"
        description="Extract names, dates, IDs, and other entities using NLP"
      />
      <FileDropZone file={file} onFileChange={setFile} />
      <ActionButton onClick={handleExtract} disabled={!file || loading} loading={loading} loadingText="Extracting…">
        Extract Entities
      </ActionButton>

      <AIOperationWrapper
        loading={loading}
        error={error}
        result={result}
        loadingMessage="Extracting entities…"
        renderResult={(data) => (
          <ResultDisplay title="Extracted Entities">
            <div className="space-y-4">
              {entityGroups.map(({ key, label, color }) =>
                data.entities?.[key]?.length > 0 ? (
                  <EntityGroup key={key} label={label} items={data.entities[key]} color={color} />
                ) : null
              )}
              {data.dates?.length > 0 && (
                <EntityGroup label="Dates" items={data.dates} color="purple" />
              )}
              {data.document_ids?.length > 0 && (
                <EntityGroup label="Document IDs" items={data.document_ids} color="yellow" />
              )}
            </div>
          </ResultDisplay>
        )}
      />
    </div>
  );
}

function EntityGroup({ label, items, color }) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    purple: "bg-purple-100 text-purple-800",
    yellow: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-gray-700">{label}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <span
            key={idx}
            className={`rounded-full px-3 py-1 text-xs font-medium ${colorMap[color]}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Demo: Trust Score ──────────────────────────────────────── */
function TrustScoreDemo() {
  const [file, setFile] = useState(null);
  const [certId, setCertId] = useState("");
  const { loading, error, result, execute } = useAIOperation();

  const handleCalculate = async () => {
    if (!file || !certId) return;
    await execute(() => calculateTrustScore(file, certId));
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Trust Score Calculator"
        description="Calculate document authenticity score (0–100)"
      />

      <div className="space-y-4">
        <FileDropZone file={file} onFileChange={setFile} accept=".pdf" label="Upload PDF Document" />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Certificate ID</label>
          <input
            type="text"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            placeholder="Enter certificate ID"
            className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      <ActionButton onClick={handleCalculate} disabled={!file || !certId || loading} loading={loading} loadingText="Calculating…">
        Calculate Trust Score
      </ActionButton>

      <AIOperationWrapper
        loading={loading}
        error={error}
        result={result}
        loadingMessage="Calculating trust score…"
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
                <div className="mt-2 text-sm font-medium text-gray-500">
                  {data.trust_level} Trust Level
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Content Similarity", value: data.similarity_score },
                  { label: "Structural Integrity", value: data.structural_score },
                  { label: "Metadata Consistency", value: data.metadata_score },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-gray-50 p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                    <div className="mt-1 text-xs text-gray-500">{item.label}</div>
                  </div>
                ))}
              </div>

              {/* Analysis */}
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="mb-1 text-sm font-semibold text-gray-700">Analysis</h4>
                <p className="text-sm leading-relaxed text-gray-600">{data.analysis}</p>
              </div>

              {/* Recommendations */}
              {data.recommendations?.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">Recommendations</h4>
                  <ul className="space-y-1.5">
                    {data.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-gray-600">• {rec}</li>
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

/* ─── Demo: Q&A ──────────────────────────────────────────────── */
function QADemo() {
  const [question, setQuestion] = useState("");
  const [certId, setCertId] = useState("");
  const { loading, error, result, execute } = useAIOperation();

  const handleAsk = async () => {
    if (!question || !certId) return;
    await execute(() => askQuestion(question, certId));
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Document Q&A"
        description="Ask questions about certificates using RAG"
      />

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Certificate ID</label>
          <input
            type="text"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            placeholder="Enter certificate ID"
            className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Your Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What is the issue date?"
            className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      <ActionButton onClick={handleAsk} disabled={!question || !certId || loading} loading={loading} loadingText="Asking…">
        Ask Question
      </ActionButton>

      <AIOperationWrapper
        loading={loading}
        error={error}
        result={result}
        loadingMessage="Finding answer…"
        renderResult={(data) => (
          <ResultDisplay title="Answer">
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-sm leading-relaxed text-gray-900">{data.answer}</p>
              </div>
              <div className="text-xs font-medium text-gray-500">
                Confidence: {(data.confidence * 100).toFixed(0)}%
              </div>
              {data.sources?.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">Sources</h4>
                  <div className="space-y-2">
                    {data.sources.map((source, idx) => (
                      <div key={idx} className="rounded-lg bg-gray-50 p-3">
                        <p className="text-sm text-gray-700">{source.text}</p>
                        <p className="mt-1 text-xs text-gray-400">
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

/* ─── Demo: Similarity ───────────────────────────────────────── */
function SimilarityDemo() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const { loading, error, result, execute } = useAIOperation();

  const handleCompare = async () => {
    if (!file1 || !file2) return;
    await execute(() => checkSimilarity(file1, file2));
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Document Similarity"
        description="Compare two documents for similarity"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">First Document</label>
          <FileDropZone file={file1} onFileChange={setFile1} label="Upload first document" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Second Document</label>
          <FileDropZone file={file2} onFileChange={setFile2} label="Upload second document" />
        </div>
      </div>

      <ActionButton onClick={handleCompare} disabled={!file1 || !file2 || loading} loading={loading} loadingText="Comparing…">
        Compare Documents
      </ActionButton>

      <AIOperationWrapper
        loading={loading}
        error={error}
        result={result}
        loadingMessage="Comparing documents…"
        renderResult={(data) => (
          <ResultDisplay>
            <div className="space-y-6">
              {/* Main Score */}
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900">
                  {data.similarity_percentage.toFixed(1)}%
                </div>
                <div className="mt-2 text-sm font-medium text-gray-500">{data.verdict}</div>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
                  style={{ width: `${data.similarity_percentage}%` }}
                />
              </div>

              {/* Differences */}
              {data.differences?.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">Key Differences</h4>
                  <ul className="space-y-1.5">
                    {data.differences.map((diff, idx) => (
                      <li key={idx} className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
                        • {diff}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common Elements */}
              {data.common_elements?.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-gray-700">Common Elements</h4>
                  <ul className="space-y-1.5">
                    {data.common_elements.map((elem, idx) => (
                      <li key={idx} className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
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

/* ─── Tab Config ─────────────────────────────────────────────── */
const DEMOS = [
  { id: "extract", label: "Text Extraction", icon: FileText, component: TextExtractionDemo },
  { id: "entities", label: "Entity Extraction", icon: Users, component: EntityExtractionDemo },
  { id: "trust", label: "Trust Score", icon: ShieldCheck, component: TrustScoreDemo },
  { id: "qa", label: "Q&A", icon: MessageSquareText, component: QADemo },
  { id: "similarity", label: "Similarity", icon: GitCompareArrows, component: SimilarityDemo },
];

/* ─── Main Page ──────────────────────────────────────────────── */
function AIDemoPage() {
  const [activeDemo, setActiveDemo] = useState("extract");
  const ActiveComponent = DEMOS.find((d) => d.id === activeDemo)?.component;

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="flex items-center justify-center gap-2 text-3xl font-bold tracking-tight text-gray-900">
            <Sparkles className="h-7 w-7" />
            AI Features
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex flex-wrap justify-center gap-1.5">
          {DEMOS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveDemo(id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeDemo === id
                  ? "bg-black text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Active Demo Panel */}
        <div className="rounded-2xl border border-black/30 bg-white p-6 sm:p-8">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
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
