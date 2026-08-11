from abc import ABC, abstractmethod
import time
from typing import Dict, Any
from config.settings import settings
from models.schemas import DiagnosisResponse, PesticideItem
from services.knowledge_service import KnowledgeService

class BaseGeminiService(ABC):
    """
    Abstract interface for Crop Disease AI Classification.
    Returns primary identification (crop, disease, confidence).
    """
    @abstractmethod
    async def diagnose_crop(self, image_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Returns dict with primary classification:
        { "crop": "Tomato", "disease": "Early Blight", "confidence": 0.94 }
        """
        pass

class MockGeminiService(BaseGeminiService):
    """
    Development Mock implementation for Gemini Disease Classification.
    """
    async def diagnose_crop(self, image_bytes: bytes, filename: str) -> Dict[str, Any]:
        filename_lower = filename.lower() if filename else ""
        
        if "potato" in filename_lower:
            return {
                "crop": "Potato",
                "disease": "Late Blight",
                "confidence": 0.89
            }
        elif "healthy" in filename_lower:
            return {
                "crop": "Tomato",
                "disease": "Healthy",
                "confidence": 0.98
            }
        else:
            # Default mock classification
            return {
                "crop": "Tomato",
                "disease": "Early Blight",
                "confidence": 0.94
            }

def get_gemini_service() -> BaseGeminiService:
    """
    Factory function to select Gemini service based on credentials.
    If GEMINI_API_KEY is empty or missing, fallback to MockGeminiService.
    """
    if not settings.GEMINI_API_KEY or not settings.GEMINI_API_KEY.strip():
        return MockGeminiService()
    # Real Gemini integration placeholder (will be implemented in future phase)
    return MockGeminiService()
