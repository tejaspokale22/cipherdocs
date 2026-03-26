/**
 * AI Service Client
 * Handles communication with Python FastAPI AI microservice
 */

import axios from "axios";
import FormData from "form-data";

// Helper function to get axios client with current env vars
function getAIServiceClient() {
  const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
  const AI_SERVICE_API_KEY = process.env.AI_SERVICE_API_KEY;

  if (!AI_SERVICE_API_KEY) {
    console.error("⚠️ AI_SERVICE_API_KEY is not set in backend/.env");
    throw new Error("⚠️ AI_SERVICE_API_KEY is not configured");
  }

  return axios.create({
    baseURL: AI_SERVICE_URL,
    headers: {
      "X-API-Key": AI_SERVICE_API_KEY,
    },
    timeout: 60000,
  });
}

/**
 * Extract text from document
 */
export async function extractText(fileBuffer, filename) {
  try {
    const client = getAIServiceClient();
    const formData = new FormData();
    formData.append("file", fileBuffer, filename);

    const response = await client.post(
      "/api/v1/extract/text",
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    return response.data;
  } catch (error) {
    console.error("Text extraction failed:", error.message);
    throw new Error("Failed to extract text from document");
  }
}

/**
 * Extract structured data (entities, dates, IDs) from document
 */
export async function extractStructuredData(fileBuffer, filename) {
  try {
    const client = getAIServiceClient();
    const formData = new FormData();
    formData.append("file", fileBuffer, filename);

    const response = await client.post(
      "/api/v1/extract/structured",
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    return response.data;
  } catch (error) {
    console.error("Structured data extraction failed:", error.message);
    throw new Error("Failed to extract structured data");
  }
}

/**
 * Extract tables from PDF
 */
export async function extractTables(fileBuffer, filename) {
  try {
    const client = getAIServiceClient();
    const formData = new FormData();
    formData.append("file", fileBuffer, filename);

    const response = await client.post(
      "/api/v1/extract/tables",
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    return response.data;
  } catch (error) {
    console.error("Table extraction failed:", error.message);
    throw new Error("Failed to extract tables");
  }
}

/**
 * Ask a question about a document using RAG
 */
export async function askQuestion(question, certificateId, userId, topK = 5) {
  try {
    const client = getAIServiceClient();
    const response = await client.post("/api/v1/rag/question", {
      question,
      certificate_id: certificateId,
      user_id: userId,
      top_k: topK,
    });

    return response.data;
  } catch (error) {
    console.error("Question answering failed:", error.message);
    throw new Error("Failed to answer question");
  }
}

/**
 * Chat with document context
 */
export async function chatWithDocument(
  message,
  certificateId,
  userId,
  history = [],
) {
  try {
    const client = getAIServiceClient();
    const response = await client.post("/api/v1/rag/chat", {
      message,
      certificate_id: certificateId,
      user_id: userId,
      history,
    });

    return response.data;
  } catch (error) {
    console.error("Chat failed:", error.message);
    throw new Error("Failed to process chat message");
  }
}

/**
 * Semantic search across documents
 */
export async function semanticSearch(query, userId, certificateId = null, topK = 10) {
  try {
    const client = getAIServiceClient();
    const response = await client.post("/api/v1/rag/search", {
      query,
      user_id: userId,
      certificate_id: certificateId,
      top_k: topK,
    });

    return response.data;
  } catch (error) {
    console.error("Semantic search failed:", error.message);
    throw new Error("Failed to perform semantic search");
  }
}

/**
 * Calculate trust score for uploaded document
 */
export async function calculateTrustScore(
  uploadedFileBuffer,
  uploadedFilename,
  certificateId,
  originalFileBuffer = null,
) {
  try {
    const client = getAIServiceClient();
    const formData = new FormData();
    formData.append("uploaded_file", uploadedFileBuffer, uploadedFilename);
    formData.append("certificate_id", certificateId);

    if (originalFileBuffer) {
      formData.append("original_file", originalFileBuffer, "original.pdf");
    }

    const response = await client.post(
      "/api/v1/trust/score",
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    return response.data;
  } catch (error) {
    console.error("Trust score calculation failed:", error.message);
    throw new Error("Failed to calculate trust score");
  }
}

/**
 * Check similarity between two documents
 */
export async function checkSimilarity(
  file1Buffer,
  file1Name,
  file2Buffer,
  file2Name,
) {
  try {
    const client = getAIServiceClient();
    const formData = new FormData();
    formData.append("file1", file1Buffer, file1Name);
    formData.append("file2", file2Buffer, file2Name);

    const response = await client.post(
      "/api/v1/trust/similarity",
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    return response.data;
  } catch (error) {
    console.error("Similarity check failed:", error.message);
    throw new Error("Failed to check similarity");
  }
}

/**
 * Verify document authenticity
 */
export async function verifyAuthenticity(
  fileBuffer,
  filename,
  certificateId,
) {
  try {
    const client = getAIServiceClient();
    const formData = new FormData();
    formData.append("file", fileBuffer, filename);
    formData.append("certificate_id", certificateId);

    const response = await client.post(
      "/api/v1/trust/authenticity",
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    return response.data;
  } catch (error) {
    console.error("Authenticity verification failed:", error.message);
    throw new Error("Failed to verify authenticity");
  }
}

/**
 * Index document in vector store for RAG
 */
export async function indexDocument(
  fileBuffer,
  filename,
  certificateId,
  userId,
  metadata = {},
) {
  try {
    const client = getAIServiceClient();
    const formData = new FormData();
    formData.append("file", fileBuffer, filename);
    formData.append("certificate_id", certificateId);
    formData.append("user_id", userId);
    formData.append("metadata", JSON.stringify(metadata));

    const response = await client.post(
      "/api/v1/documents/index",
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    return response.data;
  } catch (error) {
    console.error("Document indexing failed:", error.message);
    throw new Error("Failed to index document");
  }
}

/**
 * Delete document from vector store
 */
export async function deleteDocument(certificateId) {
  try {
    const client = getAIServiceClient();
    const response = await client.delete(
      `/api/v1/documents/${certificateId}`,
    );

    return response.data;
  } catch (error) {
    console.error("Document deletion failed:", error.message);
    throw new Error("Failed to delete document");
  }
}

/**
 * Get document statistics
 */
export async function getDocumentStats(certificateId) {
  try {
    const client = getAIServiceClient();
    const response = await client.get(
      `/api/v1/documents/stats/${certificateId}`,
    );

    return response.data;
  } catch (error) {
    console.error("Failed to get document stats:", error.message);
    throw new Error("Failed to get document statistics");
  }
}

export default {
  extractText,
  extractStructuredData,
  extractTables,
  askQuestion,
  chatWithDocument,
  semanticSearch,
  calculateTrustScore,
  checkSimilarity,
  verifyAuthenticity,
  indexDocument,
  deleteDocument,
  getDocumentStats,
};
