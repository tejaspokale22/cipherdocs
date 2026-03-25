"""
Document extraction endpoints
"""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from typing import Dict, Any, List
from loguru import logger

from app.core.security import verify_api_key
from app.services.extraction_service import ExtractionService
from app.schemas.extraction import (
    ExtractionResponse,
    StructuredDataResponse,
    TableExtractionResponse,
)

router = APIRouter()
extraction_service = ExtractionService()


@router.post("/text", response_model=ExtractionResponse)
async def extract_text(
    file: UploadFile = File(...),
    api_key: str = Depends(verify_api_key),
) -> ExtractionResponse:
    """
    Extract raw text from uploaded document
    
    Supports: PDF, DOCX, images (with OCR)
    """
    try:
        logger.info(f"Extracting text from file: {file.filename}")
        
        content = await file.read()
        result = await extraction_service.extract_text(content, file.filename)
        
        return ExtractionResponse(
            success=True,
            filename=file.filename,
            text=result["text"],
            page_count=result.get("page_count"),
            word_count=len(result["text"].split()),
            metadata=result.get("metadata", {}),
        )
        
    except Exception as e:
        logger.error(f"Text extraction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/structured", response_model=StructuredDataResponse)
async def extract_structured_data(
    file: UploadFile = File(...),
    api_key: str = Depends(verify_api_key),
) -> StructuredDataResponse:
    """
    Extract structured data from document (entities, dates, IDs, etc.)
    
    Uses NLP to identify:
    - Names and organizations
    - Dates and timestamps
    - Certificate/Document IDs
    - Grades and scores
    - Email addresses and phone numbers
    """
    try:
        logger.info(f"Extracting structured data from: {file.filename}")
        
        content = await file.read()
        result = await extraction_service.extract_structured_data(content, file.filename)
        
        return StructuredDataResponse(
            success=True,
            filename=file.filename,
            entities=result["entities"],
            dates=result["dates"],
            document_ids=result["document_ids"],
            metadata=result.get("metadata", {}),
        )
        
    except Exception as e:
        logger.error(f"Structured extraction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tables", response_model=TableExtractionResponse)
async def extract_tables(
    file: UploadFile = File(...),
    api_key: str = Depends(verify_api_key),
) -> TableExtractionResponse:
    """
    Extract tables from document
    
    Returns structured table data with rows and columns
    """
    try:
        logger.info(f"Extracting tables from: {file.filename}")
        
        content = await file.read()
        result = await extraction_service.extract_tables(content, file.filename)
        
        return TableExtractionResponse(
            success=True,
            filename=file.filename,
            tables=result["tables"],
            table_count=len(result["tables"]),
        )
        
    except Exception as e:
        logger.error(f"Table extraction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
