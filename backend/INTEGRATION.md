# AI Service Integration Guide

This document explains how the Node.js backend integrates with the Python AI service.

## Overview

The Node.js backend acts as a proxy between the frontend and the Python AI service, ensuring:
- User authentication and authorization
- Data isolation (users can only access their own documents)
- Secure service-to-service communication

## Architecture

```
Frontend (React)
    ↓ HTTP/REST
Node.js Backend (Port 5000)
    ↓ HTTP/REST + API Key
Python AI Service (Port 8000)
    ↓
Qdrant Cloud (Vector Store)
```

## Setup

### 1. Environment Variables

Add to your `backend/.env`:

```env
# AI Service Configuration
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your_secure_service_api_key_here
```

Generate a secure API key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use the **same key** in both:
- `backend/.env` → `AI_SERVICE_API_KEY`
- `ai-service/.env` → `SERVICE_API_KEY`

### 2. Start Both Services

**Terminal 1 - Python AI Service:**
```bash
cd ai-service
python run.py
# Runs on http://localhost:8000
```

**Terminal 2 - Node.js Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

## API Endpoints

All endpoints require authentication (JWT token in cookie).

### Document Extraction

#### Extract Text
```http
POST /api/ai-enhanced/extract/text
Authorization: Cookie (JWT)
Content-Type: multipart/form-data

file: <document_file>
```

#### Extract Structured Data
```http
POST /api/ai-enhanced/extract/structured
Authorization: Cookie (JWT)
Content-Type: multipart/form-data

file: <document_file>
```

#### Extract Tables
```http
POST /api/ai-enhanced/extract/tables
Authorization: Cookie (JWT)
Content-Type: multipart/form-data

file: <document_file>
```

### RAG Q&A

#### Ask Question
```http
POST /api/ai-enhanced/question
Authorization: Cookie (JWT)
Content-Type: application/json

{
  "question": "What is the certificate number?",
  "certificate_id": "cert_123",  // optional
  "top_k": 5                      // optional
}
```

#### Chat
```http
POST /api/ai-enhanced/chat
Authorization: Cookie (JWT)
Content-Type: application/json

{
  "message": "Tell me about this certificate",
  "certificate_id": "cert_123",  // optional
  "history": []                   // optional
}
```

#### Semantic Search
```http
POST /api/ai-enhanced/search
Authorization: Cookie (JWT)
Content-Type: application/json

{
  "query": "graduation date",
  "certificate_id": "cert_123",  // optional
  "top_k": 10                     // optional
}
```

### Trust Score & Verification

#### Calculate Trust Score
```http
POST /api/ai-enhanced/trust-score
Authorization: Cookie (JWT)
Content-Type: multipart/form-data

file: <uploaded_document>
certificate_id: cert_123
```

#### Check Similarity
```http
POST /api/ai-enhanced/similarity
Authorization: Cookie (JWT)
Content-Type: multipart/form-data

file1: <document_1>
file2: <document_2>
```

#### Verify Authenticity
```http
POST /api/ai-enhanced/verify-authenticity
Authorization: Cookie (JWT)
Content-Type: multipart/form-data

file: <document>
certificate_id: cert_123
```

### Document Management

#### Index Document (for RAG)
```http
POST /api/ai-enhanced/index
Authorization: Cookie (JWT)
Content-Type: multipart/form-data

file: <document>
certificate_id: cert_123
metadata: {"issuer": "University"}  // optional JSON string
```

#### Delete Document
```http
DELETE /api/ai-enhanced/document/:certificateId
Authorization: Cookie (JWT)
```

#### Get Document Stats
```http
GET /api/ai-enhanced/stats/:certificateId
Authorization: Cookie (JWT)
```

## Security Features

### 1. Authentication
All endpoints use the `protect` middleware which:
- Verifies JWT token from cookie
- Loads user from database
- Attaches user to `req.user`

### 2. Data Isolation
The backend automatically passes the authenticated user's ID to the AI service:

```javascript
// User ID is extracted from authenticated session
const userId = req.user._id.toString();

// Passed to AI service
await aiService.askQuestion(question, certificateId, userId);
```

The AI service filters all queries by `user_id`, ensuring users can only access their own data.

### 3. Service-to-Service Authentication
All requests to the AI service include the API key:

