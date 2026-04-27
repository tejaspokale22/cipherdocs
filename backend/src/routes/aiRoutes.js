import express from "express";
import multer from "multer";
import { askCipherDocsAssistant } from "../services/aiAssistantService.js";
import { aianalyze } from "../services/aiAnalysisService.js";
import { extractTextFromPDF } from "../utils/ocrUtils.js";
import { decryptAESKey, decryptFileBuffer } from "../utils/decryption.js";
import Certificate from "../models/Certificate.js";
import { getCertificateFromIPFS } from "../services/ipfsService.js";
import { protect } from "../middlewares/authMiddlewares.js";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const systemPrompt = `
You are a strict document sensitivity classification system. TASK: You will be given only a PARTIAL portion of the document text to improve performance and reduce token usage. Even with partial input, you must infer the overall context and type of the document accurately. Classify the sensitivity level of the document into EXACTLY one category: LOW - Public or non-sensitive documents - Generic academic certificates WITHOUT personal identifiers MEDIUM - Documents containing personal information - Academic certificates WITH student details (name, roll number, etc.) - Employment records, resumes, offer letters HIGH - Financial documents (salary, bank details, transactions) - Government identity documents (Aadhaar, Passport, SSN) - Medical records (diagnosis, prescriptions, reports) - Legal documents (contracts, agreements) - Any document containing sensitive personal or confidential data GUIDELINES: - Focus on key indicators and context from the provided text - If sensitive data is detected, classify as HIGH - If only general personal data is present, classify as MEDIUM - If no personal or sensitive data is present, classify as LOW RULES: - Output ONLY one word: LOW, MEDIUM, or HIGH - Do NOT explain your answer - Do NOT include punctuation or extra text - If unsure, return MEDIUM OUTPUT: LOW or MEDIUM or HIGH`;

router.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    const reply = await askCipherDocsAssistant(message, history);

    res.json({
      success: true,
      reply,
    });
  } catch (error) {
    console.error("AI Error:", error);

    res.status(500).json({
      success: false,
      message: "AI assistant failed",
    });
  }
});

router.post("/ai-analysis", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "Please upload a file for verification.",
      });
    }

    const verificationResult = JSON.parse(req.body.verificationResult);
    const certId = req.body.certId;

    if (!certId) {
      return res.status(400).json({
        message: "Certificate ID is required.",
      });
    }

    // Extract uploaded certificate text
    const uploadedText = await extractTextFromPDF(file.buffer);

    // Fetch certificate metadata
    const cert = await Certificate.findOne({
      contractCertificateId: certId.toLowerCase().trim(),
    });

    if (!cert) {
      return res.status(404).json({
        message: "Certificate not found.",
      });
    }

    // Fetch encrypted certificate from IPFS
    const encryptedBuffer = await getCertificateFromIPFS(cert.ipfsCID);

    // Decrypt AES key
    const aesKeyBuffer = decryptAESKey(cert.encryptedAESKey, cert.envelopeIV);

    // Decrypt certificate file
    const decryptedBuffer = decryptFileBuffer(
      encryptedBuffer,
      aesKeyBuffer,
      cert.fileIV,
    );

    // Extract original certificate text
    const originalText = await extractTextFromPDF(decryptedBuffer);

    // Run AI analysis
    const analysis = await aianalyze({
      verificationResult,
      uploadedText,
      originalText,
    });

    // Send response
    return res.json({
      analysis,
    });
  } catch (error) {
    console.error("AI analysis error:", error);
    return res.status(500).json({
      message: "AI analysis failed.",
    });
  }
});

router.post("/adaptive-security", protect, async (req, res) => {
  try {
    const { fileBase64 } = req.body;

    if (!fileBase64) {
      return res.status(400).json({
        message: "fileBase64 is required",
      });
    }

    const buffer = Buffer.from(fileBase64, "base64");

    const extractedText = await extractTextFromPDF(buffer);

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        message: "Unable to extract text from document",
      });
    }

    const trimmedText = extractedText.slice(0, 800);

    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile",
      temperature: 0,
    });

    const response = await model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(trimmedText),
    ]);

    let sensitivity =
      typeof response.content === "string"
        ? response.content
        : response.content?.[0]?.text;

    sensitivity = sensitivity?.trim().toUpperCase().replace(/[^A-Z]/g, "");

    if (!["LOW", "MEDIUM", "HIGH"].includes(sensitivity)) {
      sensitivity = "MEDIUM";
    }

    let encryptionConfig;

    switch (sensitivity) {
      case "LOW":
        encryptionConfig = { level: "LOW", keySize: 128 };
        break;
      case "MEDIUM":
        encryptionConfig = { level: "MEDIUM", keySize: 256 };
        break;
      case "HIGH":
        encryptionConfig = { level: "HIGH", keySize: 256 };
        break;
      default:
        encryptionConfig = { level: "MEDIUM", keySize: 256 };
    }

    return res.json({
      success: true,
      encryptionConfig,
    });

  } catch (error) {
    console.error("Adaptive security error:", error);

    return res.status(500).json({
      message: "Adaptive security processing failed",
    });
  }
});

export default router;
