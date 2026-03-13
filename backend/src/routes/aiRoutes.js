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
      return res
        .status(400)
        .json({ message: "Please upload a file for verification." });
    }

    const verificationResult = JSON.parse(req.body.verificationResult);
    const certId = req.body.certId;

    if (!certId) {
      return res.status(400).json({ message: "Certificate ID is required." });
    }

    const uploadedTextPromise = extractTextFromPDF(file.buffer);

    const originalTextPromise = (async () => {
      const cert = await Certificate.findOne({
        contractCertificateId: certId.toLowerCase().trim(),
      });

      if (!cert) {
        const err = new Error("Certificate not found");
        err.status = 404;
        throw err;
      }

      const encryptedBuffer = await getCertificateFromIPFS(cert.ipfsCID);

      const aesKeyBuffer = decryptAESKey(cert.encryptedAESKey, cert.envelopeIV);

      const decryptedBuffer = decryptFileBuffer(
        encryptedBuffer,
        aesKeyBuffer,
        cert.fileIV,
      );

      return extractTextFromPDF(decryptedBuffer);
    })();

    const [uploadedText, originalText] = await Promise.all([
      uploadedTextPromise,
      originalTextPromise,
    ]);

    const analysis = await aianalyze({
      verificationResult,
      uploadedText,
      originalText,
    });

    return res.json({ analysis });
  } catch (error) {
    console.error("AI analysis error:", error);

    return res.status(error.status || 500).json({
      message: error.message || "AI analysis failed.",
    });
  }
});

export default router;
