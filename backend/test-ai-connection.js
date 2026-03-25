/**
 * Test AI Service Connection
 * Run this to verify backend can connect to AI service
 */

import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const AI_SERVICE_API_KEY = process.env.AI_SERVICE_API_KEY;

console.log("\n🔍 Testing AI Service Connection...\n");

console.log("Configuration:");
console.log("  AI_SERVICE_URL:", AI_SERVICE_URL);
console.log("  AI_SERVICE_API_KEY:", AI_SERVICE_API_KEY ? `${AI_SERVICE_API_KEY.substring(0, 10)}...` : "❌ NOT SET");

if (!AI_SERVICE_API_KEY) {
  console.error("\n❌ ERROR: AI_SERVICE_API_KEY is not set in backend/.env");
  console.error("\nPlease add to backend/.env:");
  console.error("AI_SERVICE_URL=http://localhost:8000");
  console.error("AI_SERVICE_API_KEY=d5d87f4539ff017b9dae53f6ba7c3410133257d1cee0e34503261702c91d1672");
  process.exit(1);
}

// Test 1: Health check without API key
console.log("\n📡 Test 1: Health check (no auth required)...");
try {
  const response = await axios.get(`${AI_SERVICE_URL}/health`);
  console.log("✅ AI Service is running");
  console.log("   Status:", response.data.status);
  console.log("   Version:", response.data.version);
} catch (error) {
  console.error("❌ AI Service is not running or not reachable");
  console.error("   Error:", error.message);
  console.error("\nMake sure AI service is running:");
  console.error("   cd ai-service");
  console.error("   python run.py");
  process.exit(1);
}

// Test 2: Authenticated request
console.log("\n🔐 Test 2: Authenticated request...");
try {
  const response = await axios.get(`${AI_SERVICE_URL}/`, {
    headers: {
      "X-API-Key": AI_SERVICE_API_KEY,
    },
  });
  console.log("✅ Authentication successful");
  console.log("   Response:", response.data);
} catch (error) {
  if (error.response?.status === 403) {
    console.error("❌ Authentication failed (403 Forbidden)");
    console.error("\nAPI Key mismatch detected!");
    console.error("\nBackend .env has:");
    console.error(`  AI_SERVICE_API_KEY=${AI_SERVICE_API_KEY}`);
    console.error("\nai-service/.env should have:");
    console.error(`  SERVICE_API_KEY=${AI_SERVICE_API_KEY}`);
    console.error("\nMake sure they match EXACTLY!");
  } else {
    console.error("❌ Request failed:", error.message);
  }
  process.exit(1);
}

console.log("\n✅ All tests passed! Backend can communicate with AI service.\n");
