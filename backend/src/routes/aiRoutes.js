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

    // Run PDF extraction and DB query in parallel
    const [uploadedText, cert] = await Promise.all([
      extractTextFromPDF(file.buffer),
      Certificate.findOne({
        contractCertificateId: certId.toLowerCase().trim(),
      }),
    ]);

    if (!cert) {
      return res.status(404).json({ message: "Certificate not found." });
    }

    const encryptedBuffer = await getCertificateFromIPFS(cert.ipfsCID);

    const aesKeyBuffer = decryptAESKey(cert.encryptedAESKey, cert.envelopeIV);

    const decryptedBuffer = decryptFileBuffer(
      encryptedBuffer,
      aesKeyBuffer,
      cert.fileIV,
    );

    const originalText = await extractTextFromPDF(decryptedBuffer);

    const analysis = await aianalyze({
      verificationResult,
      uploadedText,
      originalText,
    });

    return res.json({ analysis });
  } catch (error) {
    console.error("AI analysis error:", error);
    return res.status(500).json({ message: "AI analysis failed." });
  }
});

export default router;
