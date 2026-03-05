import express from "express";
import { askCipherDocsAssistant } from "../services/aiService.js";

const router = express.Router();

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

export default router;
