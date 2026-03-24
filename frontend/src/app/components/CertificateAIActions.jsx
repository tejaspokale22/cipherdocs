"use client";

import { useState } from "react";
import {
  Sparkles,
  FileText,
  Users,
  MessageSquare,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAIOperation } from "@/app/hooks/useAIOperation";
import AIOperationWrapper from "@/app/components/AIOperationWrapper";
import { ResultDisplay } from "@/app/components/ErrorDisplay";
import {
  extractText,
  extractStructuredData,
  askQuestion,
} from "@/app/lib/aiEnhancedApi";

/**
 * Certificate AI Actions Component
 * Integrated AI features for certificate actions in dashboards
 */
export default function CertificateAIActions({ certificate, fileBuffer }) {
  const [activeAction, setActiveAction] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const toggleAction = (action) => {
    if (activeAction === action) {
      setActiveAction(null);
    } else {
      setActiveAction(action);
      setExpanded(true);
    }
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-100"
      >
        <Sparkles className="h-4 w-4" />
        AI Actions
        <ChevronDown className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">AI Actions</h3>
        </div>
        <button
          onClick={() => {
            setExpanded(false);
            setActiveAction(null);
          }}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        <ActionButton
          icon={FileText}
          label="Extract Text"
          active={activeAction === "extract"}
          onClick={() => toggleAction("extract")}
        />
        <ActionButton
          icon={Users}
          label="Extract Entities"
          active={activeAction === "entities"}
          onClick={() => toggleAction("entities")}
        />
        <ActionButton
          icon={MessageSquare}
          label="Ask Question"
          active={activeAction === "qa"}
          onClick={() => toggleAction("qa")}
        />
      </div>

      {/* Active Action Content */}
      <div className="rounded-lg bg-white p-4">
        {activeAction === "extract" && (
          <ExtractTextAction certificate={certificate} fileBuffer={fileBuffer} />
        )}
        {activeAction === "entities" && (
          <ExtractEntitiesAction certificate={certificate} fileBuffer={fileBuffer} />
        )}
        {activeAction === "qa" && (
          <QuestionAnswerAction certificate={certificate} />
        )}
        {!activeAction && (
          <p className="text-center text-sm text-gray-500">
            Select an AI action above to get started
          </p>
        )}
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-purple-600 text-white"
          : "bg-white text-gray-700 hover:bg-gray-100"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

/**
 * Extract Text Action
 */
function ExtractTextAction({ certificate, fileBuffer }) {
  const { loading, error, result, execute } = useAIOperation();

  const handleExtract = async () => {
    if (!fileBuffer) {
      alert("Please download the certificate first");
      return;
    }
    const file = new File([fileBuffer], `${certificate.name}.pdf`, {
      type: "application/pdf",
    });
    await execute(() => extractText(file, certificate.contractCertificateId));
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-1 font-medium text-gray-900">Extract Text</h4>
        <p className="text-sm text-gray-600">
          Extract all text from this certificate using AI OCR
        </p>
      </div>

      {!result && (
        <button
          onClick={handleExtract}
          disabled={loading}
          className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? "Extracting..." : "Extract Text"}
        </button>
      )}

      <AIOperationWrapper
        loading={loading}
        error={error}
        result={result}
        loadingMessage="Extracting text..."
        renderResult={(data) => (
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Words: {data.word_count}</span>
              <span>Pages: {data.page_count}</span>
            </div>
            {data.indexed && (
              <div className="rounded-lg bg-green-50 p-2 text-xs text-green-700">
                ✓ Document indexed! You can now use "Ask Question" feature.
              </div>
            )}
            <div className="max-h-64 overflow-y-auto rounded-lg bg-gray-50 p-3">
              <pre className="whitespace-pre-wrap text-xs text-gray-700">
                {data.text}
              </pre>
            </div>
          </div>
        )}
      />
    </div>
  );
}

/**
 * Extract Entities Action
 */
function ExtractEntitiesAction({ certificate, fileBuffer }) {
  const { loading, error, result, execute } = useAIOperation();

  const handleExtract = async () => {
    if (!fileBuffer) {
      alert("Please download the certificate first");
      return;
    }
    const file = new File([fileBuffer], `${certificate.name}.pdf`, {
      type: "application/pdf",
    });
    await execute(() => extractStructuredData(file));
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-1 font-medium text-gray-900">Extract Entities</h4>
        <p className="text-sm text-gray-600">
          Extract names, dates, IDs, and other entities using NLP
        </p>
      </div>

      {!result && (
        <button
          onClick={handleExtract}
          disabled={loading}
          className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? "Extracting..." : "Extract Entities"}
        </button>
      )}

      <AIOperationWrapper
        loading={loading}
        error={error}
        result={result}
        loadingMessage="Extracting entities..."
        renderResult={(data) => (
          <div className="space-y-3">
            {data.entities.persons.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-gray-700">Persons</p>
                <div className="flex flex-wrap gap-2">
                  {data.entities.persons.map((person, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                    >
                      {person}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.dates.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-gray-700">Dates</p>
                <div className="flex flex-wrap gap-2">
                  {data.dates.map((date, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800"
                    >
                      {date}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.document_ids.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-gray-700">
                  Document IDs
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.document_ids.map((id, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800"
                    >
                      {id}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
}

/**
 * Question Answer Action
 */
function QuestionAnswerAction({ certificate }) {
  const [question, setQuestion] = useState("");
  const { loading, error, result, execute } = useAIOperation();

  const handleAsk = async () => {
    if (!question.trim()) return;
    await execute(() =>
      askQuestion(question, certificate.contractCertificateId),
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-1 font-medium text-gray-900">Ask Question</h4>
        <p className="text-sm text-gray-600">
          Ask anything about this certificate using AI
        </p>
        <p className="mt-1 text-xs text-blue-700 bg-blue-50 rounded p-2">
          💡 Tip: Extract text first to automatically index this certificate for better answers.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What is the issue date?"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          onKeyPress={(e) => e.key === "Enter" && handleAsk()}
        />
        <button
          onClick={handleAsk}
          disabled={!question.trim() || loading}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? "..." : "Ask"}
        </button>
      </div>

      <AIOperationWrapper
        loading={loading}
        error={error}
        result={result}
        loadingMessage="Finding answer..."
        renderResult={(data) => (
          <div className="space-y-3">
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-sm text-gray-900">{data.answer}</p>
            </div>
            <p className="text-xs text-gray-600">
              Confidence: {(data.confidence * 100).toFixed(0)}%
            </p>
          </div>
        )}
      />
    </div>
  );
}

