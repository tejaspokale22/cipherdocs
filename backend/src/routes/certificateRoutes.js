import express from "express";
import {
  prepareCertificate,
  issueCertificate,
} from "../controllers/certificateControllers.js";
import { protect } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.post("/prepare", protect, prepareCertificate);
router.post("/issue", protect, issueCertificate);

export default router;
