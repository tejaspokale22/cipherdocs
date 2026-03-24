"""
Document management service
"""

from typing import Dict, Any, Optional
from datetime import datetime
from loguru import logger

from app.services.extraction_service import ExtractionService
from app.services.embedding_service import EmbeddingService
from app.services.vector_store_service import VectorStoreService
from app.core.exceptions import AppException


class DocumentService:
    """Service for managing documents in vector store"""
    
    def __init__(self):
        """Initialize document service"""
        self.extraction_service = ExtractionService()
        self.embedding_service = EmbeddingService()
        self.vector_store = VectorStoreService()
    
    async def index_document(
        self,
        content: bytes,
        filename: str,
        certificate_id: str,
        user_id: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Index document in vector store
        
        Args:
            content: Document content
            filename: Document filename
            certificate_id: Certificate ID
            user_id: User ID
            metadata: Additional metadata
            
        Returns:
            Indexing results
        """
        try:
            logger.info(f"Indexing document: {filename}")
            
            # Extract text
            text_data = await self.extraction_service.extract_text(content, filename)
            text = text_data["text"]
            
            # Chunk text
            chunks = self.embedding_service.chunk_text(text)
            
            # Generate embeddings
            embeddings = await self.embedding_service.embed_documents(chunks)
            
            # Prepare metadata for each chunk
            chunk_metadata = []
            for i, chunk in enumerate(chunks):
                chunk_meta = {
                    "certificate_id": certificate_id,
                    "user_id": user_id,
                    "filename": filename,
                    "chunk_index": i,
                    "total_chunks": len(chunks),
                    "indexed_at": datetime.utcnow().isoformat(),
                    **(metadata or {}),
                }
                chunk_metadata.append(chunk_meta)
            
            # Add to vector store
            vector_ids = await self.vector_store.add_documents(
                texts=chunks,
                embeddings=embeddings,
                metadata=chunk_metadata,
            )
            
            logger.info(f"Successfully indexed {len(chunks)} chunks")
            
            return {
                "chunks_indexed": len(chunks),
                "vector_ids": vector_ids,
            }
            
        except Exception as e:
            logger.error(f"Document indexing failed: {str(e)}")
            raise AppException(f"Document indexing failed: {str(e)}")
    
    async def delete_document(self, certificate_id: str) -> Dict[str, Any]:
        """
        Delete document from vector store
        
        Args:
            certificate_id: Certificate ID to delete
            
        Returns:
            Deletion results
        """
        try:
            logger.info(f"Deleting document: {certificate_id}")
            
            vectors_deleted = await self.vector_store.delete_by_certificate(certificate_id)
            
            return {
                "vectors_deleted": vectors_deleted,
            }
            
        except Exception as e:
            logger.error(f"Document deletion failed: {str(e)}")
            raise AppException(f"Document deletion failed: {str(e)}")
    
    async def get_document_stats(self, certificate_id: str) -> Dict[str, Any]:
        """
        Get document statistics
        
        Args:
            certificate_id: Certificate ID
            
        Returns:
            Document statistics
        """
        try:
            logger.info(f"Getting stats for: {certificate_id}")
            
            stats = await self.vector_store.get_stats(certificate_id)
            
            return stats
            
        except Exception as e:
            logger.error(f"Failed to get document stats: {str(e)}")
            raise AppException(f"Failed to get document stats: {str(e)}")
