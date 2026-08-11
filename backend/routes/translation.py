from fastapi import APIRouter
from models.schemas import TranslationRequest, TranslationResponse
from services.base_bhashini import get_bhashini_service

router = APIRouter(prefix="/api", tags=["Translation"])

@router.post("/translate", response_model=TranslationResponse)
async def translate_text(payload: TranslationRequest):
    """
    Translate text into requested target language.
    Canonical field: 'target_language'
    """
    bhashini_service = get_bhashini_service()
    return await bhashini_service.translate(
        text=payload.text,
        target_language=payload.target_language,
        source_language=payload.source_language or "en"
    )
