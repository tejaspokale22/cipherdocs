"""
Schemas for RAG endpoints
"""

from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class QuestionRequest(BaseModel):
    """Request for question answering"""
    question: str
    certificate_id: Optional[str] = None
    user_id: Optional[str] = None
    top_k: int = 5


class QuestionResponse(BaseModel):
    """Response for question answering"""
    success: bool
    question: str
    answer: str
    sources: List[Dict[str, Any]]
    confidence: float


class ChatRequest(BaseModel):
    """Request for chat"""
    message: str
    certificate_id: Optional[str] = None
    user_id: Optional[str] = None
    history: List[Dict[str, str]] = []


class ChatResponse(BaseModel):
    """Response for chat"""
    success: bool
    message: str
    response: str
    sources: List[Dict[str, Any]] = []


class SearchRequest(BaseModel):
    """Request for semantic search"""
    query: str
    user_id: Optional[str] = None
    certificate_id: Optional[str] = None
    top_k: int = 10


class SearchResponse(BaseModel):
    """Response for semantic search"""
    success: bool
    query: str
    results: List[Dict[str, Any]]
    total_results: int
