import express from "express";
import {
  requestNonce,
  verify,
  getCurrentSession,
  logout,
} from "../controllers/authControllers.js";
import { protect } from "../middlewares/authMiddlewares.js";

const router = express.Router();

// request nonce
router.post("/request-nonce", requestNonce);

// verify signature and login
router.post("/verify", verify);

// get current session
router.get("/session", protect, getCurrentSession);

// logout
router.post("/logout", logout);

export default router;
