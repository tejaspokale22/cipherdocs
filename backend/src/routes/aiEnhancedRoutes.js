/**
 * AI Enhanced Routes
 * New routes for Python AI service integration
 */

import express from "express";
import multer from "multer";
import { protect } from "../middlewares/authMiddlewares.js";
import Certificate from "../models/Certificate.js";
import { getCertificateFromIPFS } from "../services/ipfsService.js";
import { decryptAESKey, decryptFileBuffer } from "../utils/decryption.js";
import * as aiService from "../services/aiServiceClient.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Extract text from uploaded document
 * POST /api/ai-enhanced/extract/text
 */
router.post(
  "/extract/text",
  protect,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload a file",
        });
      }

      const result = await aiService.extractText(
        req.file.buffer,
        req.file.originalname,
      );

      // Auto-index the document if certificate_id is provided
      const certificateId = req.body.certificate_id;
      if (certificateId && result.text) {
        try {
          await aiService.indexDocument(
            req.file.buffer,
            req.file.originalname,
            certificateId,
            req.user._id.toString(),
            { name: req.file.originalname }
          );
          result.indexed = true;
          console.log(`✓ Document auto-indexed for certificate ${certificateId}`);
        } catch (indexError) {
          console.error("Auto-indexing failed:", indexError);
          result.indexed = false;
          // Don't fail the extraction if indexing fails
        }
      }

      res.json(result);
    } catch (error) {
      console.error("Text extraction error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Text extraction failed",
      });
    }
  },
);

/**
 * Extract structured data from document
 * POST /api/ai-enhanced/extract/structured
 */
router.post(
  "/extract/structured",
  protect,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload a file",
        });
      }

      const result = await aiService.extractStructuredData(
        req.file.buffer,
        req.file.originalname,
      );

      res.json(result);
    } catch (error) {
      console.error("Structured extraction error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Structured data extraction failed",
      });
    }
  },
);

/**
 * Extract tables from PDF
 * POST /api/ai-enhanced/extract/tables
 */
router.post(
  "/extract/tables",
  protect,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload a file",
        });
      }

      const result = await aiService.extractTables(
        req.file.buffer,
        req.file.originalname,
      );

      res.json(result);
    } catch (error) {
      console.error("Table extraction error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Table extraction failed",
      });
    }
  },
);

/**
 * Ask question about a certificate (RAG)
 * POST /api/ai-enhanced/question
 */
router.post("/question", protect, async (req, res) => {
  try {
    const { question, certificate_id, top_k } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    // Use authenticated user's ID
    const userId = req.user._id.toString();

    const result = await aiService.askQuestion(
      question,
      certificate_id || null,
      userId,
      top_k || 5,
    );

    res.json(result);
  } catch (error) {
    console.error("Question answering error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to answer question",
    });
  }
});

/**
 * Chat with document context
 * POST /api/ai-enhanced/chat
 */
router.post("/chat", protect, async (req, res) => {
  try {
    const { message, certificate_id, history } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // Use authenticated user's ID
    const userId = req.user._id.toString();

    const result = await aiService.chatWithDocument(
      message,
      certificate_id || null,
      userId,
      history || [],
    );

    res.json(result);
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Chat failed",
    });
  }
});

/**
 * Semantic search across user's documents
 * POST /api/ai-enhanced/search
 */
router.post("/search", protect, async (req, res) => {
  try {
    const { query, certificate_id, top_k } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Use authenticated user's ID
    const userId = req.user._id.toString();

    const result = await aiService.semanticSearch(
      query,
      userId,
      certificate_id || null,
      top_k || 10,
    );

    res.json(result);
  } catch (error) {
    console.error("Semantic search error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Search failed",
    });
  }
});

/**
 * Calculate trust score for uploaded document
 * POST /api/ai-enhanced/trust-score
 */
