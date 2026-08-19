from abc import ABC, abstractmethod
from config.settings import settings
from models.schemas import TranslationResponse


LANGUAGE_MAP = {
    "en": "en-IN",
    "mr": "mr-IN",
    "hi": "hi-IN",
    "ta": "ta-IN",
    "te": "te-IN",
}


class BaseTranslationService(ABC):
    """
    Abstract interface for multilingual translation.
    """

    @abstractmethod
    async def translate(
        self,
        text: str,
        target_language: str,
        source_language: str = "en",
    ) -> TranslationResponse:
        pass


class MockTranslationService(BaseTranslationService):
    """
    Development fallback when SARVAM_API_KEY is unavailable.
    """

    async def translate(
        self,
        text: str,
        target_language: str,
        source_language: str = "en",
    ) -> TranslationResponse:
        translations_mr = {
            "What disease is affecting my crop?": "माझ्या पिकावर कोणता रोग झाला आहे?",
            "Early Blight": "अर्ली ब्लाइट (करपा रोग)",
            "Late Blight": "लेट ब्लाइट (तांबेरा/करपा रोग)",
            "Healthy": "निरोगी",
            "Tomato": "टोमॅटो",
            "Potato": "बटाटा"
        }
        translations_hi = {
            "What disease is affecting my crop?": "मेरी फसल में कौन सा रोग लगा है?",
            "Early Blight": "अगेती झुलसा रोग",
            "Late Blight": "पछेती झुलसा रोग",
            "Healthy": "स्वस्थ",
            "Tomato": "टमाटर",
            "Potato": "आलू"
        }
        translations_ta = {
            "What disease is affecting my crop?": "என் பயிரை எந்த நோய் பாதிக்கின்றது?",
            "Early Blight": "முற்கால பிளைட் (Early Blight)",
            "Late Blight": "பிற்கால பிளைட் (Late Blight)",
            "Healthy": "ஆரோக்கியமானது",
            "Tomato": "தக்காளி",
            "Potato": "உருளைக்கிழங்கு"
        }
        translations_te = {
            "What disease is affecting my crop?": "నా పంటపై ఏ తెగులు పడింది?",
            "Early Blight": "ముందస్తు తెగులు (Early Blight)",
            "Late Blight": "ఆలస్యపు తెగులు (Late Blight)",
            "Healthy": "ఆరోగ్యకరమైనది",
            "Tomato": "టమోటా",
            "Potato": "బంగాళాదుంప"
        }

        if target_language == "mr":
            translated = translations_mr.get(text, f"[मराठी]: {text}")
        elif target_language == "hi":
            translated = translations_hi.get(text, f"[हिंदी]: {text}")
        elif target_language == "ta":
            translated = translations_ta.get(text, f"[தமிழ் (Dev Mock)]: {text}")
        elif target_language == "te":
            translated = translations_te.get(text, f"[తెలుగు (Dev Mock)]: {text}")
        else:
            translated = text

        return TranslationResponse(
            translatedText=translated,
            isDevFallback=True,
        )


class SarvamTranslationService(BaseTranslationService):
    """
    Real translation service using Sarvam AI.
    """

    def __init__(self):
        from sarvamai import AsyncSarvamAI

        self.client = AsyncSarvamAI(
            api_subscription_key=settings.SARVAM_API_KEY.strip()
        )

    async def translate(
        self,
        text: str,
        target_language: str,
        source_language: str = "en",
    ) -> TranslationResponse:

        if not text or not text.strip():
            return TranslationResponse(
                translatedText=text,
                isDevFallback=False,
            )

        source_code = LANGUAGE_MAP.get(
            source_language,
            source_language,
        )

        target_code = LANGUAGE_MAP.get(
            target_language,
            target_language,
        )

        if source_code == target_code:
            return TranslationResponse(
                translatedText=text,
                isDevFallback=False,
            )

        # Sarvam Translate supports up to 2000 characters.
        if len(text) > 2000:
            raise ValueError(
                "Text is too long for a single Sarvam translation request."
            )

        try:
            response = await self.client.text.translate(
                input=text,
                source_language_code=source_code,
                target_language_code=target_code,
                model="sarvam-translate:v1",
            )

            return TranslationResponse(
                translatedText=response.translated_text,
                isDevFallback=False,
            )

        except Exception as exc:
            print(
                "[Sarvam] Translation failed:",
                str(exc),
            )
            raise


def get_bhashini_service() -> BaseTranslationService:
    """
    Backward-compatible factory.

    Existing /api/translate code can continue calling
    get_bhashini_service().
    """

    api_key = (
        getattr(settings, "SARVAM_API_KEY", "") or ""
    ).strip()

    if not api_key:
        print(
            "[Translation] SARVAM_API_KEY not configured. "
            "Using development mock."
        )
        return MockTranslationService()

    return SarvamTranslationService()