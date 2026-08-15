import logging

from fastapi import APIRouter, Query, HTTPException, status
from models.schemas import WeatherResponse
from services.base_weather import get_weather_service

router = APIRouter(prefix="/api", tags=["Weather"])
logger = logging.getLogger("smart_ag_backend.routes.weather")

@router.get("/weather", response_model=WeatherResponse)
async def get_weather(
    latitude: float = Query(..., description="Location latitude (e.g. 20.0)"),
    longitude: float = Query(..., description="Location longitude (e.g. 73.78)")
):
    """
    Fetch current weather snapshot and weather-based irrigation advisory.
    """
    if latitude < -90.0 or latitude > 90.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Latitude must be between -90 and 90 degrees."
        )
    if longitude < -180.0 or longitude > 180.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Longitude must be between -180 and 180 degrees."
        )

    weather_service = get_weather_service()
    try:
        return await weather_service.get_weather(latitude, longitude)
    except Exception as exc:
        # Never substitute fabricated conditions for a failed live request.
        # The frontend can decide whether to show a real cached snapshot.
        logger.warning("Live weather unavailable: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Weather service is temporarily unavailable."
        ) from exc
