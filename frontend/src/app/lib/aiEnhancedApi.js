/**
 * AI Enhanced API Client
 * Handles communication with Node.js backend AI-enhanced endpoints
 */

const backendBase = process.env.NEXT_PUBLIC_API_URL;

/**
 * Extract text from document
 */
export async function extractText(file, certificateId = null) {
  const formData = new FormData();
  formData.append("file", file);
  if (certificateId) {
    formData.append("certificate_id", certificateId);
  }

  const res = await fetch(`${backendBase}/api/ai-enhanced/extract/text`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Text extraction failed");
  }
  return data;
}

/**
 * Extract structured data (entities, dates, IDs) from document
 */
export async function extractStructuredData(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    `${backendBase}/api/ai-enhanced/extract/structured`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    },
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Structured data extraction failed");
  }
  return data;
}

/**
 * Extract tables from PDF
 */
export async function extractTables(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${backendBase}/api/ai-enhanced/extract/tables`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Table extraction failed");
  }
  return data;
}

/**
 * Ask a question about a document using RAG
 */
export async function askQuestion(question, certificateId = null, topK = 5) {
  const res = await fetch(`${backendBase}/api/ai-enhanced/question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      question,
      certificate_id: certificateId,
      top_k: topK,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Question answering failed");
  }
  return data;
}

/**
 * Chat with document context
 */
export async function chatWithDocument(
  message,
  certificateId = null,
  history = [],
) {
  const res = await fetch(`${backendBase}/api/ai-enhanced/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      message,
      certificate_id: certificateId,
      history,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Chat failed");
  }
  return data;
}

/**
 * Semantic search across documents
 */
export async function semanticSearch(
  query,
  certificateId = null,
  topK = 10,
) {
  const res = await fetch(`${backendBase}/api/ai-enhanced/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      query,
      certificate_id: certificateId,
      top_k: topK,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Search failed");
  }
  return data;
}

/**
 * Calculate trust score for uploaded document
 */
export async function calculateTrustScore(file, certificateId) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("certificate_id", certificateId);

  const res = await fetch(`${backendBase}/api/ai-enhanced/trust-score`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Trust score calculation failed");
  }
  return data;
}

/**
 * Check similarity between two documents
 */
export async function checkSimilarity(file1, file2) {
  const formData = new FormData();
  formData.append("file1", file1);
  formData.append("file2", file2);

  const res = await fetch(`${backendBase}/api/ai-enhanced/similarity`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Similarity check failed");
  }
  return data;
}

/**
 * Verify document authenticity
 */
export async function verifyAuthenticity(file, certificateId) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("certificate_id", certificateId);

  const res = await fetch(
    `${backendBase}/api/ai-enhanced/verify-authenticity`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    },
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Authenticity verification failed");
  }
  return data;
}

/**
 * Index document for RAG
 */
export async function indexDocument(file, certificateId, metadata = {}) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("certificate_id", certificateId);
  formData.append("metadata", JSON.stringify(metadata));

  const res = await fetch(`${backendBase}/api/ai-enhanced/index`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Document indexing failed");
  }
  return data;
}

/**
 * Delete document from vector store
 */
export async function deleteDocument(certificateId) {
  const res = await fetch(
    `${backendBase}/api/ai-enhanced/document/${certificateId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Document deletion failed");
  }
  return data;
}

/**
 * Get document statistics
 */
export async function getDocumentStats(certificateId) {
  const res = await fetch(
    `${backendBase}/api/ai-enhanced/stats/${certificateId}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Failed to get document stats");
  }
  return data;
}
