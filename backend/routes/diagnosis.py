from fastapi import APIRouter, UploadFile, File, HTTPException, status
import logging
import time
from models.schemas import DiagnosisResponse, PesticideItem
from services.base_gemini import get_gemini_service
from services.knowledge_service import KnowledgeService

logger = logging.getLogger("smart_ag_backend.routes.diagnosis")
router = APIRouter(prefix="/api", tags=["Diagnosis"])
knowledge_service = KnowledgeService()

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit

@router.post("/diagnose", response_model=DiagnosisResponse)
async def diagnose_crop(file: UploadFile = File(...)):
    """
    Accepts an uploaded crop leaf image file.
    Uses Gemini / AI model for crop and disease identification.
    Uses Crop Disease Agricultural Recommendation Knowledge Base for verified treatment guidance.
    """
    # 1. Validate File Presence
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file uploaded or invalid filename provided."
        )

    # 2. Validate File Content Type
    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{content_type}'. Uploaded file must be an image (JPEG, PNG, WEBP)."
        )

    # 3. Read File Bytes & Validate Size
    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes)."
        )
    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed limit of 10MB."
        )

    # 4. Perform AI Classification
    gemini_service = get_gemini_service()
    try:
        classification = await gemini_service.diagnose_crop(
            image_bytes=image_bytes,
            filename=file.filename,
            content_type=content_type
        )
    except ValueError as val_err:
        logger.error(f"[DiagnosisRoute] Invalid response from AI classification service: {val_err}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI diagnosis service returned invalid output: {str(val_err)}"
        )
    except Exception as exc:
        logger.error(f"[DiagnosisRoute] AI classification service failed: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI crop diagnosis service is temporarily unavailable. Please try again later."
        )

    crop = classification.get("crop", "Crop")
    disease = classification.get("disease", "Disease")
    confidence = float(classification.get("confidence", 0.90))

    # 5. Lookup Recommendations from Agricultural Recommendation Knowledge Base
    crop_res = knowledge_service.get_knowledge_record(crop, disease)
    is_healthy = disease.strip().lower() == "healthy"

    if is_healthy and not crop_res:
        # Healthy plant fallback
        healthy_info = knowledge_service.get_healthy_fallback()
        severity = healthy_info["severity"]
        symptoms = healthy_info["symptoms"]
        cause = healthy_info["cause"]
        treatment = healthy_info["treatment"]
        raw_pesticides = healthy_info["pesticides"]
        fertilizer = healthy_info["fertilizer"]
        prevention = healthy_info["prevention"]
        sources = healthy_info["sources"]
        recommendations_verified = healthy_info["recommendationsVerified"]
        knowledge_match = healthy_info["knowledgeMatch"]
        knowledge_match_type = healthy_info["knowledgeMatchType"]
    elif crop_res:
        # Enriched database match
        record, match_type = crop_res
        severity = record.get("severity")
        symptoms = record.get("symptoms", [])
        cause = record.get("cause", "")
        treatment = record.get("treatment", "")
        raw_pesticides = record.get("pesticides", [])
        fertilizer = record.get("fertilizer", "")
        prevention = record.get("prevention", [])
        sources = record.get("sources", [])
        recommendations_verified = bool(record.get("recommendationsVerified", True))
        knowledge_match = True
        knowledge_match_type = match_type
    else:
        # No database match
        unmatched_info = knowledge_service.get_unmatched_fallback()
        severity = unmatched_info["severity"]
        symptoms = unmatched_info["symptoms"]
        cause = unmatched_info["cause"]
        treatment = unmatched_info["treatment"]
        raw_pesticides = unmatched_info["pesticides"]
        fertilizer = unmatched_info["fertilizer"]
        prevention = unmatched_info["prevention"]
        sources = unmatched_info["sources"]
        recommendations_verified = unmatched_info["recommendationsVerified"]
        knowledge_match = unmatched_info["knowledgeMatch"]
        knowledge_match_type = unmatched_info["knowledgeMatchType"]

    # Format pesticide items list
    pesticide_items = []
    for p in raw_pesticides:
        if isinstance(p, dict):
            pesticide_items.append(
                PesticideItem(
                    name=p.get("name", ""),
                    dosage=p.get("dosage", ""),
                    formulation=p.get("formulation"),
                    application=p.get("application"),
                    source=p.get("source"),
                )
            )
        elif isinstance(p, str):
            pesticide_items.append(
                PesticideItem(
                    name=p,
                    dosage="As per local product label",
                )
            )

    scan_id = f"scan_{int(time.time())}"
    timestamp_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ")

    return DiagnosisResponse(
        id=scan_id,
        crop=crop,
        disease=disease,
        confidence=confidence,
        severity=severity,
        timestamp=timestamp_iso,
        symptoms=symptoms,
        cause=cause,
        treatment=treatment,
        pesticides=pesticide_items,
        fertilizer=fertilizer,
        prevention=prevention,
        sources=sources,
        recommendationsVerified=recommendations_verified,
        knowledgeMatch=knowledge_match,
        knowledgeMatchType=knowledge_match_type,
        mode="online",
        isDevMockPayload=gemini_service.is_mock
    )
