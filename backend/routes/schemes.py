import logging
from typing import Optional, List
from fastapi import APIRouter, Query, HTTPException, Path
from models.schemas import (
    GovernmentSchemeItem,
    SchemeCategoryItem,
    SchemeEligibilityCheckRequest,
    SchemeEligibilityCheckResponse
)
from services.base_schemes import schemes_service

logger = logging.getLogger("smart_ag_backend.routes.schemes")
router = APIRouter(prefix="/api/schemes", tags=["Government Schemes"])


@router.get("", response_model=List[GovernmentSchemeItem])
async def get_government_schemes(
    q: Optional[str] = Query(None, description="Search term for scheme name, keyword or purpose"),
    category: Optional[str] = Query(None, description="Category filter (e.g. 'Crop Insurance', 'Farmer Financial Support')"),
    level: Optional[str] = Query(None, description="'Central' or 'State'"),
    state: Optional[str] = Query(None, description="State filter (e.g. 'Maharashtra')"),
    crop: Optional[str] = Query(None, description="Crop filter (e.g. 'Soybean')")
):
    """
    Returns verified official government schemes with flexible search and filtering.
    """
    try:
        results = schemes_service.get_schemes(
            query=q,
            category=category,
            level=level,
            state=state,
            crop=crop
        )
        return results
    except Exception as ex:
        logger.error("[SchemesRoute] Failed to query schemes: %s", ex)
        raise HTTPException(status_code=500, detail="Failed to query government schemes.")


@router.get("/categories", response_model=List[SchemeCategoryItem])
async def get_scheme_categories():
    """
    Returns list of official scheme categories with live scheme counts.
    """
    try:
        categories = schemes_service.get_categories()
        return categories
    except Exception as ex:
        logger.error("[SchemesRoute] Failed to retrieve scheme categories: %s", ex)
        raise HTTPException(status_code=500, detail="Failed to retrieve scheme categories.")


@router.get("/{scheme_id}", response_model=GovernmentSchemeItem)
async def get_scheme_by_id(
    scheme_id: str = Path(..., description="Unique scheme identifier, e.g. 'pm-kisan'")
):
    """
    Returns full verified details of a specific government scheme.
    """
    scheme = schemes_service.get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail="Government scheme not found")
    return scheme


@router.post("/{scheme_id}/check-eligibility", response_model=SchemeEligibilityCheckResponse)
async def check_scheme_eligibility(
    scheme_id: str = Path(..., description="Scheme identifier"),
    request: SchemeEligibilityCheckRequest = ...
):
    """
    Evaluates farmer eligibility against official criteria based on answered parameters.
    """
    try:
        result = schemes_service.check_eligibility(scheme_id, request.answers)
        return result
    except Exception as ex:
        logger.error("[SchemesRoute] Failed to check eligibility for scheme '%s': %s", scheme_id, ex)
        raise HTTPException(status_code=500, detail="Failed to check scheme eligibility.")
