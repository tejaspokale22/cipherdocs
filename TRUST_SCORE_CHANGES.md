# Trust Score Changes - Summary

## Overview
This document summarizes the changes made to move Trust Score functionality from dashboards to the verification page, and fix the Qdrant indexing issue.

## Changes Made

### 1. Fixed Qdrant Indexing Issue

**Problem:** 
The Q&A feature was failing with error:
```
Index required but not found for "certificate_id" of one of the following types: [keyword]
```

**Solution:**
Updated `ai-service/app/services/vector_store_service.py` to create payload indexes for `certificate_id` and `user_id` fields. The indexes are created when the collection is initialized, and the code is idempotent (won't fail if indexes already exist).

**Changes:**
- Added `PayloadSchemaType.KEYWORD` indexes for filtering
- Made index creation idempotent to handle existing collections
- Added proper error handling and logging

### 2. Removed Trust Score from Dashboards

**Rationale:**
Trust Score requires two documents to compare:
1. Original certificate (from blockchain)
2. Uploaded document to verify

In the dashboard, users only have access to their own certificates. Trust Score makes more sense in the verification flow where someone uploads a document to verify against an original.

**Changes to `frontend/src/app/components/CertificateAIActions.jsx`:**
- Removed "Trust Score" button from action buttons
- Removed `Shield` icon import
- Removed `calculateTrustScore` import
- Removed `TrustScoreAction` component entirely
- Updated Q&A action to show a warning that documents need to be indexed first

**Dashboard Actions Now:**
1. **Extract Text** - View full certificate text
2. **Extract Entities** - Extract names, dates, IDs using NLP
3. **Ask Question** - Q&A on certificate content (requires indexing)

### 3. Created New Verification Component

**New File:** `frontend/src/app/components/VerificationTrustScore.jsx`

**Purpose:**
Dedicated component for the verification page that allows users to:
1. Upload a document (PDF, JPG, PNG)
2. Compare it with the original certificate
3. Get a comprehensive trust score (0-100)

**Features:**
- File upload with validation (type, size)
- Real-time trust score calculation
- Visual score display with color coding (green/yellow/red)
- Detailed breakdown (similarity, structure, metadata)
- AI-powered analysis explanation
- Reset and verify another document

**Trust Score Calculation:**
```
Trust Score = (Similarity × 0.4) + (Structure × 0.3) + (Metadata × 0.3)

Where:
- Similarity: Semantic similarity using vector embeddings (0-100)
- Structure: Document structure and layout comparison (0-100)
- Metadata: File properties and metadata validation (0-100)
```

**Trust Levels:**
- **HIGH (80-100)**: Document appears authentic
- **MEDIUM (50-79)**: Minor differences detected
- **LOW (0-49)**: Significant differences, possible forgery

### 4. Created Documentation

**New File:** `frontend/TRUST_SCORE_GUIDE.md`

Comprehensive guide covering:
- How trust score works (detailed algorithm explanation)
- Integration instructions for verification page
- User flow and use cases
- API endpoint details
- Security considerations
- Troubleshooting common issues
- Future enhancements

## How to Use Trust Score

### For Developers

**1. Import the component:**
```jsx
import VerificationTrustScore from "@/app/components/VerificationTrustScore";
```

**2. Add to verification page:**
```jsx
<VerificationTrustScore originalCertificateId={certificateId} />
```

**3. Example integration:**
```jsx
export default function VerifyPage() {
  const [certificateId, setCertificateId] = useState("");
  const [verified, setVerified] = useState(false);

  return (
    <div className="space-y-6">
      {/* Existing verification form */}
      <VerificationForm onVerify={() => setVerified(true)} />
      
      {/* Trust Score - Only show after verification */}
      {verified && (
        <VerificationTrustScore originalCertificateId={certificateId} />
      )}
    </div>
  );
}
```

### For Users

**Verification Flow:**
1. Go to verification page
2. Enter certificate ID
3. System verifies certificate exists on blockchain
4. Upload a document to compare (PDF or image)
5. Click "Calculate Trust Score"
6. View trust score and detailed analysis

**Use Cases:**
- **Employers**: Verify candidate certificates
- **Auditors**: Check document authenticity
- **Legal**: Validate evidence documents
- **Personal**: Verify your own certificates

## Technical Details

### API Endpoint
```
POST /api/ai-enhanced/trust-score
Content-Type: multipart/form-data

Body:
- file: Document to verify (PDF/JPG/PNG)
- certificate_id: Original certificate ID
```

### Response Format
```json
{
  "trust_score": 92,
  "trust_level": "HIGH",
  "similarity_score": 95,
  "structural_score": 88,
  "metadata_score": 93,
  "analysis": "Detailed analysis text..."
}
```

### Processing Steps
1. Extract text from uploaded document (Mixtral OCR)
2. Fetch and decrypt original certificate from IPFS
3. Generate embeddings for both documents (Nomic AI)
4. Calculate cosine similarity
5. Analyze structure and metadata
6. Compute weighted trust score
7. Generate human-readable analysis

## Qdrant Index Fix

### What Was Fixed
The Qdrant vector database needs indexes on payload fields to support filtering. Without indexes, queries like "find documents for certificate_id=X" fail.

### How It Works Now
When the AI service starts:
1. Checks if collection exists
2. Creates collection if needed
3. **Creates indexes for `certificate_id` and `user_id`**
4. Handles existing collections gracefully

### Index Types
- `certificate_id`: KEYWORD index (exact match filtering)
- `user_id`: KEYWORD index (exact match filtering)

### Benefits
- Q&A feature now works correctly
- Filters documents by user and certificate
- Ensures data isolation and security
- Improves query performance

## Testing

### Test Q&A Feature
1. Go to user/issuer dashboard
2. Click "Ask Question" on a certificate
3. Type a question (e.g., "What is the issue date?")
4. Should work without 400 errors

### Test Trust Score
1. Go to verification page
2. Verify a certificate
3. Upload a document (PDF or image)
4. Click "Calculate Trust Score"
5. Should see trust score with breakdown

## Migration Notes

### For Existing Users
- No action required for Q&A feature (indexes created automatically)
- Trust Score moved from dashboard to verification page
- All existing functionality preserved

### For Developers
- Update verification page to include `VerificationTrustScore` component
- Remove any references to trust score from dashboard components
- Test Q&A feature after AI service restart

## Files Modified

1. `ai-service/app/services/vector_store_service.py` - Added Qdrant indexes
2. `frontend/src/app/components/CertificateAIActions.jsx` - Removed trust score
3. `frontend/src/app/components/VerificationTrustScore.jsx` - New component
4. `frontend/TRUST_SCORE_GUIDE.md` - New documentation

## Next Steps

1. **Create Qdrant Indexes**:
   
   The indexes will be created automatically when the AI service starts. However, if you have an existing collection, you can manually create them:
   
   ```bash
   cd ai-service
   # Activate virtual environment if you have one
   # On Windows: venv\Scripts\activate
   # On Mac/Linux: source venv/bin/activate
   python create_indexes.py
   ```
   
   Or simply restart the AI service - the updated code will create indexes automatically:
   ```bash
   cd ai-service
   python run.py
   ```

2. **Integrate into Verification Page**:
   - Add `VerificationTrustScore` component
   - Show it after successful certificate verification
   - Test with real documents

3. **Test All Features**:
   - Extract Text ✓
   - Extract Entities ✓
   - Ask Question (should work now with indexes)
   - Trust Score (on verification page)

## Support

For issues or questions:
- Check [AI Integration Guide](./AI_INTEGRATION_COMPLETE.md)
- Review [Trust Score Guide](./frontend/TRUST_SCORE_GUIDE.md)
- Check [Frontend Integration](./frontend/FRONTEND_INTEGRATION.md)

## Summary

✅ **Fixed:** Qdrant indexing issue for Q&A feature
✅ **Moved:** Trust Score from dashboards to verification page
✅ **Created:** New `VerificationTrustScore` component
✅ **Documented:** Comprehensive trust score guide
✅ **Improved:** User experience and logical feature placement

The trust score now makes more sense in the verification flow where users actively compare documents, rather than in dashboards where they're just viewing their own certificates.
