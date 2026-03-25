"""
Document extraction service
"""

import io
import base64
import requests
from typing import Dict, Any, List
from loguru import logger
import pypdf
import pdfplumber
from PIL import Image

from app.core.config import settings
from app.core.exceptions import DocumentProcessingError


class ExtractionService:
    """Service for extracting text and data from documents"""
    
    def __init__(self):
        """Initialize OCR.space API"""
        self.ocr_api_key = settings.OCR_SPACE_API_KEY
        self.ocr_api_url = "https://api.ocr.space/parse/image"
    
    async def extract_text(self, content: bytes, filename: str) -> Dict[str, Any]:
        """
        Extract raw text from document
        
        Args:
            content: File content as bytes
            filename: Original filename
            
        Returns:
            Dictionary with extracted text and metadata
        """
        try:
            file_ext = filename.lower().split('.')[-1]
            
            if file_ext == 'pdf':
                return await self._extract_from_pdf(content)
            elif file_ext in ['png', 'jpg', 'jpeg', 'tiff', 'bmp']:
                return await self._extract_from_image(content)
            else:
                raise DocumentProcessingError(f"Unsupported file type: {file_ext}")
                
        except Exception as e:
            logger.error(f"Text extraction failed: {str(e)}")
            raise DocumentProcessingError(f"Failed to extract text: {str(e)}")
    
    async def _extract_from_pdf(self, content: bytes) -> Dict[str, Any]:
        """Extract text from PDF"""
        try:
            # Try pypdf first
            pdf_file = io.BytesIO(content)
            reader = pypdf.PdfReader(pdf_file)
            page_count = len(reader.pages)
            
            text_parts = []
            for page in reader.pages:
                text_parts.append(page.extract_text())
            
            text = "\n\n".join(text_parts)
            
            # If pypdf extraction is poor, try pdfplumber
            if len(text.strip()) < 100:
                pdf_file.seek(0)
                with pdfplumber.open(pdf_file) as pdf:
                    text_parts = [page.extract_text() or "" for page in pdf.pages]
                    text = "\n\n".join(text_parts)
            
            # If still no text (image-based PDF), use Mixtral OCR
            if len(text.strip()) < 50:
                logger.info("PDF appears to be image-based, using Mixtral OCR")
                text = await self._extract_from_pdf_with_ocr(content, page_count)
                extraction_method = "mixtral_ocr"
            else:
                extraction_method = "pdf"
            
            return {
                "text": text.strip(),
                "page_count": page_count,
                "metadata": {
                    "extraction_method": extraction_method,
                    "pages": page_count,
                }
            }
            
        except Exception as e:
            raise DocumentProcessingError(f"PDF extraction failed: {str(e)}")
    
    async def _extract_from_pdf_with_ocr(self, content: bytes, page_count: int) -> str:
        """Extract text from image-based PDF using OCR.space API"""
        try:
            logger.info(f"Using OCR.space API for image-based PDF with {page_count} pages")
            
            # Convert PDF to base64
            base64_pdf = base64.b64encode(content).decode('utf-8')
            
            # Prepare payload for OCR.space API
            payload = {
                'base64Image': f'data:application/pdf;base64,{base64_pdf}',
                'language': 'eng',
                'isOverlayRequired': False,
                'detectOrientation': True,
                'scale': True,  # Improves OCR for low-res scans
                'OCREngine': 2,  # Engine 2 is better for complex layouts
            }
            
            # Make request to OCR.space API
            response = requests.post(
                self.ocr_api_url,
                data=payload,
                headers={'apikey': self.ocr_api_key},
                timeout=60
            )
            
            result = response.json()
            
            # Check for errors
            if result.get('IsErroredOnProcessing'):
                error_msg = result.get('ErrorMessage', 'Unknown error')
                logger.error(f"OCR.space API error: {error_msg}")
                return ""
            
            # Extract text from all pages
            text_parts = []
            parsed_results = result.get('ParsedResults', [])
            
            for page_result in parsed_results:
                if page_result.get('FileParseExitCode') == 1:
                    page_text = page_result.get('ParsedText', '')
                    if page_text:
                        text_parts.append(page_text)
                else:
                    error_msg = page_result.get('ErrorMessage', 'Parse failed')
                    logger.warning(f"Page parse failed: {error_msg}")
            
            if not text_parts:
                logger.warning("No text extracted from PDF using OCR")
                return ""
            
            return "\n\n".join(text_parts)
            
        except Exception as e:
            logger.error(f"OCR.space API failed: {str(e)}")
            return ""
    
    async def _extract_from_image(self, content: bytes) -> Dict[str, Any]:
        """Extract text from image using OCR.space API"""
        try:
            # Open image to get size
            image = Image.open(io.BytesIO(content))
            image_size = image.size
            image_format = image.format.lower() if image.format else 'png'
            
            # Convert image to base64
            base64_image = base64.b64encode(content).decode('utf-8')
            
            # Prepare payload for OCR.space API
            payload = {
                'base64Image': f'data:image/{image_format};base64,{base64_image}',
                'language': 'eng',
                'isOverlayRequired': False,
                'detectOrientation': True,
                'scale': True,
                'OCREngine': 2,  # Engine 2 is better for text on images
            }
            
            # Make request to OCR.space API
            response = requests.post(
                self.ocr_api_url,
                data=payload,
                headers={'apikey': self.ocr_api_key},
                timeout=30
            )
            
            result = response.json()
            
            # Check for errors
            if result.get('IsErroredOnProcessing'):
                error_msg = result.get('ErrorMessage', 'Unknown error')
                raise DocumentProcessingError(f"OCR.space API error: {error_msg}")
            
            # Extract text
            parsed_results = result.get('ParsedResults', [])
            if not parsed_results:
                raise DocumentProcessingError("No OCR results returned")
            
            text = parsed_results[0].get('ParsedText', '')
            
            return {
                "text": text.strip(),
                "page_count": 1,
                "metadata": {
                    "extraction_method": "ocr_space",
                    "image_size": image_size,
                }
            }
            
        except Exception as e:
            logger.error(f"OCR.space API failed: {str(e)}")
            raise DocumentProcessingError(f"Image OCR failed: {str(e)}")
    
    async def extract_structured_data(
        self, 
        content: bytes, 
        filename: str
    ) -> Dict[str, Any]:
        """
        Extract structured data (entities, dates, IDs) from document
        
        Args:
            content: File content as bytes
            filename: Original filename
            
        Returns:
            Dictionary with extracted entities and structured data
        """
        try:
            # First extract text
            text_data = await self.extract_text(content, filename)
            text = text_data["text"]
            
            # Import spacy for NER
            import spacy
            import re
            from datetime import datetime
            
            # Load spacy model (you may need to download: python -m spacy download en_core_web_sm)
            try:
                nlp = spacy.load("en_core_web_sm")
            except:
                logger.warning("Spacy model not loaded, using regex fallback")
                return self._extract_with_regex(text)
            
            doc = nlp(text)
            
            # Extract entities
            entities = {
                "persons": [],
                "organizations": [],
                "locations": [],
                "other": []
            }
            
            for ent in doc.ents:
                if ent.label_ == "PERSON":
                    entities["persons"].append(ent.text)
                elif ent.label_ == "ORG":
                    entities["organizations"].append(ent.text)
                elif ent.label_ in ["GPE", "LOC"]:
                    entities["locations"].append(ent.text)
                else:
                    entities["other"].append({"text": ent.text, "label": ent.label_})
            
            # Extract dates
            dates = []
            for ent in doc.ents:
                if ent.label_ == "DATE":
                    dates.append(ent.text)
            
            # Extract document IDs (patterns like ID-12345, #123456, etc.)
            id_pattern = r'\b(?:ID|REG|CERT|NO|#)[\s:-]?(\w+)\b'
            document_ids = re.findall(id_pattern, text, re.IGNORECASE)
            
            # Extract emails
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            emails = re.findall(email_pattern, text)
            
            return {
                "entities": entities,
                "dates": dates,
                "document_ids": list(set(document_ids)),
                "emails": emails,
                "metadata": {
                    "extraction_method": "nlp",
                    "entity_count": len(doc.ents),
                }
            }
            
        except Exception as e:
            logger.error(f"Structured extraction failed: {str(e)}")
            raise DocumentProcessingError(f"Structured extraction failed: {str(e)}")
    
    def _extract_with_regex(self, text: str) -> Dict[str, Any]:
        """Fallback extraction using regex patterns"""
        import re
        
        # Basic patterns
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        date_pattern = r'\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b'
        id_pattern = r'\b(?:ID|REG|CERT|NO|#)[\s:-]?(\w+)\b'
        
        return {
            "entities": {
                "persons": [],
                "organizations": [],
                "locations": [],
                "other": []
            },
            "dates": re.findall(date_pattern, text),
            "document_ids": list(set(re.findall(id_pattern, text, re.IGNORECASE))),
            "emails": re.findall(email_pattern, text),
            "metadata": {
                "extraction_method": "regex_fallback",
            }
        }
    
    async def extract_tables(self, content: bytes, filename: str) -> Dict[str, Any]:
        """
        Extract tables from PDF documents
        
        Args:
            content: File content as bytes
            filename: Original filename
            
        Returns:
            Dictionary with extracted tables
        """
        try:
            file_ext = filename.lower().split('.')[-1]
            
            if file_ext != 'pdf':
                raise DocumentProcessingError("Table extraction only supported for PDF files")
            
            pdf_file = io.BytesIO(content)
            tables = []
            
            with pdfplumber.open(pdf_file) as pdf:
                for page_num, page in enumerate(pdf.pages, 1):
                    page_tables = page.extract_tables()
                    
                    for table_num, table in enumerate(page_tables, 1):
                        if table:
                            tables.append({
                                "page": page_num,
                                "table_number": table_num,
                                "rows": len(table),
                                "columns": len(table[0]) if table else 0,
                                "data": table,
                            })
            
            return {
                "tables": tables,
                "metadata": {
                    "extraction_method": "pdfplumber",
                }
            }
            
        except Exception as e:
            logger.error(f"Table extraction failed: {str(e)}")
            raise DocumentProcessingError(f"Table extraction failed: {str(e)}")
