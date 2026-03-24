# CipherDocs AI Service

Advanced AI-powered document processing microservice for CipherDocs platform.

## Features

### 🔍 Document Extraction
- **Text Extraction**: Extract text from PDFs, images (OCR), and documents
- **Structured Data Extraction**: Extract entities, dates, IDs, emails using NLP
- **Table Extraction**: Extract tables from PDF documents with structure preservation

### 💬 RAG Q&A System
- **Question Answering**: Ask questions about uploaded documents
- **Multi-turn Chat**: Conversational interface with document context
- **Semantic Search**: Find relevant information across document collections

### 🛡️ Trust Score & Verification
- **Trust Score Calculation**: Comprehensive authenticity scoring (0-100)
- **Similarity Analysis**: Compare documents for semantic similarity
- **Authenticity Verification**: Detect tampering, forgery, and anomalies
- **Forensic Analysis**: Detailed verification with confidence scores

### 📚 Document Management
- **Vector Indexing**: Index documents for RAG with Qdrant
- **Chunk Management**: Intelligent text chunking with overlap
- **Metadata Tracking**: Store and query document metadata

## Tech Stack

- **Framework**: FastAPI (Python 3.10+)
- **Vector Database**: Qdrant Cloud
- **Embeddings**: Nomic (nomic-embed-text-v1.5)
- **Document Processing**: PyPDF, PDFPlumber, Pytesseract
- **NLP**: spaCy, sentence-transformers
- **AI/ML**: LangChain, Transformers

## Installation

### Prerequisites
- Python 3.10 or higher
- Qdrant Cloud account
- Nomic API key

### Setup

1. **Install dependencies**:
```bash
cd ai-service
pip install -r requirements.txt
```

2. **Download spaCy model**:
```bash
python -m spacy download en_core_web_sm
```

