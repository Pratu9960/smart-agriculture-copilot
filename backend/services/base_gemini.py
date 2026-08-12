from abc import ABC, abstractmethod
import json
import logging
from typing import Dict, Any
from config.settings import settings

logger = logging.getLogger("smart_ag_backend.gemini")

class BaseGeminiService(ABC):
    """
    Abstract interface for Crop Disease AI Classification.
    Returns primary identification (crop, disease, confidence).
    """
    @property
    @abstractmethod
    def is_mock(self) -> bool:
        """Indicates whether this service instance is a development mock."""
        pass

    @abstractmethod
    async def diagnose_crop(self, image_bytes: bytes, filename: str, content_type: str = "image/jpeg") -> Dict[str, Any]:
        """
        Returns dict with primary classification:
        { "crop": "Tomato", "disease": "Early Blight", "confidence": 0.94 }
        """
        pass

class MockGeminiService(BaseGeminiService):
    """
    Development Mock implementation for Gemini Disease Classification.
    Used when GEMINI_API_KEY is not configured or in testing environments.
    """
    @property
    def is_mock(self) -> bool:
        return True

    async def diagnose_crop(self, image_bytes: bytes, filename: str, content_type: str = "image/jpeg") -> Dict[str, Any]:
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
            return {
                "crop": "Tomato",
                "disease": "Early Blight",
                "confidence": 0.94
            }

class RealGeminiService(BaseGeminiService):
    """
    Real Google Gemini Vision API service implementation using google-genai SDK.
    Strictly performs crop and disease identification (crop, disease, confidence).
    """
    @property
    def is_mock(self) -> bool:
        return False

    def __init__(self, api_key: str = None, model_name: str = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL
        
        from google import genai
        self.client = genai.Client(api_key=self.api_key)

    async def diagnose_crop(self, image_bytes: bytes, filename: str, content_type: str = "image/jpeg") -> Dict[str, Any]:
        from google.genai import types

        prompt = (
            "You are an expert agricultural plant pathology classifier.\n"
            "Analyze the provided leaf image carefully.\n\n"
            "Your task is ONLY to identify:\n"
            "1. Crop species name (e.g. 'Tomato', 'Potato', 'Corn', 'Apple')\n"
            "2. Exact disease name (e.g. 'Early Blight', 'Late Blight', 'Apple Scab') OR 'Healthy' if no disease is visible.\n"
            "3. Estimated classification confidence score between 0.0 and 1.0.\n\n"
            "CRITICAL RULES:\n"
            "- Do NOT provide treatment instructions.\n"
            "- Do NOT recommend pesticides, chemicals, or dosages.\n"
            "- Do NOT provide fertilizer advice or prevention steps.\n"
            "- Return your response ONLY as a valid JSON object matching the required schema.\n\n"
            "Required JSON Schema:\n"
            "{\n"
            '  "crop": "string",\n'
            '  "disease": "string",\n'
            '  "confidence": float\n'
            "}"
        )

        image_part = types.Part.from_bytes(
            data=image_bytes,
            mime_type=content_type or "image/jpeg"
        )

        config = types.GenerateContentConfig(
            response_mime_type="application/json"
        )

        try:
            # Execute async content generation using google-genai client
            response = await self.client.aio.models.generate_content(
                model=self.model_name,
                contents=[prompt, image_part],
                config=config
            )
        except Exception as exc:
            logger.error(f"[RealGeminiService] API Exception during generate_content: {exc}")
            raise RuntimeError(f"Gemini API request failed: {exc}") from exc

        if not response or not response.text:
            logger.error("[RealGeminiService] Empty response received from Gemini API.")
            raise RuntimeError("Gemini API returned an empty response.")

        # Parse & Validate Structured Output
        try:
            data = json.loads(response.text.strip())
        except Exception as exc:
            logger.error(f"[RealGeminiService] Malformed JSON from Gemini: {response.text}")
            raise ValueError("Gemini API returned invalid non-JSON output.") from exc

        crop = data.get("crop")
        disease = data.get("disease")
        confidence_raw = data.get("confidence")

        # Validate mandatory identification fields
        if not crop or not isinstance(crop, str) or not crop.strip():
            logger.error(f"[RealGeminiService] Missing or invalid 'crop' field: {data}")
            raise ValueError("Gemini response missing valid 'crop' field.")

        if not disease or not isinstance(disease, str) or not disease.strip():
            logger.error(f"[RealGeminiService] Missing or invalid 'disease' field: {data}")
            raise ValueError("Gemini response missing valid 'disease' field.")

        try:
            confidence = float(confidence_raw)
            if confidence < 0.0 or confidence > 1.0:
                raise ValueError(f"Confidence {confidence} out of range [0.0, 1.0]")
        except (TypeError, ValueError) as exc:
            logger.error(f"[RealGeminiService] Invalid 'confidence' value '{confidence_raw}': {exc}")
            raise ValueError("Gemini response contained an invalid 'confidence' score.") from exc

        return {
            "crop": crop.strip(),
            "disease": disease.strip(),
            "confidence": confidence
        }

def get_gemini_service() -> BaseGeminiService:
    """
    Factory function to select Gemini service based on credentials.
    If GEMINI_API_KEY is empty or missing, fallback to MockGeminiService.
    """
    if not settings.GEMINI_API_KEY or not settings.GEMINI_API_KEY.strip():
        return MockGeminiService()
    return RealGeminiService()