```javascript
headers: {
  'X-API-Key': process.env.AI_SERVICE_API_KEY
}
```

## Usage Examples

### Frontend Integration

```javascript
// Example: Ask question about certificate
const response = await fetch('/api/ai-enhanced/question', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Include JWT cookie
  body: JSON.stringify({
    question: 'What is the issue date?',
    certificate_id: 'cert_123',
  }),
});

const data = await response.json();
console.log('Answer:', data.answer);
console.log('Sources:', data.sources);
```

```javascript
// Example: Calculate trust score
const formData = new FormData();
formData.append('file', uploadedFile);
formData.append('certificate_id', 'cert_123');

const response = await fetch('/api/ai-enhanced/trust-score', {
  method: 'POST',
  credentials: 'include',
  body: formData,
});

const data = await response.json();
console.log('Trust Score:', data.trust_score);
console.log('Trust Level:', data.trust_level);
```

## Automatic Document Indexing

When a certificate is issued, automatically index it for RAG:

```javascript
// In your certificate issuance controller
import { indexDocument } from '../services/aiServiceClient.js';

// After certificate is issued and stored
try {
  await indexDocument(
    certificateBuffer,
    'certificate.pdf',
    contractCertificateId,
    userId,
    {
      issuer: issuerName,
      recipient: recipientName,
      issue_date: new Date().toISOString(),
    }
  );
  console.log('Certificate indexed for RAG');
} catch (error) {
  console.error('Failed to index certificate:', error);
  // Non-critical, continue anyway
}
```

## Error Handling

All AI service errors are caught and returned with appropriate status codes:

```javascript
try {
  const result = await aiService.askQuestion(...);
  res.json(result);
} catch (error) {
  console.error('Question answering error:', error);
  res.status(500).json({
    success: false,
    message: error.message || 'Failed to answer question',
  });
}
```

## Testing

### Test AI Service Connection

```bash
# From Node.js backend directory
node -e "
const axios = require('axios');
axios.get('http://localhost:8000/health', {
  headers: { 'X-API-Key': process.env.AI_SERVICE_API_KEY }
})
.then(res => console.log('AI Service:', res.data))
.catch(err => console.error('Connection failed:', err.message));
"
```

### Test with cURL

```bash
# Get JWT token first by logging in
curl -X POST http://localhost:5000/api/ai-enhanced/question \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_JWT_TOKEN" \
  -d '{"question": "What is this certificate about?"}'
```

## Monitoring

### Health Checks

**Node.js Backend:**
```bash
curl http://localhost:5000/health-check
```

**Python AI Service:**
```bash
curl http://localhost:8000/health
```

### Logs

Both services log all requests and errors. Check console output for debugging.

## Deployment

### Development
- Node.js: `http://localhost:5000`
- AI Service: `http://localhost:8000`

### Production
Update `AI_SERVICE_URL` to point to your deployed AI service:

```env
# Production
AI_SERVICE_URL=https://your-ai-service.railway.app
```

Ensure both services can communicate (same VPC or public endpoints with API key).

## Troubleshooting

### "AI Service connection failed"
- Check if AI service is running: `curl http://localhost:8000/health`
- Verify `AI_SERVICE_URL` in backend `.env`
- Check API key matches in both services

### "Invalid API key"
- Ensure `AI_SERVICE_API_KEY` (backend) matches `SERVICE_API_KEY` (AI service)
- Regenerate key if needed

### "User can see other users' data"
- Check that `userId` is correctly extracted from `req.user._id`
- Verify `protect` middleware is applied to all routes
- Check AI service filters by `user_id`

## Best Practices

1. **Always use `protect` middleware** on AI-enhanced routes
2. **Never expose AI service directly** to frontend
3. **Pass user ID from authenticated session**, not from request body
4. **Handle AI service errors gracefully** (non-critical failures)
5. **Index documents asynchronously** (don't block certificate issuance)
6. **Monitor AI service health** in production
7. **Use different API keys** for dev/staging/production

## Support

For issues with:
- Node.js integration → Check `backend/src/services/aiServiceClient.js`
- Route handlers → Check `backend/src/routes/aiEnhancedRoutes.js`
- AI service → Check `ai-service/README.md`
