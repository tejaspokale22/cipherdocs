"""
Application configuration using Pydantic Settings
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    
    # Qdrant Configuration
    QDRANT_URL: str
    QDRANT_API_KEY: str
    QDRANT_COLLECTION_NAME: str = "cipherdocs_documents"
    
    # Nomic Configuration
    NOMIC_API_KEY: str
    
    # Mixtral Configuration (for RAG/Chat - optional)
    MISTRAL_API_KEY: Optional[str] = None
    
    # OCR.space API (for image-based PDF OCR)
    OCR_SPACE_API_KEY: str = "helloworld"
    
    # OpenAI (optional)
    OPENAI_API_KEY: Optional[str] = None
    
    # Node.js Backend URL
    NODE_BACKEND_URL: str = "http://localhost:5000"
    
    # Service Authentication
    SERVICE_API_KEY: str
    
    # Processing Configuration
    MAX_FILE_SIZE_MB: int = 50
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    
    # Trust Score Thresholds
    TRUST_SCORE_HIGH_THRESHOLD: int = 85
    TRUST_SCORE_MEDIUM_THRESHOLD: int = 60
    
    # Vector Search Configuration
    VECTOR_SEARCH_LIMIT: int = 10
    SIMILARITY_THRESHOLD: float = 0.7
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
