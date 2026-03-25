"use client";

import { useState } from "react";
import {
  FileText,
  MessageSquare,
  Shield,
  GitCompare,
  Sparkles,
} from "lucide-react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import DocumentExtractor from "@/app/components/DocumentExtractor";
import SimilarityChecker from "@/app/components/SimilarityChecker";

/* ─── Tab Config ─────────────────────────────────────────────── */
const TABS = [
  {
    id: "extractor",
    label: "Document Extractor",
    icon: FileText,
    description: "Extract text, entities, and tables from documents",
  },
  {
    id: "similarity",
    label: "Similarity Checker",
    icon: GitCompare,
    description: "Compare two documents for similarity",
  },
];

/* ─── Info Card ──────────────────────────────────────────────── */
function InfoCard({ icon: Icon, title, description }) {
  return (
    <div className="rounded-xl border border-black/30 bg-white p-6 transition-colors hover:bg-gray-50">
      <Icon className="mb-3 h-7 w-7 text-black" />
      <h3 className="mb-1.5 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="text-xs leading-relaxed text-gray-500">{description}</p>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
function AIToolsPage() {
  const [activeTab, setActiveTab] = useState("extractor");

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="flex items-center justify-center gap-2 text-3xl font-bold tracking-tight text-gray-900">
            <Sparkles className="h-7 w-7" />
            AI Tools
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex flex-wrap justify-center gap-1.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === id
                  ? "bg-black text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="rounded-2xl border border-black/30 bg-white p-6 sm:p-8">
          {activeTab === "extractor" && <DocumentExtractor />}
          {activeTab === "similarity" && <SimilarityChecker />}
        </div>

        {/* Info Cards */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <InfoCard
            icon={Shield}
            title="Trust Score"
            description="Calculate authenticity scores for uploaded documents with detailed analysis"
          />
          <InfoCard
            icon={MessageSquare}
            title="Document Q&A"
            description="Ask questions about your certificates using AI-powered search"
          />
          <InfoCard
            icon={Sparkles}
            title="Smart Extraction"
            description="Extract entities, dates, tables, and structured data from any document"
          />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ProtectedRoute>
      <AIToolsPage />
    </ProtectedRoute>
  );
}
