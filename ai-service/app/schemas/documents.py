"""
Schemas for document management endpoints
"""

from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class IndexDocumentResponse(BaseModel):
    """Response for document indexing"""
    success: bool
    certificate_id: str
    chunks_indexed: int
    vector_ids: List[str]
    message: str


class DeleteDocumentResponse(BaseModel):
    """Response for document deletion"""
    success: bool
    certificate_id: str
    vectors_deleted: int
    message: str


class DocumentStatsResponse(BaseModel):
    """Response for document statistics"""
    success: bool
    certificate_id: str
    chunk_count: int
    indexed_at: Optional[str] = None
    metadata: Dict[str, Any] = {}
