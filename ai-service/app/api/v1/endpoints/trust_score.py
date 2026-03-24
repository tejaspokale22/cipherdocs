"""
Trust score and document verification endpoints
"""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from typing import Optional
from loguru import logger

from app.core.security import verify_api_key
from app.services.trust_score_service import TrustScoreService
from app.schemas.trust_score import (
    TrustScoreResponse,
    SimilarityCheckResponse,
    AuthenticityResponse,
)

router = APIRouter()
trust_service = TrustScoreService()


@router.post("/score", response_model=TrustScoreResponse)
async def calculate_trust_score(
    uploaded_file: UploadFile = File(...),
    certificate_id: str = Form(...),
    original_file: Optional[UploadFile] = File(None),
    api_key: str = Depends(verify_api_key),
) -> TrustScoreResponse:
    """
    Calculate comprehensive trust score for uploaded document
    
    Analyzes:
    - Content similarity with original
    - Structural integrity
    - Metadata consistency
    - Visual layout matching
    
    Returns score from 0-100
    """
    try:
        logger.info(f"Calculating trust score for certificate: {certificate_id}")
        
        uploaded_content = await uploaded_file.read()
        original_content = await original_file.read() if original_file else None
        
        result = await trust_service.calculate_trust_score(
            uploaded_content=uploaded_content,
            uploaded_filename=uploaded_file.filename,
            certificate_id=certificate_id,
            original_content=original_content,
        )
        
        return TrustScoreResponse(
            success=True,
            certificate_id=certificate_id,
            trust_score=result["trust_score"],
            trust_level=result["trust_level"],
            similarity_score=result["similarity_score"],
            structural_score=result["structural_score"],
            metadata_score=result["metadata_score"],
            analysis=result["analysis"],
            recommendations=result.get("recommendations", []),
        )
        
    except Exception as e:
        logger.error(f"Trust score calculation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/similarity", response_model=SimilarityCheckResponse)
async def check_similarity(
    file1: UploadFile = File(...),
    file2: UploadFile = File(...),
    api_key: str = Depends(verify_api_key),
) -> SimilarityCheckResponse:
    """
    Check semantic similarity between two documents
    
    Returns similarity score and detailed comparison
    """
    try:
        logger.info(f"Checking similarity: {file1.filename} vs {file2.filename}")
        
        content1 = await file1.read()
        content2 = await file2.read()
        
        result = await trust_service.check_similarity(
            content1=content1,
            filename1=file1.filename,
            content2=content2,
            filename2=file2.filename,
        )
        
        return SimilarityCheckResponse(
            success=True,
            similarity_score=result["similarity_score"],
            similarity_percentage=result["similarity_percentage"],
            differences=result["differences"],
            common_elements=result["common_elements"],
            verdict=result["verdict"],
        )
        
    except Exception as e:
        logger.error(f"Similarity check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/authenticity", response_model=AuthenticityResponse)
async def verify_authenticity(
    file: UploadFile = File(...),
    certificate_id: str = Form(...),
    api_key: str = Depends(verify_api_key),
) -> AuthenticityResponse:
    """
    Verify document authenticity using AI analysis
    
    Detects:
    - Tampering indicators
    - Forgery patterns
    - Anomalies in structure
    - Inconsistent metadata
    """
    try:
        logger.info(f"Verifying authenticity for: {certificate_id}")
        
        content = await file.read()
        
        result = await trust_service.verify_authenticity(
            content=content,
            filename=file.filename,
            certificate_id=certificate_id,
        )
        
        return AuthenticityResponse(
            success=True,
            certificate_id=certificate_id,
            is_authentic=result["is_authentic"],
            confidence=result["confidence"],
            tampering_indicators=result["tampering_indicators"],
            anomalies=result["anomalies"],
            verification_details=result["verification_details"],
        )
        
    except Exception as e:
        logger.error(f"Authenticity verification failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
