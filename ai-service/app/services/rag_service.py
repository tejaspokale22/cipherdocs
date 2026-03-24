"""
RAG (Retrieval Augmented Generation) service
"""

from typing import List, Dict, Any, Optional
from loguru import logger

from app.services.vector_store_service import VectorStoreService
from app.services.embedding_service import EmbeddingService
from app.core.config import settings
from app.core.exceptions import AppException


class RAGService:
    """Service for RAG-based question answering"""
    
    def __init__(self):
        """Initialize RAG service"""
        self.vector_store = VectorStoreService()
        self.embedding_service = EmbeddingService()
    
    async def answer_question(
        self,
        question: str,
        certificate_id: Optional[str] = None,
        user_id: Optional[str] = None,
        top_k: int = 5,
    ) -> Dict[str, Any]:
        """
        Answer a question using RAG
        
        Args:
            question: User's question
            certificate_id: Optional certificate ID to filter
            user_id: Optional user ID to filter
            top_k: Number of relevant chunks to retrieve
            
        Returns:
            Answer with sources and confidence
        """
        try:
            logger.info(f"Answering question: {question[:50]}...")
            
            # Generate query embedding
            query_embedding = await self.embedding_service.embed_query(question)
            
            # Build filter
            filter_dict = {}
            if certificate_id:
                filter_dict["certificate_id"] = certificate_id
            if user_id:
                filter_dict["user_id"] = user_id
            
            # Search for relevant chunks
            results = await self.vector_store.search(
                query_embedding=query_embedding,
                limit=top_k,
                filter_dict=filter_dict if filter_dict else None,
            )
            
            if not results:
                return {
                    "answer": "I couldn't find any relevant information to answer your question.",
                    "sources": [],
                    "confidence": 0.0,
                }
            
            # Build context from results
            context = "\n\n".join([r["text"] for r in results])
            
            # Generate answer (using simple extraction for now, can be enhanced with LLM)
            answer = self._generate_answer(question, context, results)
            
            # Format sources
            sources = [
                {
                    "text": r["text"][:200] + "..." if len(r["text"]) > 200 else r["text"],
                    "score": r["score"],
                    "metadata": r["metadata"],
                }
                for r in results[:3]  # Top 3 sources
            ]
            
            return {
                "answer": answer,
                "sources": sources,
                "confidence": results[0]["score"] if results else 0.0,
            }
            
        except Exception as e:
            logger.error(f"Question answering failed: {str(e)}")
            raise AppException(f"Failed to answer question: {str(e)}")
    
    def _generate_answer(
        self,
        question: str,
        context: str,
        results: List[Dict[str, Any]],
    ) -> str:
        """
        Generate answer from context
        
        For now, returns the most relevant chunk.
        Can be enhanced with LLM for better answers.
        """
        if not results:
            return "No relevant information found."
        
        # Return the most relevant chunk as answer
        best_match = results[0]
        
        # Simple answer extraction
        answer = f"Based on the document: {best_match['text'][:500]}"
        
        return answer
    
    async def chat(
        self,
        message: str,
        certificate_id: Optional[str] = None,
        user_id: Optional[str] = None,
        history: List[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Multi-turn conversation with document context
        
        Args:
            message: User's message
            certificate_id: Optional certificate ID
            user_id: Optional user ID
            history: Conversation history
            
        Returns:
            Response with sources
        """
        try:
            # For now, treat as question answering
            # Can be enhanced with conversation memory
            result = await self.answer_question(
                question=message,
                certificate_id=certificate_id,
                user_id=user_id,
            )
            
            return {
                "response": result["answer"],
                "sources": result.get("sources", []),
            }
            
        except Exception as e:
            logger.error(f"Chat failed: {str(e)}")
            raise AppException(f"Chat failed: {str(e)}")
    
    async def semantic_search(
        self,
        query: str,
        user_id: Optional[str] = None,
        certificate_id: Optional[str] = None,
        top_k: int = 10,
    ) -> Dict[str, Any]:
        """
        Semantic search across documents
        
        Args:
            query: Search query
            user_id: Optional user ID filter
            certificate_id: Optional certificate ID filter
            top_k: Number of results
            
        Returns:
            Search results
        """
        try:
            logger.info(f"Semantic search: {query[:50]}...")
            
            # Generate query embedding
            query_embedding = await self.embedding_service.embed_query(query)
            
            # Build filter
            filter_dict = {}
            if certificate_id:
                filter_dict["certificate_id"] = certificate_id
            if user_id:
                filter_dict["user_id"] = user_id
            
            # Search
            results = await self.vector_store.search(
                query_embedding=query_embedding,
                limit=top_k,
                filter_dict=filter_dict if filter_dict else None,
            )
            
            return {
                "results": results,
            }
            
        except Exception as e:
            logger.error(f"Semantic search failed: {str(e)}")
            raise AppException(f"Semantic search failed: {str(e)}")
