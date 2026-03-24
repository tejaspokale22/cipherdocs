# Frontend AI Integration Guide

Complete guide for integrating AI-powered features in the CipherDocs frontend.

## Overview

The frontend now includes comprehensive AI features:
- **Document Extraction** - Extract text, entities, and tables
- **Trust Score** - Calculate document authenticity scores
- **Document Q&A** - Ask questions about certificates using RAG
- **Similarity Checker** - Compare documents for similarity

## New Files Created

### API Client
- `src/app/lib/aiEnhancedApi.js` - Client for all AI-enhanced endpoints

### Components
- `src/app/components/TrustScoreDisplay.jsx` - Display trust scores with visual indicators
- `src/app/components/DocumentQA.jsx` - Q&A interface for certificates
- `src/app/components/DocumentExtractor.jsx` - Extract data from documents
- `src/app/components/SimilarityChecker.jsx` - Compare two documents
- `src/app/components/EnhancedVerification.jsx` - Trust score for verification page

### Pages
- `src/app/(main)/ai-tools/page.jsx` - Centralized AI tools page

## Usage Examples

### 1. Trust Score on Verification Page

Add to your verification page (`verify/[certId]/page.jsx`):

```jsx
import EnhancedVerification from "@/app/components/EnhancedVerification";
import DocumentQA from "@/app/components/DocumentQA";

// Inside your component, after verification result
{result && result.status === "valid" && file && (
  <>
    {/* Trust Score */}
    <EnhancedVerification 
      certificateId={certId} 
      file={file} 
    />
    
    {/* Q&A */}
    <DocumentQA 
      certificateId={certId} 
      mode="question" 
    />
  </>
)}
```

### 2. Document Q&A on Certificate Details

Add to user dashboard or certificate detail pages:

```jsx
import DocumentQA from "@/app/components/DocumentQA";

<DocumentQA 
  certificateId={certificate.contractCertificateId}
  mode="chat"  // or "question"
/>
```

### 3. Extract Data from Uploaded Documents

```jsx
import { extractStructuredData } from "@/app/lib/aiEnhancedApi";
import { useState } from "react";

function DocumentUploader() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const handleFileUpload = async (file) => {
    try {
      const data = await extractStructuredData(file);
      setResult(data);
    } catch (error) {
      setError(error.message);
    }
  };
  
  return (
    <div>
      <input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} />
      
      {error && (
        <div className="text-red-600 mt-2">{error}</div>
      )}
      
      {result && (
        <div className="mt-4 space-y-2">
          <div>
            <strong>Persons:</strong> {result.entities.persons.join(', ')}
          </div>
          <div>
            <strong>Dates:</strong> {result.dates.join(', ')}
          </div>
          <div>
            <strong>IDs:</strong> {result.document_ids.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 4. Calculate Trust Score

```jsx
import { calculateTrustScore } from "@/app/lib/aiEnhancedApi";
import { useState } from "react";

