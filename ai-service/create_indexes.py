"""
Script to manually create Qdrant indexes for existing collections.

This script ensures that the certificate_id and user_id fields have
keyword indexes for efficient filtering in Q&A and search operations.

Usage:
    python create_indexes.py
"""

import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # python-dotenv not installed, environment variables must be set manually
    pass

from qdrant_client import QdrantClient
from qdrant_client.models import PayloadSchemaType
from loguru import logger

def create_indexes():
    """Create indexes on existing Qdrant collection"""
    
    # Get configuration
    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")
    collection_name = os.getenv("QDRANT_COLLECTION_NAME", "cipherdocs_documents")
    
    if not qdrant_url or not qdrant_api_key:
        logger.error("QDRANT_URL and QDRANT_API_KEY must be set in .env file")
        return False
    
    try:
        # Initialize client
        logger.info(f"Connecting to Qdrant at {qdrant_url}")
        client = QdrantClient(
            url=qdrant_url,
            api_key=qdrant_api_key,
            timeout=30,
        )
        
        # Check if collection exists
        collections = client.get_collections().collections
        collection_names = [col.name for col in collections]
        
        if collection_name not in collection_names:
            logger.error(f"Collection '{collection_name}' does not exist")
            logger.info("Available collections: " + ", ".join(collection_names))
            return False
        
        logger.info(f"Found collection: {collection_name}")
        
        # Create certificate_id index
        logger.info("Creating index for certificate_id...")
        try:
            client.create_payload_index(
                collection_name=collection_name,
                field_name="certificate_id",
                field_schema=PayloadSchemaType.KEYWORD,
            )
            logger.success("✓ Created index for certificate_id")
        except Exception as e:
            if "already exists" in str(e).lower():
                logger.info("✓ Index for certificate_id already exists")
            else:
                logger.error(f"Failed to create certificate_id index: {e}")
                return False
        
        # Create user_id index
        logger.info("Creating index for user_id...")
        try:
            client.create_payload_index(
                collection_name=collection_name,
                field_name="user_id",
                field_schema=PayloadSchemaType.KEYWORD,
            )
            logger.success("✓ Created index for user_id")
        except Exception as e:
            if "already exists" in str(e).lower():
                logger.info("✓ Index for user_id already exists")
            else:
                logger.error(f"Failed to create user_id index: {e}")
                return False
        
        # Verify indexes
        logger.info("Verifying collection info...")
        collection_info = client.get_collection(collection_name)
        logger.info(f"Collection vectors count: {collection_info.vectors_count}")
        logger.info(f"Collection points count: {collection_info.points_count}")
        
        logger.success("✓ All indexes created successfully!")
        logger.info("\nYou can now use Q&A features without index errors.")
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to create indexes: {e}")
        return False

if __name__ == "__main__":
    logger.info("=== Qdrant Index Creation Script ===\n")
    success = create_indexes()
    sys.exit(0 if success else 1)
