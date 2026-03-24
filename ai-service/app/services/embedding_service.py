"""
Embedding service using Nomic
"""

from typing import List
from loguru import logger
from langchain_nomic import NomicEmbeddings

from app.core.config import settings
from app.core.exceptions import VectorStoreError


class EmbeddingService:
    """Service for generating embeddings using Nomic"""
    
    def __init__(self):
        """Initialize Nomic embeddings"""
        try:
            self.embeddings = NomicEmbeddings(
                model="nomic-embed-text-v1.5",
                nomic_api_key=settings.NOMIC_API_KEY,
            )
            logger.info("Nomic embeddings initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Nomic embeddings: {str(e)}")
            raise VectorStoreError(f"Embedding service initialization failed: {str(e)}")
    
    async def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple documents
        
        Args:
            texts: List of text strings to embed
            
        Returns:
            List of embedding vectors
        """
        try:
            logger.info(f"Generating embeddings for {len(texts)} documents")
            embeddings = self.embeddings.embed_documents(texts)
            logger.info(f"Generated {len(embeddings)} embeddings")
            return embeddings
            
        except Exception as e:
            logger.error(f"Document embedding failed: {str(e)}")
            raise VectorStoreError(f"Failed to embed documents: {str(e)}")
    
    async def embed_query(self, text: str) -> List[float]:
        """
        Generate embedding for a single query
        
        Args:
            text: Query text to embed
            
        Returns:
            Embedding vector
        """
        try:
            logger.info("Generating query embedding")
            embedding = self.embeddings.embed_query(text)
            return embedding
            
        except Exception as e:
            logger.error(f"Query embedding failed: {str(e)}")
            raise VectorStoreError(f"Failed to embed query: {str(e)}")
    
    def chunk_text(self, text: str, chunk_size: int = None, overlap: int = None) -> List[str]:
        """
        Split text into chunks for embedding
        
        Args:
            text: Text to chunk
            chunk_size: Size of each chunk (default from settings)
            overlap: Overlap between chunks (default from settings)
            
        Returns:
            List of text chunks
        """
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        
        chunk_size = chunk_size or settings.CHUNK_SIZE
        overlap = overlap or settings.CHUNK_OVERLAP
        
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
        
        chunks = splitter.split_text(text)
        logger.info(f"Split text into {len(chunks)} chunks")
        return chunks
