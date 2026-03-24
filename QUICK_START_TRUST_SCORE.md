# Quick Start: Trust Score & Q&A Fix

## What Changed?

### ✅ Fixed Q&A Feature
The "Ask Question" feature was failing with a Qdrant index error. This is now fixed by automatically creating indexes for `certificate_id` and `user_id` fields.

### ✅ Moved Trust Score to Verification Page
Trust Score has been removed from dashboards and moved to the verification page where it makes more sense (comparing uploaded document with original).

## Current Status

### Working Features in Dashboards:
1. ✅ **Extract Text** - View full certificate text + **auto-indexes for Q&A**
2. ✅ **Extract Entities** - Extract names, dates, IDs using NLP
3. ✅ **Ask Question** - Q&A on certificate content (works after extracting text)

### New Feature for Verification Page:
4. ✅ **Trust Score** - Upload a document and compare with original
   - Component: `VerificationTrustScore.jsx`
   - Shows similarity, structure, and metadata scores
   - Provides detailed AI analysis

## How to Test

### Test Q&A (Dashboard)
1. Go to User Dashboard or Issuer Dashboard
2. Click on a certificate's "AI Actions" button
3. **First, click "Extract Text"** (this auto-indexes the document)
4. Wait for extraction to complete - you'll see: ✓ Document indexed!
5. Click "Ask Question"
6. Type: "What is in the document?"
7. Click "Ask"

**Expected Result:**
- Should get a relevant answer with confidence > 0%
- Example: "This is a certificate for [name] issued on [date]..."

### Test Trust Score (Verification Page)
1. **First, integrate the component** into your verification page:

```jsx
import VerificationTrustScore from "@/app/components/VerificationTrustScore";

// In your verification page, after successful verification:
{verified && (
  <VerificationTrustScore originalCertificateId={certificateId} />
)}
```

2. Go to verification page
3. Verify a certificate
4. Upload a document (PDF or image)
5. Click "Calculate Trust Score"

**Expected Result:**
- Shows trust score (0-100)
- Shows breakdown (similarity, structure, metadata)
- Shows detailed AI analysis
- Color-coded trust level (green/yellow/red)

## Files to Update

### 1. Your Verification Page
You need to integrate the `VerificationTrustScore` component into your verification page. Example:

```jsx
// pages/verify.jsx or wherever your verification page is

"use client";

import { useState } from "react";
import VerificationTrustScore from "@/app/components/VerificationTrustScore";

export default function VerifyPage() {
  const [certificateId, setCertificateId] = useState("");
  const [verified, setVerified] = useState(false);
  const [certificateData, setCertificateData] = useState(null);

  const handleVerify = async () => {
    // Your existing verification logic
    try {
      const response = await fetch(`/api/certificates/verify/${certificateId}`);
      const data = await response.json();
      
      if (data.valid) {
        setCertificateData(data.certificate);
        setVerified(true);
      }
    } catch (error) {
      console.error("Verification failed:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Verify Certificate</h1>
      
      {/* Verification Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <input
          type="text"
          value={certificateId}
          onChange={(e) => setCertificateId(e.target.value)}
          placeholder="Enter Certificate ID"
          className="w-full px-4 py-2 border rounded-lg"
        />
        <button
          onClick={handleVerify}
          className="mt-4 px-6 py-2 bg-black text-white rounded-lg"
        >
          Verify Certificate
        </button>
      </div>

      {/* Certificate Details (if verified) */}
      {verified && certificateData && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Certificate Details</h2>
          <p><strong>Name:</strong> {certificateData.name}</p>
          <p><strong>Issuer:</strong> {certificateData.issuer}</p>
          <p><strong>Date:</strong> {certificateData.date}</p>
          {/* Add more certificate details */}
        </div>
      )}

      {/* Trust Score Section - Only show after verification */}
      {verified && (
        <VerificationTrustScore originalCertificateId={certificateId} />
      )}
    </div>
  );
}
```

## No Action Required

The Q&A fix is automatic! The updated code in `vector_store_service.py` will create indexes when needed. You don't need to:
- Manually create indexes
- Run any scripts
- Restart services (unless you want to)

The indexes will be created automatically when:
1. The AI service starts up, OR
2. The first Q&A request is made

## Troubleshooting

### Q&A Still Shows Index Error

**Solution 1: Wait for Auto-Creation**
The indexes are created automatically. Try the Q&A request again after a few seconds.

**Solution 2: Restart AI Service**
```bash
# Stop the current AI service (Ctrl+C)
cd ai-service
python run.py
```

**Solution 3: Check Logs**
Look at the AI service terminal output. You should see:
```
INFO: Created/verified index for certificate_id
INFO: Created/verified index for user_id
```

### Trust Score Not Showing

Make sure you:
1. Integrated `VerificationTrustScore` component into your verification page
2. Only show it after successful certificate verification
3. Pass the correct `originalCertificateId` prop

## Documentation

For detailed information, see:
- `TRUST_SCORE_CHANGES.md` - Complete summary of changes
- `frontend/TRUST_SCORE_GUIDE.md` - Comprehensive trust score guide
- `frontend/FRONTEND_INTEGRATION.md` - Frontend integration guide
- `AI_INTEGRATION_COMPLETE.md` - Full AI integration overview

## Summary

✅ **Q&A Feature**: Fixed automatically with Qdrant indexes
✅ **Trust Score**: Moved to verification page with new component
✅ **Dashboards**: Cleaner with 3 focused actions (Extract Text, Entities, Q&A)
✅ **Verification**: Enhanced with AI-powered trust score

**Next Step**: Integrate `VerificationTrustScore` into your verification page!
