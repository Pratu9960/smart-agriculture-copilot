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

Bell Pepper:
- Bacterial Spot

Black Gram (Urad):
- Yellow Mosaic Virus (YMV)
- Leaf Crinkle Virus
- Cercospora Leaf Spot

Brinjal:
- Phomopsis Blight and Fruit Rot
- Bacterial Wilt
- Little Leaf Disease

Cabbage:
- Black Rot
- Damping Off
- Downy Mildew

Cauliflower:
- Black Rot
- Downy Mildew
- Alternaria Leaf Spot (Blight)

Cherry:
- Powdery Mildew

Chickpea (Gram):
- Fusarium Wilt
- Ascochyta Blight
- Botrytis Grey Mold (BGM)

Chilli:
- Anthracnose (Fruit Rot / Die-back)
- Chilli Leaf Curl Virus (ChiLCV)
- Powdery Mildew

Corn (Maize):
- Cercospora Leaf Spot / Gray Leaf Spot
- Common Rust
- Northern Leaf Blight
- Turcicum Leaf Blight (Northern Corn Leaf Blight)

Cotton:
- Bacterial Blight (Angular Leaf Spot)
- Grey Mildew (Ramularia Leaf Spot)
- Cotton Leaf Curl Virus (CLCuV)

Grape:
- Black Rot
- Esca (Black Measles)
- Leaf Blight (Isariopsis Leaf Spot)

Green Gram (Moong):
- Yellow Mosaic Virus (MYMV)
- Cercospora Leaf Spot
- Powdery Mildew

Groundnut:
- Early Leaf Spot (Tikka Disease)
- Late Leaf Spot
- Rust

Okra (Bhindi):
- Yellow Vein Mosaic Virus (YVMV)
- Powdery Mildew
- Cercospora Leaf Spot

Onion:
- Purple Blotch
- Stemphylium Blight
- Downy Mildew

Orange:
- Huanglongbing (Citrus Greening)

Peach:
- Bacterial Spot

Pearl Millet (Bajra):
- Downy Mildew (Green Ear Disease)
- Ergot
- Grain Smut

Pigeon Pea (Tur):
- Fusarium Wilt
- Sterility Mosaic Disease (SMD)
- Phytophthora Blight

Potato:
- Early Blight
- Late Blight

Rice:
- Rice Blast
- Bacterial Leaf Blight (BLB)
- Sheath Blight

Sorghum (Jowar):
- Grain Mold
- Anthracnose
- Downy Mildew

Soybean:
- Soybean Rust
- Yellow Mosaic Virus (YMV)
- Bacterial Pustule

Squash:
- Powdery Mildew

Strawberry:
- Leaf Scorch

Sugarcane:
- Red Rot
- Smut
- Wilt

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

Wheat:
- Brown (Leaf) Rust
- Yellow (Stripe) Rust
- Karnal Bunt
"""

        prompt = f"""
You are an expert agricultural plant pathology classifier for the Smart Agriculture Copilot application.

Analyze the provided crop leaf image carefully.

YOUR RESPONSIBILITY IS STRICTLY LIMITED TO:
1. Identifying the crop name.
2. Identifying the disease name or specifying "Healthy" if no disease is present.
3. Providing an estimated confidence score between 0.0 and 1.0.

STRICT RESTRICTIONS:
- You MUST NOT provide treatment instructions.
- You MUST NOT provide pesticide recommendations, names, or dosages.
- You MUST NOT provide fertilizer guidance.
- You MUST NOT provide prevention instructions.
- You MUST NOT return markdown or additional explanation.
- You MUST NOT invent additional fields.

All verified agricultural recommendations are retrieved separately from the authoritative agricultural knowledge database.

============================================================
SUPPORTED CROPS & DISEASES
============================================================

{supported_classes}

============================================================
OUTPUT FORMAT
============================================================

Return STRICT JSON only matching this schema:
{{
  "crop": "Detected crop name",
  "disease": "Detected disease name or Healthy",
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