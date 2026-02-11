import express from "express";
import { requestNonce, verify } from "../controllers/authControllers.js";

const router = express.Router();

router.post("/request-nonce", requestNonce);
router.post("/verify", verify);

export default router;
