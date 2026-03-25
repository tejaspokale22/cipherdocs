"""
Vector store service using Qdrant
"""

from typing import List, Dict, Any, Optional
from loguru import logger
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
)

from app.core.config import settings
from app.core.exceptions import VectorStoreError


class VectorStoreService:
    """Service for managing vector store operations with Qdrant"""
    
    def __init__(self):
        """Initialize Qdrant client"""
        try:
            self.client = QdrantClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY,
            )
            self.collection_name = settings.QDRANT_COLLECTION_NAME
            self._ensure_collection()
            logger.info("Qdrant client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Qdrant: {str(e)}")
            raise VectorStoreError(f"Vector store initialization failed: {str(e)}")
    
    def _ensure_collection(self):
        """Ensure collection exists, create if not"""
        try:
            from qdrant_client.models import PayloadSchemaType
            
            collections = self.client.get_collections().collections
            collection_names = [col.name for col in collections]
            
            if self.collection_name not in collection_names:
                logger.info(f"Creating collection: {self.collection_name}")
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=768,  # Nomic embed-text dimension
                        distance=Distance.COSINE,
                    ),
                )
                logger.info(f"Collection {self.collection_name} created")
            else:
                logger.info(f"Collection {self.collection_name} already exists")
            
            # Ensure indexes exist (idempotent - won't fail if already exists)
            try:
                self.client.create_payload_index(
                    collection_name=self.collection_name,
                    field_name="certificate_id",
                    field_schema=PayloadSchemaType.KEYWORD,
                )
                logger.info(f"Created/verified index for certificate_id")
            except Exception as e:
                if "already exists" not in str(e).lower():
                    logger.warning(f"Could not create certificate_id index: {str(e)}")
            
            try:
                self.client.create_payload_index(
                    collection_name=self.collection_name,
                    field_name="user_id",
                    field_schema=PayloadSchemaType.KEYWORD,
                )
                logger.info(f"Created/verified index for user_id")
            except Exception as e:
                if "already exists" not in str(e).lower():
                    logger.warning(f"Could not create user_id index: {str(e)}")
                
        except Exception as e:
            logger.error(f"Collection setup failed: {str(e)}")
            raise VectorStoreError(f"Failed to setup collection: {str(e)}")
    
    async def add_documents(
        self,
        texts: List[str],
        embeddings: List[List[float]],
        metadata: List[Dict[str, Any]],
    ) -> List[str]:
        """
        Add documents to vector store
        
        Args:
            texts: List of text chunks
            embeddings: List of embedding vectors
            metadata: List of metadata dicts for each chunk
            
        Returns:
            List of point IDs
        """
        try:
            import uuid
            
            points = []
            point_ids = []
            
            for text, embedding, meta in zip(texts, embeddings, metadata):
                point_id = str(uuid.uuid4())
                point_ids.append(point_id)
                
                points.append(
                    PointStruct(
                        id=point_id,
                        vector=embedding,
                        payload={
                            "text": text,
                            **meta,
                        }
                    )
                )
            
            self.client.upsert(
                collection_name=self.collection_name,
                points=points,
            )
            
            logger.info(f"Added {len(points)} documents to vector store")
            return point_ids
            
        except Exception as e:
            logger.error(f"Failed to add documents: {str(e)}")
            raise VectorStoreError(f"Failed to add documents: {str(e)}")
    
    async def search(
        self,
        query_embedding: List[float],
        limit: int = 10,
        filter_dict: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Search for similar documents
        
        Args:
            query_embedding: Query vector
            limit: Number of results to return
            filter_dict: Optional metadata filters
            
        Returns:
            List of search results with scores
        """
        try:
            # Build filter if provided
            query_filter = None
            if filter_dict:
                conditions = []
                for key, value in filter_dict.items():
                    conditions.append(
                        FieldCondition(
                            key=key,
                            match=MatchValue(value=value),
                        )
                    )
                query_filter = Filter(must=conditions)
            
            # Perform search
            results = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                limit=limit,
                query_filter=query_filter,
            )
            
            # Format results
            formatted_results = []
            for result in results:
                formatted_results.append({
                    "id": result.id,
                    "score": result.score,
                    "text": result.payload.get("text", ""),
                    "metadata": {
                        k: v for k, v in result.payload.items() if k != "text"
                    }
                })
            
            logger.info(f"Found {len(formatted_results)} results")
            return formatted_results
            
        except Exception as e:
            logger.error(f"Search failed: {str(e)}")
            raise VectorStoreError(f"Search failed: {str(e)}")
    
    async def delete_by_certificate(self, certificate_id: str) -> int:
        """
        Delete all vectors for a certificate
        
        Args:
            certificate_id: Certificate ID to delete
            
        Returns:
            Number of vectors deleted
        """
        try:
            # Search for all points with this certificate_id
            results = self.client.scroll(
                collection_name=self.collection_name,
                scroll_filter=Filter(
                    must=[
                        FieldCondition(
                            key="certificate_id",
                            match=MatchValue(value=certificate_id),
                        )
                    ]
                ),
                limit=1000,
            )
            
            point_ids = [point.id for point in results[0]]
            
            if point_ids:
                self.client.delete(
                    collection_name=self.collection_name,
                    points_selector=point_ids,
                )
                logger.info(f"Deleted {len(point_ids)} vectors for certificate {certificate_id}")
            
            return len(point_ids)
            
        except Exception as e:
            logger.error(f"Delete failed: {str(e)}")
            raise VectorStoreError(f"Delete failed: {str(e)}")
    
    async def get_stats(self, certificate_id: str) -> Dict[str, Any]:
        """
        Get statistics for a certificate's vectors
        
        Args:
            certificate_id: Certificate ID
            
        Returns:
            Statistics dictionary
        """
        try:
            results = self.client.scroll(
                collection_name=self.collection_name,
                scroll_filter=Filter(
                    must=[
                        FieldCondition(
                            key="certificate_id",
                            match=MatchValue(value=certificate_id),
                        )
                    ]
                ),
                limit=1000,
            )
            
            points = results[0]
            
            return {
                "chunk_count": len(points),
                "indexed_at": points[0].payload.get("indexed_at") if points else None,
                "metadata": points[0].payload if points else {},
            }
            
        except Exception as e:
            logger.error(f"Failed to get stats: {str(e)}")
            raise VectorStoreError(f"Failed to get stats: {str(e)}")
