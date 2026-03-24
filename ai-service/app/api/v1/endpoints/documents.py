"""
Document management endpoints for vector store
"""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from typing import Optional
from loguru import logger

from app.core.security import verify_api_key
from app.services.document_service import DocumentService
from app.schemas.documents import (
    IndexDocumentResponse,
    DeleteDocumentResponse,
    DocumentStatsResponse,
)

router = APIRouter()
document_service = DocumentService()


@router.post("/index", response_model=IndexDocumentResponse)
async def index_document(
    file: UploadFile = File(...),
    certificate_id: str = Form(...),
    user_id: str = Form(...),
    metadata: Optional[str] = Form(None),
    api_key: str = Depends(verify_api_key),
) -> IndexDocumentResponse:
    """
    Index document in vector store for RAG
    
    Processes document, creates embeddings, and stores in Qdrant
    """
    try:
        logger.info(f"Indexing document: {file.filename} for certificate: {certificate_id}")
        
        content = await file.read()
        
        # Parse metadata if provided
        import json
        metadata_dict = json.loads(metadata) if metadata else {}
        
        result = await document_service.index_document(
            content=content,
            filename=file.filename,
            certificate_id=certificate_id,
            user_id=user_id,
            metadata=metadata_dict,
        )
        
        return IndexDocumentResponse(
            success=True,
            certificate_id=certificate_id,
            chunks_indexed=result["chunks_indexed"],
            vector_ids=result["vector_ids"],
            message="Document indexed successfully",
        )
        
    except Exception as e:
        logger.error(f"Document indexing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{certificate_id}", response_model=DeleteDocumentResponse)
async def delete_document(
    certificate_id: str,
    api_key: str = Depends(verify_api_key),
) -> DeleteDocumentResponse:
    """
    Delete document from vector store
    
    Removes all vectors associated with the certificate
    """
    try:
        logger.info(f"Deleting document: {certificate_id}")
        
        result = await document_service.delete_document(certificate_id)
        
        return DeleteDocumentResponse(
            success=True,
            certificate_id=certificate_id,
            vectors_deleted=result["vectors_deleted"],
            message="Document deleted successfully",
        )
        
    except Exception as e:
        logger.error(f"Document deletion failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/{certificate_id}", response_model=DocumentStatsResponse)
async def get_document_stats(
    certificate_id: str,
    api_key: str = Depends(verify_api_key),
) -> DocumentStatsResponse:
    """
    Get statistics for indexed document
    """
    try:
        logger.info(f"Getting stats for: {certificate_id}")
        
        result = await document_service.get_document_stats(certificate_id)
        
        return DocumentStatsResponse(
            success=True,
            certificate_id=certificate_id,
            chunk_count=result["chunk_count"],
            indexed_at=result.get("indexed_at"),
            metadata=result.get("metadata", {}),
        )
        
    except Exception as e:
        logger.error(f"Failed to get document stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
