from fastapi import APIRouter, UploadFile, File, HTTPException, status
import time
from models.schemas import DiagnosisResponse, PesticideItem
from services.base_gemini import get_gemini_service
from services.knowledge_service import KnowledgeService

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
    classification = await gemini_service.diagnose_crop(image_bytes, file.filename)
    
    crop = classification.get("crop", "Crop")
    disease = classification.get("disease", "Disease")
    confidence = float(classification.get("confidence", 0.90))

    # 5. Lookup Recommendations from Agricultural Recommendation Knowledge Base
    recommendations = knowledge_service.get_recommendations(crop, disease)

    # Format pesticide items list
    pesticide_items = []
    raw_pesticides = recommendations.get("pesticides", [])
    for p in raw_pesticides:
        if isinstance(p, dict):
            pesticide_items.append(PesticideItem(name=p.get("name", ""), dosage=p.get("dosage", "")))
        elif isinstance(p, str):
            pesticide_items.append(PesticideItem(name=p, dosage="As per local product label"))

    scan_id = f"scan_{int(time.time())}"
    timestamp_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ")

    return DiagnosisResponse(
        id=scan_id,
        crop=crop,
        disease=disease,
        confidence=confidence,
        severity=recommendations.get("severity", "Unknown"),
        timestamp=timestamp_iso,
        symptoms=recommendations.get("symptoms", []),
        cause=recommendations.get("cause", ""),
        treatment=recommendations.get("treatment", ""),
        pesticides=pesticide_items,
        fertilizer=recommendations.get("fertilizer", ""),
        prevention=recommendations.get("prevention", []),
        isDevMockPayload=True
    )
