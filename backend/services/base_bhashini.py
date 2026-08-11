from abc import ABC, abstractmethod
from config.settings import settings
from models.schemas import TranslationResponse

class BaseBhashiniService(ABC):
    """
    Abstract interface for Multilingual Translation via Bhashini.
    """
    @abstractmethod
    async def translate(self, text: str, target_language: str, source_language: str = "en") -> TranslationResponse:
        pass

class MockBhashiniService(BaseBhashiniService):
    """
    Development Mock Bhashini Service.
    Provides basic regional language mock translations for UI testing.
    """
    async def translate(self, text: str, target_language: str, source_language: str = "en") -> TranslationResponse:
        # Simple sample translations for common agricultural UI queries
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

        if target_language == "mr":
            translated = translations_mr.get(text, f"[मराठी]: {text}")
        elif target_language == "hi":
            translated = translations_hi.get(text, f"[हिंदी]: {text}")
        else:
            translated = text

        return TranslationResponse(
            translatedText=translated,
            isDevFallback=True
        )

def get_bhashini_service() -> BaseBhashiniService:
    """
    Factory function for Bhashini Service.
    If BHASHINI_API_KEY is empty/missing, uses MockBhashiniService.
    """
    if not settings.BHASHINI_API_KEY or not settings.BHASHINI_API_KEY.strip():
        return MockBhashiniService()
    return MockBhashiniService()
