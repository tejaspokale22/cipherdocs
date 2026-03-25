"""
RAG (Retrieval Augmented Generation) Q&A endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from loguru import logger

from app.core.security import verify_api_key
from app.services.rag_service import RAGService
from app.schemas.rag import (
    QuestionRequest,
    QuestionResponse,
    ChatRequest,
    ChatResponse,
    SearchRequest,
    SearchResponse,
)

router = APIRouter()
rag_service = RAGService()


@router.post("/question", response_model=QuestionResponse)
async def ask_question(
    request: QuestionRequest,
    api_key: str = Depends(verify_api_key),
) -> QuestionResponse:
    """
    Ask a question about a specific document or collection
    
    Uses RAG to retrieve relevant context and generate answers
    """
    try:
        logger.info(f"Processing question: {request.question[:50]}...")
        
        result = await rag_service.answer_question(
            question=request.question,
            certificate_id=request.certificate_id,
            user_id=request.user_id,
            top_k=request.top_k,
        )
        
        return QuestionResponse(
            success=True,
            question=request.question,
            answer=result["answer"],
            sources=result["sources"],
            confidence=result.get("confidence", 0.0),
        )
        
    except Exception as e:
        logger.error(f"Question answering failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    api_key: str = Depends(verify_api_key),
) -> ChatResponse:
    """
    Multi-turn conversation with document context
    
    Maintains conversation history for contextual responses
    """
    try:
        logger.info(f"Processing chat message: {request.message[:50]}...")
        
        result = await rag_service.chat(
            message=request.message,
            certificate_id=request.certificate_id,
            user_id=request.user_id,
            history=request.history,
        )
        
        return ChatResponse(
            success=True,
            message=request.message,
            response=result["response"],
            sources=result.get("sources", []),
        )
        
    except Exception as e:
        logger.error(f"Chat failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search", response_model=SearchResponse)
async def semantic_search(
    request: SearchRequest,
    api_key: str = Depends(verify_api_key),
) -> SearchResponse:
    """
    Semantic search across documents
    
    Find relevant document chunks based on semantic similarity
    """
    try:
        logger.info(f"Semantic search: {request.query[:50]}...")
        
        result = await rag_service.semantic_search(
            query=request.query,
            user_id=request.user_id,
            certificate_id=request.certificate_id,
            top_k=request.top_k,
        )
        
        return SearchResponse(
            success=True,
            query=request.query,
            results=result["results"],
            total_results=len(result["results"]),
        )
        
    except Exception as e:
        logger.error(f"Semantic search failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
