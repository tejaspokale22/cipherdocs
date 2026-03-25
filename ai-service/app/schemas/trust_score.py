"""
Schemas for trust score endpoints
"""

from pydantic import BaseModel
from typing import List, Dict, Any


class TrustScoreResponse(BaseModel):
    """Response for trust score calculation"""
    success: bool
    certificate_id: str
    trust_score: float
    trust_level: str
    similarity_score: float
    structural_score: float
    metadata_score: float
    analysis: str
    recommendations: List[str] = []


class SimilarityCheckResponse(BaseModel):
    """Response for similarity check"""
    success: bool
    similarity_score: float
    similarity_percentage: float
    differences: List[str]
    common_elements: List[str]
    verdict: str


class AuthenticityResponse(BaseModel):
    """Response for authenticity verification"""
    success: bool
    certificate_id: str
    is_authentic: bool
    confidence: float
    tampering_indicators: List[str]
    anomalies: List[str]
    verification_details: Dict[str, Any]
