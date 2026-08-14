from abc import ABC, abstractmethod
import json
import logging
from typing import Dict, Any
from config.settings import settings

logger = logging.getLogger("smart_ag_backend.gemini")


class BaseGeminiService(ABC):
    """
    Abstract interface for Crop Disease AI Classification.

    Gemini is responsible ONLY for:
    - crop
    - disease
    - confidence

    Agricultural recommendations are handled separately by KnowledgeService.
    """

    @property
    @abstractmethod
    def is_mock(self) -> bool:
        pass

    @abstractmethod
    async def diagnose_crop(
        self,
        image_bytes: bytes,
        filename: str,
        content_type: str = "image/jpeg"
    ) -> Dict[str, Any]:
        pass


class MockGeminiService(BaseGeminiService):
    """
    Development mock implementation.
    """

    @property
    def is_mock(self) -> bool:
        return True

    async def diagnose_crop(
        self,
        image_bytes: bytes,
        filename: str,
        content_type: str = "image/jpeg"
    ) -> Dict[str, Any]:

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
    Real Google Gemini Vision API service.

    Gemini ONLY identifies crop, disease and confidence.
    It does NOT generate agricultural recommendations.
    """

    @property
    def is_mock(self) -> bool:
        return False

    def __init__(self, api_key: str = None, model_name: str = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model_name or settings.GEMINI_MODEL

        from google import genai
        self.client = genai.Client(api_key=self.api_key)

    async def diagnose_crop(
        self,
        image_bytes: bytes,
        filename: str,
        content_type: str = "image/jpeg"
    ) -> Dict[str, Any]:

        from google.genai import types

        # ============================================================
        # SUPPORTED DISEASE CLASSES
        # These correspond to the project's knowledge database.
        # ============================================================

        supported_classes = """
Apple:
- Apple Scab
- Black Rot
- Cedar Apple Rust

Cherry:
- Powdery Mildew

Corn (Maize):
- Cercospora Leaf Spot / Gray Leaf Spot
- Common Rust
- Northern Leaf Blight

Grape:
- Black Rot
- Esca (Black Measles)
- Leaf Blight (Isariopsis Leaf Spot)

Orange:
- Huanglongbing (Citrus Greening)

Peach:
- Bacterial Spot

Bell Pepper:
- Bacterial Spot

Potato:
- Early Blight
- Late Blight

Squash:
- Powdery Mildew

Strawberry:
- Leaf Scorch

Tomato:
- Bacterial Spot
- Early Blight
- Late Blight
- Leaf Mold
- Septoria Leaf Spot
- Spider Mites (Two-Spotted Spider Mite)
- Target Spot
- Tomato Yellow Leaf Curl Virus
- Tomato Mosaic Virus
"""

        prompt = f"""
You are an expert agricultural plant pathology classifier
for the Smart Agriculture Copilot application.

Analyze the provided crop leaf image carefully.

YOUR RESPONSIBILITY IS STRICTLY LIMITED TO:
1. Identifying the crop.
2. Identifying the disease/condition.
3. Providing an estimated confidence score from 0.0 to 1.0.

You MUST NOT provide:
- treatment instructions
- pesticide recommendations
- pesticide names
- pesticide dosages
- fertilizer recommendations
- prevention instructions
- chemical recommendations
- any other agricultural advice

All agricultural recommendations are handled separately by the
application's verified KnowledgeService.

============================================================
SUPPORTED DISEASE CLASSES
============================================================

The application currently supports ONLY these disease classes:

{supported_classes}

============================================================
CLASSIFICATION RULE
============================================================

If the image clearly matches one of the supported classes,
return that supported crop and disease.

If the image does NOT clearly match one of the supported classes,
DO NOT invent or guess another disease.

Instead return:

{{
  "crop": "Unknown",
  "disease": "Unknown",
  "confidence": 0.0
}}

If the image is healthy and clearly corresponds to a supported crop,
you may return:

{{
  "crop": "<crop>",
  "disease": "Healthy",
  "confidence": <score>
}}

============================================================
IMPORTANT
============================================================

Do not return diseases that are not present in the supported list.

For example:

Wheat + Leaf Rust

is NOT currently supported.

Therefore, if the uploaded image appears to be Wheat Leaf Rust,
return:

{{
  "crop": "Unknown",
  "disease": "Unknown",
  "confidence": 0.0
}}

Do not substitute it with another disease.

============================================================
OUTPUT FORMAT
============================================================

Return ONLY valid JSON.

Required schema:

{{
  "crop": "string",
  "disease": "string",
  "confidence": 0.0
}}
"""

        image_part = types.Part.from_bytes(
            data=image_bytes,
            mime_type=content_type or "image/jpeg"
        )

        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.2
        )

        try:
            response = await self.client.aio.models.generate_content(
                model=self.model_name,
                contents=[prompt, image_part],
                config=config
            )

        except Exception as exc:
            logger.error(
                f"[RealGeminiService] API Exception during "
                f"generate_content: {exc}"
            )
            raise RuntimeError(
                f"Gemini API request failed: {exc}"
            ) from exc

        if not response or not response.text:
            logger.error(
                "[RealGeminiService] Empty response received "
                "from Gemini API."
            )
            raise RuntimeError(
                "Gemini API returned an empty response."
            )

        # ============================================================
        # PARSE JSON
        # ============================================================

        try:
            data = json.loads(response.text.strip())

        except Exception as exc:
            logger.error(
                f"[RealGeminiService] Malformed JSON from Gemini: "
                f"{response.text}"
            )
            raise ValueError(
                "Gemini API returned invalid non-JSON output."
            ) from exc

        # ============================================================
        # VALIDATE REQUIRED FIELDS
        # ============================================================

        crop = data.get("crop")
        disease = data.get("disease")
        confidence_raw = data.get("confidence")

        if (
            not crop
            or not isinstance(crop, str)
            or not crop.strip()
        ):
            logger.error(
                f"[RealGeminiService] Missing or invalid "
                f"'crop' field: {data}"
            )
            raise ValueError(
                "Gemini response missing valid 'crop' field."
            )

        if (
            not disease
            or not isinstance(disease, str)
            or not disease.strip()
        ):
            logger.error(
                f"[RealGeminiService] Missing or invalid "
                f"'disease' field: {data}"
            )
            raise ValueError(
                "Gemini response missing valid 'disease' field."
            )

        try:
            confidence = float(confidence_raw)

            if confidence < 0.0 or confidence > 1.0:
                raise ValueError(
                    f"Confidence {confidence} out of range [0.0, 1.0]"
                )

        except (TypeError, ValueError) as exc:
            logger.error(
                f"[RealGeminiService] Invalid 'confidence' value "
                f"'{confidence_raw}': {exc}"
            )
            raise ValueError(
                "Gemini response contained an invalid "
                "'confidence' score."
            ) from exc

        return {
            "crop": crop.strip(),
            "disease": disease.strip(),
            "confidence": confidence
        }


def get_gemini_service() -> BaseGeminiService:
    """
    Select Gemini service based on credentials.

    Empty/missing API key -> MockGeminiService.
    Valid API key -> RealGeminiService.
    """

    if (
        not settings.GEMINI_API_KEY
        or not settings.GEMINI_API_KEY.strip()
    ):
        return MockGeminiService()

    return RealGeminiService()