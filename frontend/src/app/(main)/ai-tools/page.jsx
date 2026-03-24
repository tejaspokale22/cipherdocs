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

/**
 * AI Tools Page
 * Centralized page for all AI-powered features
 */
function AIToolsPage() {
  const [activeTab, setActiveTab] = useState("extractor");

  const tabs = [
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-black" />
            <h1 className="text-4xl font-bold text-gray-900">AI Tools</h1>
          </div>
          <p className="text-lg text-gray-600">
            Advanced AI-powered document analysis and processing
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 rounded-lg border-2 px-6 py-4 transition-all ${
                    activeTab === tab.id
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-semibold">{tab.label}</div>
                    <div className="text-xs opacity-80">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="rounded-lg bg-white p-8 shadow-sm">
          {activeTab === "extractor" && <DocumentExtractor />}
          {activeTab === "similarity" && <SimilarityChecker />}
        </div>

        {/* Info Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
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

function InfoCard({ icon: Icon, title, description }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <Icon className="mb-3 h-8 w-8 text-black" />
      <h3 className="mb-2 font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
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
