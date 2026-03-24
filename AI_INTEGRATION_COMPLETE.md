# CipherDocs AI Integration - Complete Guide

## 🎉 Integration Complete!

Your CipherDocs platform now has a comprehensive AI-powered document processing system with:
- Python FastAPI microservice for AI operations
- Node.js backend integration
- React frontend components
- Complete authentication and data isolation

---

## 📁 Project Structure

```
CipherDocs/
├── ai-service/                    # Python FastAPI AI Service
│   ├── app/
│   │   ├── api/v1/endpoints/     # API endpoints
│   │   ├── core/                 # Config, security
│   │   ├── services/             # Business logic
│   │   └── schemas/              # Pydantic models
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   └── README.md
│
├── backend/                       # Node.js Backend
│   ├── src/
│   │   ├── services/
│   │   │   └── aiServiceClient.js    # AI service client
│   │   └── routes/
│   │       └── aiEnhancedRoutes.js   # AI endpoints
│   └── INTEGRATION.md
│
└── frontend/                      # React Frontend
    ├── src/app/
    │   ├── lib/
    │   │   └── aiEnhancedApi.js      # AI API client
    │   ├── components/
    │   │   ├── TrustScoreDisplay.jsx
    │   │   ├── DocumentQA.jsx
    │   │   ├── DocumentExtractor.jsx
    │   │   ├── SimilarityChecker.jsx
    │   │   └── EnhancedVerification.jsx
    │   └── (main)/
    │       └── ai-tools/page.jsx     # AI tools page
    ├── FRONTEND_INTEGRATION.md
    └── README_AI.md
```

---

## 🚀 Quick Start

### 1. Setup AI Service (Python)

```bash
cd ai-service

# Install dependencies
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# Configure environment
cp .env.example .env
# Edit .env with your credentials:
# - QDRANT_URL and QDRANT_API_KEY (from Qdrant Cloud)
# - NOMIC_API_KEY (from Nomic)
# - SERVICE_API_KEY (generate with: python -c "import secrets; print(secrets.token_hex(32))")

# Run service
python run.py
# Runs on http://localhost:8000
```

### 2. Setup Node.js Backend

```bash
cd backend

# Add to .env:
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=<same_key_as_ai_service>

# Restart backend
npm run dev
# Runs on http://localhost:5000
```

### 3. Frontend (No changes needed)

```bash
cd frontend

# Ensure .env.local has:
NEXT_PUBLIC_API_URL=http://localhost:5000

# Run frontend
npm run dev
# Runs on http://localhost:3000
```

---

## 🔑 API Keys Setup

### 1. Generate Service API Key

```bash
# Use any of these methods:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
python -c "import secrets; print(secrets.token_hex(32))"
openssl rand -hex 32
```

### 2. Qdrant Cloud Setup

1. Go to https://cloud.qdrant.io
2. Create a free cluster
3. Get your cluster URL and API key
4. Add to `ai-service/.env`:
   ```env
   QDRANT_URL=https://your-cluster.qdrant.io
   QDRANT_API_KEY=your_api_key
   ```

### 3. Nomic API Key

1. Visit https://atlas.nomic.ai
2. Sign up and get API key
3. Add to `ai-service/.env`:
   ```env
   NOMIC_API_KEY=your_nomic_api_key
   ```

### 4. Mixtral API Key (for OCR)

1. Visit https://console.mistral.ai/
2. Create account and get API key
3. Add to `ai-service/.env`:
   ```env
   MISTRAL_API_KEY=your_mistral_api_key
   ```

---

## 🎯 Features Implemented

### 1. Document Extraction
- ✅ Text extraction from PDFs and images (Mixtral OCR)
- ✅ Structured data extraction (entities, dates, IDs, emails)
- ✅ Table extraction from PDFs
- ✅ NLP-powered entity recognition

### 2. RAG Q&A System
- ✅ Question answering on documents
- ✅ Multi-turn conversational chat
- ✅ Semantic search across documents
- ✅ Source citations with relevance scores
- ✅ User-scoped data isolation

### 3. Trust Score & Verification
- ✅ Comprehensive trust score (0-100)
- ✅ Content similarity analysis
- ✅ Structural integrity checking
- ✅ Metadata consistency validation
- ✅ Document comparison
- ✅ Authenticity verification with tampering detection

### 4. Document Management
- ✅ Vector indexing for RAG
- ✅ Intelligent text chunking
- ✅ Document deletion from vector store
- ✅ Statistics and metadata tracking

