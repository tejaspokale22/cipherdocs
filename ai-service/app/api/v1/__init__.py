"""
API v1 router
"""

from fastapi import APIRouter
from app.api.v1.endpoints import extraction, rag, trust_score, documents

router = APIRouter()

# Include all endpoint routers
router.include_router(extraction.router, prefix="/extract", tags=["Document Extraction"])
router.include_router(rag.router, prefix="/rag", tags=["RAG Q&A"])
router.include_router(trust_score.router, prefix="/trust", tags=["Trust Score"])
router.include_router(documents.router, prefix="/documents", tags=["Document Management"])
