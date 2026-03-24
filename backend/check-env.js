/**
 * Check environment variables
 */

import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("\n🔍 Checking Environment Configuration...\n");

// Load .env
const result = dotenv.config();

if (result.error) {
  console.error("❌ Failed to load .env file:", result.error.message);
  process.exit(1);
}

console.log("✅ .env file loaded successfully\n");

// Check specific variables
const requiredVars = [
  'AI_SERVICE_URL',
  'AI_SERVICE_API_KEY',
  'PORT',
  'MONGO_URI',
  'JWT_SECRET',
];

console.log("Environment Variables:");
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    if (varName.includes('KEY') || varName.includes('SECRET')) {
      console.log(`  ✅ ${varName}: ${value.substring(0, 10)}...`);
    } else {
      console.log(`  ✅ ${varName}: ${value}`);
    }
  } else {
    console.log(`  ❌ ${varName}: NOT SET`);
  }
});

// Read .env file directly to check
console.log("\n📄 Checking .env file content...");
try {
  const envPath = join(__dirname, '.env');
  const envContent = readFileSync(envPath, 'utf8');
  
  const lines = envContent.split('\n');
  const aiServiceLines = lines.filter(line => 
    line.includes('AI_SERVICE') && !line.trim().startsWith('#')
  );
  
  console.log("\nAI Service lines in .env:");
  aiServiceLines.forEach(line => {
    console.log(`  ${line}`);
  });
  
  if (aiServiceLines.length === 0) {
    console.log("  ⚠️  No AI_SERVICE variables found in .env file");
  }
} catch (error) {
  console.error("❌ Could not read .env file:", error.message);
}

console.log("\n");
