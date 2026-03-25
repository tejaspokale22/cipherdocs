"""
Schemas for extraction endpoints
"""

from pydantic import BaseModel
from typing import Dict, Any, List, Optional


class ExtractionResponse(BaseModel):
    """Response for text extraction"""
    success: bool
    filename: str
    text: str
    page_count: Optional[int] = None
    word_count: int
    metadata: Dict[str, Any] = {}


class StructuredDataResponse(BaseModel):
    """Response for structured data extraction"""
    success: bool
    filename: str
    entities: Dict[str, List[str]]
    dates: List[str]
    document_ids: List[str]
    metadata: Dict[str, Any] = {}


class TableExtractionResponse(BaseModel):
    """Response for table extraction"""
    success: bool
    filename: str
    tables: List[Dict[str, Any]]
    table_count: int