3. **Get Mixtral API Key** (for OCR):
   - Visit [Mistral AI Console](https://console.mistral.ai/)
   - Create an account and get your API key
   - Add to `.env` file

4. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your credentials
```

### Environment Variables

```env
# Qdrant Configuration
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your_api_key
QDRANT_COLLECTION_NAME=cipherdocs_documents

# Nomic Configuration
NOMIC_API_KEY=your_nomic_api_key

# Mixtral Configuration (for OCR)
MISTRAL_API_KEY=your_mistral_api_key

# Service Configuration
SERVICE_API_KEY=your_secure_api_key
NODE_BACKEND_URL=http://localhost:5000
```

## Running the Service

### Development
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### With Docker
```bash
docker build -t cipherdocs-ai-service .
docker run -p 8000:8000 --env-file .env cipherdocs-ai-service
```

## API Documentation

Once running, access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Document Extraction

#### Extract Text
```bash
POST /api/v1/extract/text
Content-Type: multipart/form-data
X-API-Key: your_service_api_key

file: <document_file>
```

#### Extract Structured Data
```bash
POST /api/v1/extract/structured
Content-Type: multipart/form-data
X-API-Key: your_service_api_key

file: <document_file>
```

#### Extract Tables
```bash
POST /api/v1/extract/tables
Content-Type: multipart/form-data
X-API-Key: your_service_api_key

file: <document_file>
```

### RAG Q&A

#### Ask Question
```bash
POST /api/v1/rag/question
Content-Type: application/json
X-API-Key: your_service_api_key

{
  "question": "What is the certificate number?",
  "certificate_id": "cert_123",
  "user_id": "user_456",
  "top_k": 5
}
```

#### Chat
```bash
POST /api/v1/rag/chat
Content-Type: application/json
X-API-Key: your_service_api_key

{
  "message": "Tell me about this certificate",
  "certificate_id": "cert_123",
  "history": []
}
```

#### Semantic Search
```bash
POST /api/v1/rag/search
Content-Type: application/json
X-API-Key: your_service_api_key

{
  "query": "graduation date",
  "certificate_id": "cert_123",
  "top_k": 10
}
```

### Trust Score

#### Calculate Trust Score
```bash
POST /api/v1/trust/score
Content-Type: multipart/form-data
X-API-Key: your_service_api_key

uploaded_file: <document_file>
certificate_id: cert_123
original_file: <optional_original_file>
```

#### Check Similarity
```bash
POST /api/v1/trust/similarity
Content-Type: multipart/form-data
X-API-Key: your_service_api_key

file1: <document_file_1>
file2: <document_file_2>
```

#### Verify Authenticity
```bash
POST /api/v1/trust/authenticity
Content-Type: multipart/form-data
X-API-Key: your_service_api_key

file: <document_file>
certificate_id: cert_123
```

### Document Management

#### Index Document
```bash
POST /api/v1/documents/index
Content-Type: multipart/form-data
X-API-Key: your_service_api_key

file: <document_file>
certificate_id: cert_123
user_id: user_456
metadata: {"issuer": "University"}
```

#### Delete Document
```bash
DELETE /api/v1/documents/{certificate_id}
X-API-Key: your_service_api_key
```

#### Get Document Stats
```bash
GET /api/v1/documents/stats/{certificate_id}
X-API-Key: your_service_api_key
```

## Integration with Node.js Backend

### From Node.js Backend

```javascript
// Example: Calculate trust score
const FormData = require('form-data');
const axios = require('axios');

const form = new FormData();
form.append('uploaded_file', fileBuffer, 'certificate.pdf');
form.append('certificate_id', 'cert_123');

const response = await axios.post(
  'http://localhost:8000/api/v1/trust/score',
  form,
  {
    headers: {
      ...form.getHeaders(),
      'X-API-Key': process.env.AI_SERVICE_API_KEY,
    },
  }
);

console.log('Trust Score:', response.data.trust_score);
```

### From Frontend (via Node.js proxy)

Frontend should call Node.js backend, which then calls AI service. Never expose AI service directly to frontend.

## Trust Score Calculation

The trust score (0-100) is calculated using:

- **Content Similarity (50%)**: Semantic similarity between uploaded and original
- **Structural Score (30%)**: Layout, page count, formatting consistency
- **Metadata Score (20%)**: Metadata consistency and integrity

### Trust Levels
- **HIGH** (85-100): Document appears authentic
- **MEDIUM** (60-84): Some inconsistencies detected
- **LOW** (0-59): Significant discrepancies, manual verification needed

## Architecture

```
Frontend (React)
    ↓
Node.js Backend (Port 5000)
    ↓ HTTP/REST
Python AI Service (Port 8000)
    ↓
Qdrant Cloud (Vector Store)
```

## Security

- **API Key Authentication**: All endpoints require `X-API-Key` header
- **Service-to-Service**: Shared secret between Node backend and AI service
- **No Direct Frontend Access**: AI service only accessible via backend
- **Input Validation**: All inputs validated with Pydantic schemas

## Performance

- **Async Operations**: All I/O operations are async
- **Batch Processing**: Embeddings generated in batches
- **Caching**: Vector embeddings cached in Qdrant
- **Chunking**: Large documents split into manageable chunks

## Monitoring

- **Logging**: Structured logging with Loguru
- **Health Check**: `/health` endpoint for monitoring
- **Error Tracking**: Detailed error messages in development mode

## Deployment

### Railway/Render
```bash
# Build command
pip install -r requirements.txt && python -m spacy download en_core_web_sm

# Start command
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Docker
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt && python -m spacy download en_core_web_sm
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Development

### Project Structure
```
ai-service/
├── app/
│   ├── api/v1/endpoints/    # API endpoints
│   ├── core/                # Config, security, exceptions
│   ├── schemas/             # Pydantic models
│   ├── services/            # Business logic
│   └── main.py             # FastAPI app
├── requirements.txt
├── .env.example
└── README.md
```

### Adding New Features

1. Create service in `app/services/`
2. Create schemas in `app/schemas/`
3. Create endpoint in `app/api/v1/endpoints/`
4. Register router in `app/api/v1/__init__.py`

## Troubleshooting

### Mixtral OCR not working
- Verify MISTRAL_API_KEY in `.env`
- Check API key is valid at https://console.mistral.ai/
- Ensure you have API credits

### Spacy model not found
```bash
python -m spacy download en_core_web_sm
```

### Qdrant connection issues
- Verify QDRANT_URL and QDRANT_API_KEY
- Check network connectivity
- Ensure collection exists

## License

MIT License - Same as CipherDocs project

## Support

For issues and questions, contact the CipherDocs team.
