# CipherDocs AI Features - Frontend

Quick reference for AI-powered features in the CipherDocs frontend.

## 🚀 Quick Start

### 1. Try the Demo Page
Visit `/ai-demo` to see all features with live browser UI:
- Text extraction with results display
- Entity extraction with colored tags
- Trust score with visual indicators
- Q&A with answers and sources
- Similarity check with percentage display

### 2. Use AI Tools Page
Visit `/ai-tools` for:
- Document text extraction
- Entity extraction (names, dates, IDs)
- Table extraction
- Document similarity comparison

### 3. Add Trust Score to Verification

```jsx
import EnhancedVerification from "@/app/components/EnhancedVerification";

<EnhancedVerification 
  certificateId={certId} 
  file={uploadedFile} 
/>
```

### 4. Add Q&A to Certificate Pages

```jsx
import DocumentQA from "@/app/components/DocumentQA";

<DocumentQA 
  certificateId={certId} 
  mode="question" 
/>
```

## 📦 Available Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `TrustScoreDisplay` | Show trust score results | `trustScoreData` |
| `DocumentQA` | Ask questions about certificates | `certificateId`, `mode` |
| `DocumentExtractor` | Extract data from documents | None (standalone) |
| `SimilarityChecker` | Compare two documents | None (standalone) |
| `EnhancedVerification` | Trust score for verification | `certificateId`, `file` |

## 🔧 API Functions

All functions in `src/app/lib/aiEnhancedApi.js`:

```javascript
// Extraction
await extractText(file)
await extractStructuredData(file)
await extractTables(file)

// Q&A
await askQuestion(question, certificateId, topK)
await chatWithDocument(message, certificateId, history)
await semanticSearch(query, certificateId, topK)

// Trust & Verification
await calculateTrustScore(file, certificateId)
await checkSimilarity(file1, file2)
await verifyAuthenticity(file, certificateId)

// Management
await indexDocument(file, certificateId, metadata)
await deleteDocument(certificateId)
await getDocumentStats(certificateId)
```

## 🎨 UI Components

### Trust Score Display
Shows score with color-coded indicators:
- **HIGH (85-100)**: Green
- **MEDIUM (60-84)**: Yellow
- **LOW (0-59)**: Red

### Document Q&A
Floating chat interface with:
- Sample questions
- Message history
- Source citations
- Confidence scores

### Document Extractor
Tabbed interface for:
- Text extraction
- Entity extraction (NER)
- Table extraction

### Similarity Checker
Side-by-side comparison with:
- Similarity percentage
- Verdict (IDENTICAL/SIMILAR/DIFFERENT)
- Key differences
- Common elements

## 🔐 Authentication

All AI features require user authentication. API calls automatically include JWT cookie.

## 📱 Mobile Support

All components are fully responsive and work on mobile devices.

## ⚡ Performance

- Lazy load components when needed
- Show loading states during processing
- Handle errors gracefully
- Cache results when appropriate

## 🎯 Integration Points

### Verification Page
Add trust score after successful verification:
```jsx
{verified && <EnhancedVerification certificateId={id} file={file} />}
```

### User Dashboard
Add Q&A for certificates:
```jsx
<DocumentQA certificateId={cert.id} mode="chat" />
```

### Navigation
Add AI Tools link:
```jsx
<Link href="/ai-tools">AI Tools</Link>
```

## 🐛 Troubleshooting

**Components not showing?**
- Check if user is authenticated
- Verify backend is running
- Check browser console for errors

**API calls failing?**
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check backend logs
- Ensure AI service is running

**Styling issues?**
- Components use Tailwind CSS
- Ensure Tailwind is configured
- Check for class name conflicts

## 📚 Full Documentation

See `FRONTEND_INTEGRATION.md` for complete integration guide with examples and best practices.

## 🎉 Features Overview

✅ Document text extraction (PDF, images)
✅ Entity extraction (names, dates, IDs, emails)
✅ Table extraction from PDFs
✅ Trust score calculation (0-100)
✅ Document similarity comparison
✅ RAG-based Q&A on certificates
✅ Multi-turn chat with documents
✅ Semantic search across documents
✅ Authenticity verification
✅ Real-time processing with loading states
✅ Mobile-responsive design
✅ Error handling and user feedback

## 🚦 Status Indicators

Components show clear status:
- 🔵 Loading - Processing your request
- ✅ Success - Results displayed
- ❌ Error - Clear error message with retry option

## 💡 Tips

1. **Start with AI Tools page** - Test features independently
2. **Add trust score to verification** - Enhance user confidence
3. **Enable Q&A on dashboards** - Help users understand their certificates
4. **Use semantic search** - Let users find certificates by content
5. **Show loading states** - Keep users informed during processing

---

Built with ❤️ for CipherDocs
