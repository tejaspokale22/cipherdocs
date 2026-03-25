import dotenv from "dotenv";

// Load environment variables FIRST before any other imports
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import aiEnhancedRoutes from "./routes/aiEnhancedRoutes.js";

const app = express();

// Enable CORS for frontend communication
app.use(
  cors({
    origin: ["http://localhost:3000", "https://cipherdocs.vercel.app", "http://localhost:8000"],
    credentials: true,
  }),
);

// Parse incoming JSON requests (increased limit for file uploads)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Parse cookies for session handling
app.use(cookieParser());

// Health check endpoint
app.get("/health-check", (_req, res) => {
  res.status(200).json({
    status: "OK",
    service: "cipherdocs. Backend",
    timestamp: new Date().toISOString(),
  });
});

// Home route
app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Welcome to cipherdocs API",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Certificate routes
app.use("/api/certificates", certificateRoutes);

// AI routes (existing Groq-based chat)
app.use("/api/ai", aiRoutes);

// AI Enhanced routes (Python AI service integration)
app.use("/api/ai-enhanced", aiEnhancedRoutes);

// Connect database and start server
const startServer = async () => {
  await connectDB();
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
};

startServer();