---

## 🔐 Security Features

### Authentication
- ✅ JWT-based user authentication
- ✅ API key authentication between services
- ✅ Protected routes with middleware

### Data Isolation
- ✅ User-scoped queries (users only see their data)
- ✅ Certificate-level filtering
- ✅ Metadata-based access control

### Service Security
- ✅ Service-to-service API key
- ✅ No direct frontend access to AI service
- ✅ Input validation with Pydantic
- ✅ CORS configuration

---

## 📊 API Endpoints

### Backend (Node.js) - `/api/ai-enhanced`

#### Extraction
- `POST /extract/text` - Extract text from document
- `POST /extract/structured` - Extract entities, dates, IDs
- `POST /extract/tables` - Extract tables from PDF

#### RAG Q&A
- `POST /question` - Ask question (user-scoped)
- `POST /chat` - Multi-turn chat (user-scoped)
- `POST /search` - Semantic search (user-scoped)

#### Trust & Verification
- `POST /trust-score` - Calculate trust score
- `POST /similarity` - Compare two documents
- `POST /verify-authenticity` - Verify document authenticity

#### Document Management
- `POST /index` - Index document for RAG
- `DELETE /document/:id` - Delete from vector store
- `GET /stats/:id` - Get document statistics

All endpoints require authentication (JWT cookie).

---

## 🎨 Frontend Components

### TrustScoreDisplay
Visual display of trust scores with:
- Color-coded trust levels (HIGH/MEDIUM/LOW)
- Progress bars
- Detailed score breakdown
- Analysis and recommendations

### DocumentQA
Floating chat interface for:
- Asking questions about certificates
- Multi-turn conversations
- Source citations
- Confidence scores

### DocumentExtractor
Tabbed interface for:
- Text extraction
- Entity extraction
- Table extraction

### SimilarityChecker
Side-by-side document comparison with:
- Similarity percentage
- Verdict classification
- Key differences
- Common elements

### EnhancedVerification
Trust score integration for verification pages

---

## 🔄 Data Flow

```
User uploads document
    ↓
Frontend (React)
    ↓ HTTP + JWT Cookie
Node.js Backend
    ↓ Extracts user_id from JWT
    ↓ HTTP + API Key
Python AI Service
    ↓ Filters by user_id
Qdrant Vector Store
    ↓ Returns user's data only
Python AI Service
    ↓ Processes and formats
Node.js Backend
    ↓ Returns to frontend
User sees results
```

---

## 💡 Usage Examples

### Calculate Trust Score

```javascript
// Frontend
import { calculateTrustScore } from '@/app/lib/aiEnhancedApi';

const result = await calculateTrustScore(uploadedFile, certificateId);
console.log('Trust Score:', result.trust_score);
console.log('Trust Level:', result.trust_level);
```

### Ask Question About Certificate

```javascript
import { askQuestion } from '@/app/lib/aiEnhancedApi';

const result = await askQuestion(
  "What is the issue date?",
  certificateId
);
console.log('Answer:', result.answer);
console.log('Sources:', result.sources);
```

### Extract Entities from Document

```javascript
import { extractStructuredData } from '@/app/lib/aiEnhancedApi';

const result = await extractStructuredData(file);
console.log('Persons:', result.entities.persons);
console.log('Dates:', result.dates);
console.log('IDs:', result.document_ids);
```

---

## 🧪 Testing

### 1. Test AI Service

```bash
curl http://localhost:8000/health
# Should return: {"status": "healthy", ...}
```

### 2. Test Backend Integration

```bash
# From Node.js backend directory
node -e "
const axios = require('axios');
axios.get('http://localhost:8000/health', {
  headers: { 'X-API-Key': process.env.AI_SERVICE_API_KEY }
})
.then(res => console.log('✅ AI Service connected'))
.catch(err => console.error('❌ Connection failed'));
"
```

### 3. Test Frontend

1. Visit http://localhost:3000/ai-tools
2. Upload a PDF
3. Click "Extract Text"
4. Should see extracted text

### 4. Test Trust Score

1. Go to a certificate verification page
2. Upload the certificate
3. Click "Calculate AI Trust Score"
4. Should see trust score with analysis

---

## 📈 Performance

### AI Service
- Async operations for I/O
- Batch embedding generation
- Vector search caching in Qdrant
- Chunking for large documents

### Backend
- Connection pooling
- 60-second timeout for AI operations
- Error handling and retries

