"use client";

import { useState } from "react";
import { Upload, FileText, Loader2, X, Table, Users } from "lucide-react";
import {
  extractText,
  extractStructuredData,
  extractTables,
} from "@/app/lib/aiEnhancedApi";

/**
 * Document Extractor Component
 * Extract text, structured data, and tables from documents
 */
export default function DocumentExtractor() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("text");
  const [results, setResults] = useState({
    text: null,
    structured: null,
    tables: null,
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResults({ text: null, structured: null, tables: null });
    }
  };

  const handleExtract = async (type) => {
    if (!file || loading) return;

    setLoading(true);
    setActiveTab(type);

    try {
      let result;
      switch (type) {
        case "text":
          result = await extractText(file);
          setResults((prev) => ({ ...prev, text: result }));
          break;
        case "structured":
          result = await extractStructuredData(file);
          setResults((prev) => ({ ...prev, structured: result }));
          break;
        case "tables":
          result = await extractTables(file);
          setResults((prev) => ({ ...prev, tables: result }));
          break;
      }
    } catch (error) {
      console.error("Extraction error:", error);
      alert(error.message || "Extraction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* File Upload */}
      <div className="relative rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-colors hover:border-gray-400 hover:bg-gray-100">
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={handleFileChange}
          className="hidden"
          id="extractor-file-input"
        />
        <label
          htmlFor="extractor-file-input"
          className="cursor-pointer space-y-3"
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">
              {file ? file.name : "Upload a document"}
            </p>
            <p className="text-xs text-gray-500">PDF or image files</p>
          </div>
        </label>
        {file && (
          <button
            onClick={() => setFile(null)}
            className="absolute top-2 right-2 rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-red-600"
            title="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Extraction Buttons */}
      {file && (
        <div className="grid gap-4 md:grid-cols-3">
          <button
            onClick={() => handleExtract("text")}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium transition-all hover:border-black/40 hover:bg-gray-50 disabled:bg-gray-100"
          >
            <FileText className="h-5 w-5" />
            Extract Text
          </button>
          <button
            onClick={() => handleExtract("structured")}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium transition-colors hover:bg-gray-50 disabled:bg-gray-100"
          >
            <Users className="h-5 w-5" />
            Extract Entities
          </button>
          <button
            onClick={() => handleExtract("tables")}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium transition-colors hover:bg-gray-50 disabled:bg-gray-100"
          >
            <Table className="h-5 w-5" />
            Extract Tables
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-gray-50 p-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
          <p className="text-gray-600">Extracting data...</p>
        </div>
      )}

      {/* Results */}
      {!loading && results[activeTab] && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          {activeTab === "text" && <TextResults data={results.text} />}
          {activeTab === "structured" && (
            <StructuredResults data={results.structured} />
          )}
          {activeTab === "tables" && <TablesResults data={results.tables} />}
        </div>
      )}
    </div>
  );
}

function TextResults({ data }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Extracted Text</h3>
        <div className="text-sm text-gray-500">
          {data.word_count} words • {data.page_count} pages
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto rounded-lg bg-gray-50 p-4">
        <pre className="whitespace-pre-wrap text-sm text-gray-700">
          {data.text}
        </pre>
      </div>
    </div>
  );
}

function StructuredResults({ data }) {
  const { entities, dates, document_ids, emails } = data;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Structured Data</h3>

      {entities.persons.length > 0 && (
        <div>
          <h4 className="mb-2 font-medium text-gray-700">Persons</h4>
          <div className="flex flex-wrap gap-2">
            {entities.persons.map((person, idx) => (
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

      {entities.organizations.length > 0 && (
        <div>
          <h4 className="mb-2 font-medium text-gray-700">Organizations</h4>
          <div className="flex flex-wrap gap-2">
            {entities.organizations.map((org, idx) => (
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

      {dates.length > 0 && (
        <div>
          <h4 className="mb-2 font-medium text-gray-700">Dates</h4>
          <div className="flex flex-wrap gap-2">
            {dates.map((date, idx) => (
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

      {document_ids.length > 0 && (
        <div>
          <h4 className="mb-2 font-medium text-gray-700">Document IDs</h4>
          <div className="flex flex-wrap gap-2">
            {document_ids.map((id, idx) => (
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

      {emails && emails.length > 0 && (
        <div>
          <h4 className="mb-2 font-medium text-gray-700">Email Addresses</h4>
          <div className="flex flex-wrap gap-2">
            {emails.map((email, idx) => (
              <span
                key={idx}
                className="rounded-full bg-pink-100 px-3 py-1 text-sm text-pink-800"
              >
                {email}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TablesResults({ data }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Extracted Tables</h3>
        <div className="text-sm text-gray-500">
          {data.table_count} table{data.table_count !== 1 ? "s" : ""} found
        </div>
      </div>

      {data.tables.map((table, idx) => (
        <div key={idx} className="space-y-2">
          <h4 className="font-medium text-gray-700">
            Table {table.table_number} (Page {table.page})
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
              <tbody className="divide-y divide-gray-200 bg-white">
                {table.data.map((row, ridx) => (
                  <tr key={ridx}>
                    {row.map((cell, cidx) => (
                      <td
                        key={cidx}
                        className="whitespace-nowrap px-4 py-2 text-sm text-gray-700"
                      >
                        {cell || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
