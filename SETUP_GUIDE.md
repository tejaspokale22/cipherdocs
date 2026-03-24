# CipherDocs AI Setup Guide

Quick setup guide to get the AI features working.

## 🚨 Current Issue

You're getting `403 Forbidden` errors because the API keys are not configured between services.

## 🔧 Fix Steps

### Step 1: Configure Service API Key

Use this generated key for **both** services:

```
d5d87f4539ff017b9dae53f6ba7c3410133257d1cee0e34503261702c91d1672
```

#### In Node.js Backend (`backend/.env`):
Add these lines:
```env
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=d5d87f4539ff017b9dae53f6ba7c3410133257d1cee0e34503261702c91d1672
```

#### In Python AI Service (`ai-service/.env`):
Add these lines:
```env
SERVICE_API_KEY=d5d87f4539ff017b9dae53f6ba7c3410133257d1cee0e34503261702c91d1672
```

**IMPORTANT:** The key must be **exactly the same** in both files!

---

### Step 2: Configure Qdrant (Vector Database)

1. Go to https://cloud.qdrant.io
2. Sign up (free tier available)
3. Create a new cluster
4. Copy your cluster URL and API key

#### In `ai-service/.env`:
```env
QDRANT_URL=https://your-cluster-id.us-east.aws.cloud.qdrant.io:6333
QDRANT_API_KEY=your_qdrant_api_key_here
QDRANT_COLLECTION_NAME=cipherdocs_documents
```

---

### Step 3: Configure Nomic (Embeddings)

1. Go to https://atlas.nomic.ai
2. Sign up and create account
3. Get your API key from dashboard

#### In `ai-service/.env`:
```env
NOMIC_API_KEY=your_nomic_api_key_here
```

---

### Step 4: Configure Mixtral (OCR)

1. Go to https://console.mistral.ai
2. Sign up and create account
3. Get your API key

#### In `ai-service/.env`:
```env
MISTRAL_API_KEY=your_mistral_api_key_here
```

---

### Step 5: Complete AI Service .env File

Your complete `ai-service/.env` should look like this:

```env
# Server Configuration
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development

# Qdrant Configuration
QDRANT_URL=https://your-cluster-id.us-east.aws.cloud.qdrant.io:6333
QDRANT_API_KEY=your_qdrant_api_key_here
QDRANT_COLLECTION_NAME=cipherdocs_documents

# Nomic Configuration
NOMIC_API_KEY=your_nomic_api_key_here

# Mixtral Configuration
MISTRAL_API_KEY=your_mistral_api_key_here

# Node.js Backend URL
NODE_BACKEND_URL=http://localhost:5000

# Service Authentication (MUST match backend)
SERVICE_API_KEY=d5d87f4539ff017b9dae53f6ba7c3410133257d1cee0e34503261702c91d1672

# Processing Configuration
MAX_FILE_SIZE_MB=50
CHUNK_SIZE=1000
CHUNK_OVERLAP=200

# Trust Score Thresholds
TRUST_SCORE_HIGH_THRESHOLD=85
TRUST_SCORE_MEDIUM_THRESHOLD=60
```

---

### Step 6: Install Python Dependencies

```bash
cd ai-service
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

---

### Step 7: Start Services

#### Terminal 1 - Python AI Service:
```bash
cd ai-service
python run.py
```

Should see:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

#### Terminal 2 - Node.js Backend:
```bash
cd backend
npm run dev
```

Should see:
```
Server running on port 5000
```

#### Terminal 3 - Frontend:
```bash
cd frontend
npm run dev
```

---

## ✅ Verification Checklist

### 1. Check AI Service is Running
```bash
curl http://localhost:8000/health
```

Should return:
```json
{
  "status": "healthy",
  "service": "CipherDocs AI Service",
  "version": "1.0.0"
}
```

### 2. Check Backend Can Connect to AI Service
Open Node.js backend terminal and look for any connection errors.

### 3. Test from Frontend
1. Go to http://localhost:3000/user-dashboard
2. Click "Download" on any certificate
3. Click "AI Actions"
4. Click "Extract Text"
5. Should see extracted text (not 403 error)

---

## 🐛 Troubleshooting

### Still Getting 403 Forbidden?

**Check 1: API Keys Match**
```bash
# In backend/.env
AI_SERVICE_API_KEY=d5d87f4539ff017b9dae53f6ba7c3410133257d1cee0e34503261702c91d1672

# In ai-service/.env
SERVICE_API_KEY=d5d87f4539ff017b9dae53f6ba7c3410133257d1cee0e34503261702c91d1672
```

They must be **exactly the same**!

**Check 2: Backend Has AI_SERVICE_URL**
```bash
# In backend/.env
AI_SERVICE_URL=http://localhost:8000
```

**Check 3: Restart Both Services**
After changing .env files, restart:
```bash
# Stop both services (Ctrl+C)
# Then restart them
```

**Check 4: AI Service is Running**
```bash
curl http://localhost:8000/health
```

If this fails, AI service is not running.

---

### "Cannot find module 'mistralai'"

```bash
cd ai-service
pip install mistralai
```

---

### "Qdrant connection failed"

Check your Qdrant credentials:
1. Verify URL format: `https://xyz.qdrant.io:6333`
2. Verify API key is correct
3. Check cluster is running in Qdrant dashboard

---

### "Nomic API key invalid"

1. Go to https://atlas.nomic.ai
2. Check your API key
3. Ensure you have credits/quota

---

## 📋 Quick Setup Checklist

- [ ] Generated service API key
- [ ] Added `AI_SERVICE_URL` and `AI_SERVICE_API_KEY` to `backend/.env`
- [ ] Added `SERVICE_API_KEY` to `ai-service/.env` (same key as backend)
- [ ] Created Qdrant cluster and added credentials
- [ ] Got Nomic API key and added to .env
- [ ] Got Mixtral API key and added to .env
- [ ] Installed Python dependencies (`pip install -r requirements.txt`)
- [ ] Downloaded spaCy model (`python -m spacy download en_core_web_sm`)
- [ ] Started AI service (`python run.py`)
- [ ] Restarted Node.js backend
- [ ] Tested health endpoint (`curl http://localhost:8000/health`)
- [ ] Tested AI features from frontend

---

## 🎯 Expected Result

After setup:
1. ✅ AI service running on port 8000
2. ✅ Backend running on port 5000
3. ✅ Frontend running on port 3000
4. ✅ Click "AI Actions" in dashboard
5. ✅ Click "Extract Text"
6. ✅ See extracted text in browser (not 403 error)

---

## 📞 Need Help?

If you're still stuck:

1. **Check AI service logs** - Look for errors in Python terminal
2. **Check backend logs** - Look for connection errors in Node terminal
3. **Check browser console** - Look for network errors
4. **Verify all .env files** - Make sure all keys are set

---

## 🚀 Once Working

After successful setup, you'll have:
- ✅ Text extraction from certificates
- ✅ Entity extraction (names, dates, IDs)
- ✅ Q&A on certificates
- ✅ Trust score calculation
- ✅ All results displayed in browser UI

---

**Use the generated API key above and follow the steps to fix the 403 error!** 🔑
