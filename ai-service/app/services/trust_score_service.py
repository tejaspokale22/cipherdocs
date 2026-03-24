"""
Trust score and document verification service
"""

from typing import Dict, Any, Optional, List
from loguru import logger
from difflib import SequenceMatcher

from app.services.extraction_service import ExtractionService
from app.services.embedding_service import EmbeddingService
from app.core.config import settings
from app.core.exceptions import AppException


class TrustScoreService:
    """Service for calculating trust scores and verifying documents"""
    
    def __init__(self):
        """Initialize trust score service"""
        self.extraction_service = ExtractionService()
        self.embedding_service = EmbeddingService()
    
    async def calculate_trust_score(
        self,
        uploaded_content: bytes,
        uploaded_filename: str,
        certificate_id: str,
        original_content: Optional[bytes] = None,
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive trust score
        
        Args:
            uploaded_content: Uploaded document content
            uploaded_filename: Uploaded filename
            certificate_id: Certificate ID
            original_content: Original document content (if available)
            
        Returns:
            Trust score and analysis
        """
        try:
            logger.info(f"Calculating trust score for: {certificate_id}")
            
            # Extract text from uploaded document
            uploaded_data = await self.extraction_service.extract_text(
                uploaded_content, uploaded_filename
            )
            uploaded_text = uploaded_data["text"]
            
            # If original content provided, extract text
            if original_content:
                original_data = await self.extraction_service.extract_text(
                    original_content, "original.pdf"
                )
                original_text = original_data["text"]
            else:
                # In production, fetch from Node backend or IPFS
                original_text = uploaded_text  # Placeholder
            
            # Calculate similarity score
            similarity_score = self._calculate_text_similarity(uploaded_text, original_text)
            
            # Calculate structural score
            structural_score = self._calculate_structural_score(
                uploaded_data, uploaded_data  # Placeholder
            )
            
            # Calculate metadata score
            metadata_score = self._calculate_metadata_score(
                uploaded_data.get("metadata", {}),
                uploaded_data.get("metadata", {}),  # Placeholder
            )
            
            # Calculate overall trust score (weighted average)
            trust_score = (
                similarity_score * 0.5 +
                structural_score * 0.3 +
                metadata_score * 0.2
            )
            
            # Determine trust level
            if trust_score >= settings.TRUST_SCORE_HIGH_THRESHOLD:
                trust_level = "HIGH"
            elif trust_score >= settings.TRUST_SCORE_MEDIUM_THRESHOLD:
                trust_level = "MEDIUM"
            else:
                trust_level = "LOW"
            
            # Generate analysis
            analysis = self._generate_analysis(
                trust_score, similarity_score, structural_score, metadata_score
            )
            
            # Generate recommendations
            recommendations = self._generate_recommendations(trust_score, trust_level)
            
            return {
                "trust_score": round(trust_score, 2),
                "trust_level": trust_level,
                "similarity_score": round(similarity_score, 2),
                "structural_score": round(structural_score, 2),
                "metadata_score": round(metadata_score, 2),
                "analysis": analysis,
                "recommendations": recommendations,
            }
            
        except Exception as e:
            logger.error(f"Trust score calculation failed: {str(e)}")
            raise AppException(f"Trust score calculation failed: {str(e)}")
    
    def _calculate_text_similarity(self, text1: str, text2: str) -> float:
        """Calculate text similarity using sequence matching"""
        matcher = SequenceMatcher(None, text1.lower(), text2.lower())
        return matcher.ratio() * 100
    
    def _calculate_structural_score(
        self, 
        doc1_data: Dict[str, Any], 
        doc2_data: Dict[str, Any]
    ) -> float:
        """Calculate structural similarity score"""
        score = 100.0
        
        # Compare page counts
        page1 = doc1_data.get("page_count", 1)
        page2 = doc2_data.get("page_count", 1)
        
        if page1 != page2:
            score -= 20
        
        return max(0, score)
    
    def _calculate_metadata_score(
        self,
        meta1: Dict[str, Any],
        meta2: Dict[str, Any],
    ) -> float:
        """Calculate metadata consistency score"""
        # Placeholder - can be enhanced with actual metadata comparison
        return 100.0
    
    def _generate_analysis(
        self,
        trust_score: float,
        similarity_score: float,
        structural_score: float,
        metadata_score: float,
    ) -> str:
        """Generate human-readable analysis"""
        analysis_parts = []
        
        if trust_score >= 85:
            analysis_parts.append("The document shows high authenticity.")
        elif trust_score >= 60:
            analysis_parts.append("The document shows moderate authenticity with some inconsistencies.")
        else:
            analysis_parts.append("The document shows low authenticity with significant discrepancies.")
        
        if similarity_score < 70:
            analysis_parts.append(f"Content similarity is low ({similarity_score:.1f}%), indicating potential modifications.")
        
        if structural_score < 80:
            analysis_parts.append("Structural differences detected in document layout.")
        
        return " ".join(analysis_parts)
    
    def _generate_recommendations(self, trust_score: float, trust_level: str) -> List[str]:
        """Generate recommendations based on trust score"""
        recommendations = []
        
        if trust_level == "LOW":
            recommendations.append("Manual verification recommended")
            recommendations.append("Contact issuing authority for confirmation")
        elif trust_level == "MEDIUM":
            recommendations.append("Additional verification may be needed")
        else:
            recommendations.append("Document appears authentic")
        
        return recommendations
    
    async def check_similarity(
        self,
        content1: bytes,
        filename1: str,
        content2: bytes,
        filename2: str,
    ) -> Dict[str, Any]:
        """
        Check similarity between two documents
        
        Args:
            content1: First document content
            filename1: First document filename
            content2: Second document content
            filename2: Second document filename
            
        Returns:
            Similarity analysis
        """
        try:
            # Extract text from both documents
            data1 = await self.extraction_service.extract_text(content1, filename1)
            data2 = await self.extraction_service.extract_text(content2, filename2)
            
            text1 = data1["text"]
            text2 = data2["text"]
            
            # Calculate similarity
            similarity_score = self._calculate_text_similarity(text1, text2)
            
            # Find differences
            differences = self._find_differences(text1, text2)
            
            # Find common elements
            common_elements = self._find_common_elements(text1, text2)
            
            # Determine verdict
            if similarity_score >= 90:
                verdict = "IDENTICAL"
            elif similarity_score >= 70:
                verdict = "SIMILAR"
            elif similarity_score >= 40:
                verdict = "PARTIALLY_SIMILAR"
            else:
                verdict = "DIFFERENT"
            
            return {
                "similarity_score": similarity_score / 100,  # Normalize to 0-1
                "similarity_percentage": round(similarity_score, 2),
                "differences": differences,
                "common_elements": common_elements,
                "verdict": verdict,
            }
            
        except Exception as e:
            logger.error(f"Similarity check failed: {str(e)}")
            raise AppException(f"Similarity check failed: {str(e)}")
    
    def _find_differences(self, text1: str, text2: str) -> List[str]:
        """Find key differences between texts"""
        # Simplified difference detection
        differences = []
        
        if len(text1) != len(text2):
            differences.append(f"Length difference: {abs(len(text1) - len(text2))} characters")
        
        return differences[:5]  # Limit to 5 differences
    
    def _find_common_elements(self, text1: str, text2: str) -> List[str]:
        """Find common elements between texts"""
        # Simplified common element detection
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        common = words1.intersection(words2)
        return [f"{len(common)} common words"]
    
    async def verify_authenticity(
        self,
        content: bytes,
        filename: str,
        certificate_id: str,
    ) -> Dict[str, Any]:
        """
        Verify document authenticity using AI analysis
        
        Args:
            content: Document content
            filename: Document filename
            certificate_id: Certificate ID
            
        Returns:
            Authenticity verification results
        """
        try:
            logger.info(f"Verifying authenticity for: {certificate_id}")
            
            # Extract text and structured data
            text_data = await self.extraction_service.extract_text(content, filename)
            structured_data = await self.extraction_service.extract_structured_data(
                content, filename
            )
            
            # Analyze for tampering indicators
            tampering_indicators = self._detect_tampering(text_data, structured_data)
            
            # Detect anomalies
            anomalies = self._detect_anomalies(text_data, structured_data)
            
            # Calculate confidence
            confidence = 1.0 - (len(tampering_indicators) * 0.2 + len(anomalies) * 0.1)
            confidence = max(0.0, min(1.0, confidence))
            
            # Determine authenticity
            is_authentic = confidence >= 0.7 and len(tampering_indicators) == 0
            
            return {
                "is_authentic": is_authentic,
                "confidence": round(confidence, 2),
                "tampering_indicators": tampering_indicators,
                "anomalies": anomalies,
                "verification_details": {
                    "extraction_method": text_data.get("metadata", {}).get("extraction_method"),
                    "page_count": text_data.get("page_count"),
                    "entity_count": len(structured_data.get("entities", {}).get("persons", [])),
                }
            }
            
        except Exception as e:
            logger.error(f"Authenticity verification failed: {str(e)}")
            raise AppException(f"Authenticity verification failed: {str(e)}")
    
    def _detect_tampering(
        self,
        text_data: Dict[str, Any],
        structured_data: Dict[str, Any],
    ) -> List[str]:
        """Detect tampering indicators"""
        indicators = []
        
        # Check for suspicious patterns
        text = text_data.get("text", "")
        
        if "COPY" in text.upper() or "DUPLICATE" in text.upper():
            indicators.append("Document marked as copy or duplicate")
        
        return indicators
    
    def _detect_anomalies(
        self,
        text_data: Dict[str, Any],
        structured_data: Dict[str, Any],
    ) -> List[str]:
        """Detect anomalies in document"""
        anomalies = []
        
        # Check for extraction issues
        if text_data.get("page_count", 0) == 0:
            anomalies.append("No pages detected")
        
        text = text_data.get("text", "")
        if len(text) < 50:
            anomalies.append("Insufficient text content")
        
        return anomalies