### Frontend
- Lazy loading of AI components
- Loading states for all operations
- Error boundaries
- Responsive design

---

## 🐛 Troubleshooting

### AI Service won't start
```bash
# Check Python version (3.10+)
python --version

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Check .env file
cat .env
```

### Backend can't connect to AI service
```bash
# Check AI service is running
curl http://localhost:8000/health

# Check API key matches
# backend/.env: AI_SERVICE_API_KEY
# ai-service/.env: SERVICE_API_KEY

# Check URL
# backend/.env: AI_SERVICE_URL=http://localhost:8000
```

### Frontend API calls failing
```bash
# Check backend is running
curl http://localhost:5000/health-check

# Check .env.local
cat frontend/.env.local
# Should have: NEXT_PUBLIC_API_URL=http://localhost:5000

# Check browser console for errors
# Check Network tab for failed requests
```

### Users can see other users' data
```bash
# Check protect middleware is applied to routes
# backend/src/routes/aiEnhancedRoutes.js

# Verify user_id is extracted from req.user._id
# Not from request body!

# Check AI service filters by user_id
# ai-service/app/services/vector_store_service.py
```

---

## 🚀 Deployment

### Development
- AI Service: `http://localhost:8000`
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

### Production

#### AI Service (Railway/Render)
```bash
# Build command
pip install -r requirements.txt && python -m spacy download en_core_web_sm

# Start command
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

#### Backend
Update `.env`:
```env
AI_SERVICE_URL=https://your-ai-service.railway.app
```

#### Frontend
Update `.env.production`:
```env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

---

## 📚 Documentation

- **AI Service**: `ai-service/README.md`
- **Backend Integration**: `backend/INTEGRATION.md`
- **Frontend Integration**: `frontend/FRONTEND_INTEGRATION.md`
- **Frontend Quick Start**: `frontend/README_AI.md`

---

## 🎓 Key Concepts

### RAG (Retrieval Augmented Generation)
Documents are:
1. Split into chunks
2. Converted to embeddings (Nomic)
3. Stored in vector database (Qdrant)
4. Retrieved based on semantic similarity
5. Used to answer questions

### Trust Score
Calculated from:
- **Content Similarity (50%)**: Text matching
- **Structural Score (30%)**: Layout consistency
- **Metadata Score (20%)**: Property matching

### Data Isolation
- User ID extracted from JWT (backend)
- Passed to AI service
- AI service filters all queries by user_id
- Users can only access their own documents

---

## ✅ Checklist

### Setup
- [ ] Python AI service running on port 8000
- [ ] Node.js backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Qdrant Cloud cluster created
- [ ] Nomic API key obtained
- [ ] Mixtral API key obtained
- [ ] Service API key generated and configured
- [ ] All `.env` files configured

### Testing
- [ ] AI service health check passes
- [ ] Backend can connect to AI service
- [ ] Frontend can call backend
- [ ] User authentication works
- [ ] Document extraction works
- [ ] Trust score calculation works
- [ ] Q&A system works
- [ ] Data isolation verified

### Integration
- [ ] Trust score added to verification page
- [ ] Q&A added to certificate pages
- [ ] AI Tools page accessible
- [ ] Navigation updated
- [ ] Mobile responsiveness verified
- [ ] Error handling tested
- [ ] Loading states work

---

## 🎉 What's Next?

### Automatic Indexing
When certificates are issued, automatically index them:

```javascript
// In certificate issuance controller
import { indexDocument } from '../services/aiServiceClient.js';

// After certificate is issued
try {
  await indexDocument(
    certificateBuffer,
    'certificate.pdf',
    contractCertificateId,
    userId,
    { issuer: issuerName, recipient: recipientName }
  );
} catch (error) {
  console.error('Failed to index certificate:', error);
}
```

### Enhanced Features
- Document summarization
- Batch processing
- Multi-language support
- Voice input for Q&A
- Export analysis reports
- Advanced search filters

---

## 💬 Support

For issues:
1. Check relevant README/documentation
2. Review troubleshooting section
3. Check logs (AI service, backend, frontend)
4. Verify environment variables
5. Test each service independently

---

## 🏆 Success!

Your CipherDocs platform now has:
✅ Enterprise-grade AI document processing
✅ Secure, scalable architecture
✅ User-friendly interface
✅ Production-ready code
✅ Comprehensive documentation

**The AI integration is complete and ready to use!** 🚀

---

Built with ❤️ for CipherDocs