router.post(
  "/trust-score",
  protect,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload a file",
        });
      }

      const { certificate_id } = req.body;

      if (!certificate_id) {
        return res.status(400).json({
          success: false,
          message: "Certificate ID is required",
        });
      }

      // Fetch certificate from database
      const cert = await Certificate.findOne({
        contractCertificateId: certificate_id.toLowerCase().trim(),
      });

      if (!cert) {
        return res.status(404).json({
          success: false,
          message: "Certificate not found",
        });
      }

      // Fetch and decrypt original certificate from IPFS
      const encryptedBuffer = await getCertificateFromIPFS(cert.ipfsCID);
      const aesKeyBuffer = decryptAESKey(cert.encryptedAESKey, cert.envelopeIV);
      const originalBuffer = decryptFileBuffer(
        encryptedBuffer,
        aesKeyBuffer,
        cert.fileIV,
      );

      // Calculate trust score
      const result = await aiService.calculateTrustScore(
        req.file.buffer,
        req.file.originalname,
        certificate_id,
        originalBuffer,
      );

      res.json(result);
    } catch (error) {
      console.error("Trust score calculation error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Trust score calculation failed",
      });
    }
  },
);

/**
 * Check similarity between two documents
 * POST /api/ai-enhanced/similarity
 */
router.post(
  "/similarity",
  protect,
  upload.fields([
    { name: "file1", maxCount: 1 },
    { name: "file2", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!req.files?.file1 || !req.files?.file2) {
        return res.status(400).json({
          success: false,
          message: "Please upload both files",
        });
      }

      const file1 = req.files.file1[0];
      const file2 = req.files.file2[0];

      const result = await aiService.checkSimilarity(
        file1.buffer,
        file1.originalname,
        file2.buffer,
        file2.originalname,
      );

      res.json(result);
    } catch (error) {
      console.error("Similarity check error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Similarity check failed",
      });
    }
  },
);

/**
 * Verify document authenticity
 * POST /api/ai-enhanced/verify-authenticity
 */
router.post(
  "/verify-authenticity",
  protect,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please upload a file",
        });
      }

      const { certificate_id } = req.body;

      if (!certificate_id) {
        return res.status(400).json({
          success: false,
          message: "Certificate ID is required",
        });
      }

      const result = await aiService.verifyAuthenticity(
        req.file.buffer,
        req.file.originalname,
        certificate_id,
      );

      res.json(result);
    } catch (error) {
      console.error("Authenticity verification error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Authenticity verification failed",
      });
    }
  },
);

/**
 * Index certificate for RAG (called when certificate is issued)
 * POST /api/ai-enhanced/index
 */
router.post("/index", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a file",
      });
    }

    const { certificate_id, metadata } = req.body;

    if (!certificate_id) {
      return res.status(400).json({
        success: false,
        message: "Certificate ID is required",
      });
    }

    // Use authenticated user's ID
    const userId = req.user._id.toString();

    const metadataObj = metadata ? JSON.parse(metadata) : {};

    const result = await aiService.indexDocument(
      req.file.buffer,
      req.file.originalname,
      certificate_id,
      userId,
      metadataObj,
    );

    res.json(result);
  } catch (error) {
    console.error("Document indexing error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Document indexing failed",
    });
  }
});

/**
 * Delete certificate from vector store
 * DELETE /api/ai-enhanced/document/:certificateId
 */
router.delete("/document/:certificateId", protect, async (req, res) => {
  try {
    const { certificateId } = req.params;

    const result = await aiService.deleteDocument(certificateId);

    res.json(result);
  } catch (error) {
    console.error("Document deletion error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Document deletion failed",
    });
  }
});

/**
 * Get document statistics
 * GET /api/ai-enhanced/stats/:certificateId
 */
router.get("/stats/:certificateId", protect, async (req, res) => {
  try {
    const { certificateId } = req.params;

    const result = await aiService.getDocumentStats(certificateId);

    res.json(result);
  } catch (error) {
    console.error("Failed to get document stats:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get document statistics",
    });
  }
});

export default router;
