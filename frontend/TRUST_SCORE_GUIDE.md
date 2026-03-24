# Trust Score Verification Guide

## Overview

The Trust Score feature uses AI to verify document authenticity by comparing an uploaded document with the original certificate stored on the blockchain. It provides a comprehensive score (0-100) based on semantic similarity, structural analysis, and metadata comparison.

## How Trust Score Works

### 1. **Text Extraction**
- Extracts text from both the uploaded document and the original certificate
- Supports PDF and image formats (JPG, PNG)
- Uses Mixtral OCR for advanced image text extraction

### 2. **Semantic Similarity Analysis (40% weight)**
- Converts both documents into vector embeddings using Nomic AI
- Calculates cosine similarity between embeddings
- Measures how similar the content meaning is, not just exact text matches
- Score range: 0-100

### 3. **Structural Analysis (30% weight)**
- Compares document structure (paragraphs, sections, formatting)
- Analyzes text length and organization
- Checks for consistent document layout
- Score range: 0-100

### 4. **Metadata Analysis (30% weight)**
- Compares file properties (creation date, author, etc.)
- Validates document type and format
- Checks for tampering indicators
- Score range: 0-100

### 5. **Final Trust Score**
```
Trust Score = (Similarity × 0.4) + (Structure × 0.3) + (Metadata × 0.3)
```

### Trust Levels
- **HIGH (80-100)**: Document appears authentic and matches the original
- **MEDIUM (50-79)**: Document has minor differences, may be a legitimate copy
- **LOW (0-49)**: Significant differences detected, possible forgery

## Integration in Verification Page

### Location
The Trust Score component should be integrated into the certificate verification page, where users can:
1. Verify a certificate using its ID
2. Upload a document to compare with the original
3. Get an AI-powered trust score

### Component Usage

```jsx
import VerificationTrustScore from "@/app/components/VerificationTrustScore";

// In your verification page
<VerificationTrustScore originalCertificateId={certificateId} />
```

### Example Integration

```jsx
"use client";

import { useState } from "react";
import VerificationTrustScore from "@/app/components/VerificationTrustScore";

export default function VerifyPage() {
  const [certificateId, setCertificateId] = useState("");
  const [verified, setVerified] = useState(false);

  const handleVerify = async () => {
    // Your existing verification logic
    // ...
    setVerified(true);
  };

  return (
    <div className="space-y-6">
      {/* Existing verification form */}
      <div className="rounded-lg bg-white p-6">
        <input
          type="text"
          value={certificateId}
          onChange={(e) => setCertificateId(e.target.value)}
          placeholder="Enter certificate ID"
        />
        <button onClick={handleVerify}>Verify Certificate</button>
      </div>

      {/* Trust Score Section - Only show after verification */}
      {verified && (
        <VerificationTrustScore originalCertificateId={certificateId} />
      )}
    </div>
  );
}
```

## User Flow

1. **User verifies a certificate** using the certificate ID
2. **System displays certificate details** (name, issuer, date, etc.)
3. **User sees "AI Trust Score Verification" section**
4. **User uploads a document** (PDF or image) to compare
5. **System analyzes the document** using AI
6. **User receives trust score** with detailed breakdown

## API Endpoint

The trust score is calculated via:
```
POST /api/ai-enhanced/trust-score
```

**Request:**
```javascript
const formData = new FormData();
formData.append("file", uploadedFile);
formData.append("certificate_id", originalCertificateId);

const response = await fetch("/api/ai-enhanced/trust-score", {
  method: "POST",
  body: formData,
  credentials: "include",
});
```

**Response:**
```json
{
  "trust_score": 92,
  "trust_level": "HIGH",
  "similarity_score": 95,
  "structural_score": 88,
  "metadata_score": 93,
  "analysis": "The uploaded document shows high similarity to the original certificate. Text content matches 95% semantically, with consistent structure and valid metadata. Minor differences in formatting detected but within acceptable range for authentic documents."
}
```

## Security Considerations

1. **Authentication Required**: Users must be logged in to use trust score
2. **Data Isolation**: Users can only verify their own certificates
3. **File Validation**: 
   - Max file size: 10MB
   - Allowed formats: PDF, JPG, PNG
   - File type validation on both frontend and backend
4. **Rate Limiting**: Consider implementing rate limits to prevent abuse

## Use Cases

### 1. **Employer Verification**
An employer receives a certificate from a job candidate and wants to verify its authenticity:
- Enter the certificate ID from the candidate's document
- Upload the physical/digital copy provided by the candidate
- Get instant trust score to determine authenticity

### 2. **Document Audit**
An organization needs to audit certificates issued years ago:
- Retrieve original certificate from blockchain
- Upload current copy held in records
- Verify no tampering has occurred

### 3. **Legal Proceedings**
A certificate is presented as evidence in legal proceedings:
- Verify the certificate exists on blockchain
- Upload the presented document
- Get objective AI-powered authenticity score

## Best Practices

1. **Clear Instructions**: Provide clear guidance on what documents to upload
2. **File Requirements**: Display file size and format requirements prominently
3. **Processing Time**: Show loading state during analysis (can take 5-10 seconds)
4. **Result Interpretation**: Explain what each trust level means
5. **Privacy Notice**: Inform users that uploaded documents are analyzed but not stored

## Troubleshooting

### Low Trust Score for Authentic Documents

**Possible Reasons:**
- Document is a scanned copy (lower quality)
- Different file format (PDF vs image)
- Compression artifacts in images
- Minor edits or annotations added

**Solution:**
- Upload the highest quality version available
- Use the original file format if possible
- Remove any annotations or marks before uploading

### Error: "Failed to calculate trust score"

**Possible Causes:**
- File is corrupted or unreadable
- Certificate not found in database
- Network connectivity issues
- AI service unavailable

**Solution:**
- Verify the certificate ID is correct
- Try uploading a different file format
- Check your internet connection
- Contact support if issue persists

## Future Enhancements

1. **Batch Verification**: Verify multiple documents at once
2. **Historical Tracking**: Track trust scores over time
3. **Detailed Diff View**: Show specific differences between documents
4. **Blockchain Recording**: Store trust score results on blockchain
5. **Email Reports**: Send verification reports via email
6. **API Access**: Provide API for automated verification

## Technical Details

### Vector Embeddings
- Model: `nomic-embed-text-v1.5`
- Dimension: 768
- Distance metric: Cosine similarity

### OCR
- Engine: Mixtral Pixtral-12B
- Supports: Multi-language text extraction
- Handles: Rotated, skewed, and low-quality images

### Performance
- Average processing time: 5-10 seconds
- Concurrent requests: Supported
- Caching: Embeddings cached for 24 hours

## Support

For issues or questions:
- Check the [AI Integration Guide](../AI_INTEGRATION_COMPLETE.md)
- Review [Frontend Integration](./FRONTEND_INTEGRATION.md)
- Contact: support@cipherdocs.com
