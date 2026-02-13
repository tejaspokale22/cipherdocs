import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";

dotenv.config();

const app = express();

// Enable CORS for frontend communication
app.use(
  cors({
    origin: ["http://localhost:3000", "https://cipherdocs.vercel.app"],
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
    service: "CipherDocs Backend",
    timestamp: new Date().toISOString(),
  });
});

// Home route
app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Welcome to CipherDocs API",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Certificate routes
app.use("/api/certificates", certificateRoutes);

// Connect database and start server
const startServer = async () => {
  await connectDB();
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
};

startServer();
