# Test Q&A Feature - Step by Step

## ✅ Backend is Ready!

Your backend has been updated and restarted. The auto-indexing feature is now active.

## 🧪 Test Steps

### Step 1: Extract Text (This will auto-index)
1. Go to your **User Dashboard** or **Issuer Dashboard**
2. Find a certificate
3. Click the **sparkle icon** (AI Actions)
4. Click **"Extract Text"** button
5. Wait for extraction to complete

**What to look for:**
- You should see the extracted text
- **NEW:** Look for a green message: ✓ Document indexed! You can now use "Ask Question" feature.

### Step 2: Ask a Question
1. Click **"Ask Question"** button (in the same AI Actions panel)
2. Type a question like:
   - "What is this document about?"
   - "Who is this certificate issued to?"
   - "What is the issue date?"
3. Click **"Ask"**

**Expected Result:**
- You should get a relevant answer
- Confidence should be > 0% (typically 70-95%)
- Answer should reference actual content from your certificate

## 🔍 What to Check in Backend Logs

After you extract text, you should see in the backend terminal:
```
✓ Document auto-indexed for certificate cert_xxxxx
```

If you see this, the indexing worked!

## ❌ If It Still Doesn't Work

### Check 1: Did you extract text AFTER the backend restarted?
- The backend just restarted at line 87-93 in terminal 8
- Any text extractions BEFORE that won't have auto-indexing
- **Solution:** Extract text again now

### Check 2: Is the certificate_id being sent?
Look in the browser Network tab:
1. Open DevTools (F12)
2. Go to Network tab
3. Extract text
4. Find the `/api/ai-enhanced/extract/text` request
5. Check Form Data - should include `certificate_id`

### Check 3: Backend logs
After extracting text, check terminal 8 for:
- ✓ Document auto-indexed for certificate... (SUCCESS)
- Auto-indexing failed: ... (ERROR - tells us what went wrong)

### Check 4: AI Service logs
Check terminal 9 for:
- Should see: POST /api/v1/documents/index
- Should NOT see errors

## 🐛 Common Issues

### Issue: "Found 0 results" in AI logs
**Cause:** Document not indexed
**Solution:** Extract text again (after backend restart)

### Issue: No "indexed: true" message
**Cause:** Indexing failed silently
**Solution:** Check backend logs for "Auto-indexing failed" message

### Issue: certificate_id is null/undefined
**Cause:** Frontend not passing certificate ID
**Solution:** Check that you're using the updated frontend code

## 📊 Expected Flow

```
User clicks "Extract Text"
    ↓
Frontend sends: file + certificate_id
    ↓
Backend extracts text
    ↓
Backend calls indexDocument()
    ↓
AI Service indexes in Qdrant
    ↓
Backend logs: ✓ Document auto-indexed
    ↓
Frontend shows: ✓ Document indexed!
    ↓
User clicks "Ask Question"
    ↓
AI Service searches Qdrant
    ↓
Finds relevant chunks (> 0 results)
    ↓
Generates answer with high confidence
```

## 🎯 Quick Test Commands

If you want to test the indexing directly, you can check Qdrant:

1. **Count documents in Qdrant:**
   - The AI service logs show this on startup
   - Look for: "Collection points count: X"

2. **Test a Q&A request:**
   - Extract text on a certificate
   - Ask a simple question
   - Check AI service logs for "Found X results" (should be > 0)

## ✨ Success Criteria

You'll know it's working when:
1. ✅ Extract text shows: "✓ Document indexed!"
2. ✅ Backend logs show: "✓ Document auto-indexed for certificate..."
3. ✅ AI logs show: "Found X results" (X > 0)
4. ✅ Q&A returns relevant answer with confidence > 70%

## 🚀 Next Steps After Success

Once Q&A works:
1. Test with different questions
2. Test with multiple certificates
3. Integrate Trust Score into verification page
4. Enjoy your AI-powered certificate system!

---

**Current Status:**
- ✅ Backend code updated
- ✅ Frontend code updated
- ✅ Backend restarted (PID 30696)
- ✅ AI service running with indexes
- ⏳ **Waiting for you to test!**

**Action Required:**
Go to your dashboard and extract text on a certificate now!
