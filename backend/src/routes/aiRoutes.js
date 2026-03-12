import express from "express";
import multer from "multer";
import { askCipherDocsAssistant } from "../services/aiAssistantService.js";
import { aianalyze } from "../services/aiAnalysisService.js";
import { extractTextFromPDF } from "../utils/ocrUtils.js";
import { decryptAESKey, decryptFileBuffer } from "../utils/decryption.js";
import Certificate from "../models/Certificate.js";
import { getCertificateFromIPFS } from "../services/ipfsService.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

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

    // 7️Run AI analysis
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

export default router;