function TrustScoreChecker() {
  const [trustScore, setTrustScore] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const checkTrust = async (uploadedFile, certId) => {
    setLoading(true);
    try {
      const result = await calculateTrustScore(uploadedFile, certId);
      setTrustScore(result);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {loading && <p>Calculating trust score...</p>}
      
      {trustScore && (
        <div className="border rounded-lg p-4">
          <div className="text-3xl font-bold">
            {trustScore.trust_score}/100
          </div>
          <div className="text-sm text-gray-600">
            Trust Level: {trustScore.trust_level}
          </div>
          <p className="mt-2">{trustScore.analysis}</p>
        </div>
      )}
    </div>
  );
}
```

### 5. Ask Questions About Documents

```jsx
import { askQuestion } from "@/app/lib/aiEnhancedApi";
import { useState } from "react";

function QuestionAsker({ certificateId }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const askAboutCertificate = async () => {
    setLoading(true);
    try {
      const result = await askQuestion(question, certificateId, 5);
      setAnswer(result);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button 
          onClick={askAboutCertificate}
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Ask
        </button>
      </div>
      
      {answer && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <p className="font-medium mb-2">Answer:</p>
          <p>{answer.answer}</p>
          <p className="text-sm text-gray-600 mt-2">
            Confidence: {(answer.confidence * 100).toFixed(0)}%
          </p>
        </div>
      )}
    </div>
  );
}
```

### 6. Semantic Search

```jsx
import { semanticSearch } from "@/app/lib/aiEnhancedApi";
import { useState } from "react";

function SemanticSearcher() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const searchDocuments = async () => {
    setLoading(true);
    try {
      const result = await semanticSearch(query, null, 10);
      setResults(result.results);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search documents..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button 
          onClick={searchDocuments}
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Search
        </button>
      </div>
      
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((result, idx) => (
            <div key={idx} className="border rounded p-3">
              <p className="text-sm">{result.text}</p>
              <p className="text-xs text-gray-500 mt-1">
                Relevance: {(result.score * 100).toFixed(0)}%
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 7. Compare Documents

```jsx
import { checkSimilarity } from "@/app/lib/aiEnhancedApi";
import { useState } from "react";

function DocumentComparer() {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const compareDocuments = async () => {
    if (!file1 || !file2) return;
    
    setLoading(true);
    try {
      const data = await checkSimilarity(file1, file2);
      setResult(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="file"
          onChange={(e) => setFile1(e.target.files[0])}
          className="border rounded p-2"
        />
        <input
          type="file"
          onChange={(e) => setFile2(e.target.files[0])}
          className="border rounded p-2"
        />
      </div>
      
      <button
        onClick={compareDocuments}
        disabled={loading || !file1 || !file2}
        className="w-full px-4 py-2 bg-black text-white rounded"
      >
        {loading ? "Comparing..." : "Compare Documents"}
      </button>
      
      {result && (
        <div className="border rounded-lg p-4">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold">
              {result.similarity_percentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">
              {result.verdict}
            </div>
          </div>
          
          {result.differences.length > 0 && (
            <div className="mt-4">
              <p className="font-medium mb-2">Differences:</p>
              <ul className="space-y-1">
                {result.differences.map((diff, idx) => (
                  <li key={idx} className="text-sm text-red-600">
                    • {diff}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

## Component Props

### TrustScoreDisplay

```jsx
<TrustScoreDisplay 
  trustScoreData={{
    trust_score: 92,
    trust_level: "HIGH",
    similarity_score: 95,
    structural_score: 90,
    metadata_score: 88,
    analysis: "Document appears authentic...",
    recommendations: ["Document appears authentic"]
  }}
/>
```

### DocumentQA

```jsx
<DocumentQA 
  certificateId="cert_123"
  mode="question"  // "question" or "chat"
/>
```

### DocumentExtractor

```jsx
<DocumentExtractor />
// Standalone component, no props needed
```

### SimilarityChecker

```jsx
<SimilarityChecker />
// Standalone component, no props needed
```

### EnhancedVerification

```jsx
<EnhancedVerification 
  certificateId="cert_123"
  file={uploadedFile}  // File object
/>
```

## Navigation Integration

Add AI Tools to your navigation:

```jsx
// In Navbar.jsx or similar
<Link 
  href="/ai-tools"
  className="nav-link"
>
  AI Tools
</Link>
```

## Styling

All components use Tailwind CSS and match your existing design system:
- Black primary color
- Clean, modern UI
- Responsive design
- Smooth animations

## Error Handling

All API calls include proper error handling:

```jsx
const [result, setResult] = useState(null);
const [error, setError] = useState(null);

try {
  const data = await extractText(file);
  setResult(data);
  setError(null);
} catch (error) {
  setError(error.message);
  setResult(null);
}

// Display in UI
{error && (
  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
    {error}
  </div>
)}

{result && (
  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded">
    Success! {result.text}
  </div>
)}
```

## Loading States

All components include loading indicators:

```jsx
{loading && (
  <div className="flex items-center gap-2">
    <Loader2 className="h-5 w-5 animate-spin" />
    <span>Processing...</span>
  </div>
)}
```

## Authentication

All AI endpoints require authentication. The API client automatically includes credentials:

```javascript
credentials: "include"  // Sends JWT cookie
```

Users must be logged in to use AI features.

## Performance Considerations

### 1. Lazy Loading
Load AI components only when needed:

```jsx
import dynamic from 'next/dynamic';

const DocumentQA = dynamic(() => import('@/app/components/DocumentQA'), {
  loading: () => <p>Loading Q&A...</p>
});
```

### 2. Debouncing
For search features, debounce user input:

```jsx
import { useDebounce } from '@/app/hooks/useDebounce';

const debouncedQuery = useDebounce(query, 500);
```

### 3. Caching
Consider caching AI results:

```jsx
import useSWR from 'swr';

const { data } = useSWR(
  certificateId ? `/api/ai-enhanced/stats/${certificateId}` : null,
  fetcher
);
```

## Best Practices

### 1. User Feedback
Always show loading states and errors:

```jsx
{loading && <Spinner />}
{error && <ErrorMessage message={error} />}
{data && <SuccessView data={data} />}
```

### 2. Progressive Enhancement
Make AI features optional enhancements:

```jsx
// Show basic verification first
<BasicVerification />

// Then offer AI enhancement
{verified && (
  <button onClick={calculateTrustScore}>
    Enhance with AI Trust Score
  </button>
)}
```

### 3. Clear CTAs
Use descriptive button text:

```jsx
// Good
<button>Calculate AI Trust Score</button>

// Bad
<button>Analyze</button>
```

### 4. Explain Features
Add tooltips or info text:

```jsx
<div>
  <h3>Trust Score</h3>
  <p className="text-sm text-gray-600">
    AI-powered authenticity analysis comparing uploaded document 
    with blockchain-verified original
  </p>
</div>
```

## Mobile Responsiveness

All components are mobile-responsive:

```jsx
// Grid layouts
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

// Responsive text
<h1 className="text-2xl sm:text-3xl lg:text-4xl">

// Responsive padding
<div className="p-4 sm:p-6 lg:p-8">
```

## Accessibility

Components include proper ARIA labels:

```jsx
<button
  aria-label="Calculate trust score"
  aria-busy={loading}
>
  Calculate Trust Score
</button>
```

## Testing

### Manual Testing Checklist

- [ ] Upload document and extract text
- [ ] Extract structured data (entities, dates)
- [ ] Extract tables from PDF
- [ ] Ask question about certificate
- [ ] Chat with document
- [ ] Calculate trust score
- [ ] Compare two documents
- [ ] Test error handling (invalid files, network errors)
- [ ] Test loading states
- [ ] Test on mobile devices

### Example Test Flow

1. Go to `/ai-tools`
2. Upload a PDF to Document Extractor
3. Click "Extract Text" - should show extracted text
4. Click "Extract Entities" - should show names, dates, IDs
5. Switch to Similarity Checker
6. Upload two similar PDFs
7. Click "Compare" - should show similarity score
8. Go to a verified certificate page
9. Click "Calculate AI Trust Score"
10. Should show trust score with analysis

## Troubleshooting

### "Failed to fetch" error
- Check if backend is running on correct port
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors

### "Authentication failed"
- User must be logged in
- Check if JWT cookie is being sent
- Verify cookie settings in backend

### "AI Service connection failed"
- Check if Python AI service is running
- Verify backend can reach AI service
- Check `AI_SERVICE_URL` in backend `.env`

### Components not rendering
- Check for JavaScript errors in console
- Verify all imports are correct
- Check if file paths match your structure

## Environment Variables

Add to `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Future Enhancements

Potential additions:
- [ ] Batch document processing
- [ ] Document summarization
- [ ] Multi-language support
- [ ] Voice input for Q&A
- [ ] Export AI analysis reports
- [ ] Real-time collaboration on Q&A
- [ ] Advanced search filters
- [ ] Document comparison history

## Support

For issues:
1. Check browser console for errors
2. Verify backend and AI service are running
3. Check network tab for failed requests
4. Review this guide for correct usage
5. Check backend logs for API errors

## Example Integration: Complete Verification Flow

```jsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import EnhancedVerification from "@/app/components/EnhancedVerification";
import DocumentQA from "@/app/components/DocumentQA";

export default function VerifyPage() {
  const { certId } = useParams();
  const [file, setFile] = useState(null);
  const [verified, setVerified] = useState(false);

  const handleVerify = async (uploadedFile) => {
    setFile(uploadedFile);
    // ... verification logic ...
    setVerified(true);
  };

  return (
    <div className="container mx-auto py-12">
      {/* Step 1: Upload and verify */}
      <VerificationUpload onVerify={handleVerify} />

      {/* Step 2: Show verification result */}
      {verified && (
        <>
          <VerificationResult />
          
          {/* Step 3: AI Enhancement */}
          <div className="mt-8 space-y-8">
            <EnhancedVerification 
              certificateId={certId}
              file={file}
            />
            
            <DocumentQA 
              certificateId={certId}
              mode="question"
            />
          </div>
        </>
      )}
    </div>
  );
}
```

This integration provides a complete, production-ready AI-powered document verification and analysis system! 🚀
