import logging

from fastapi import APIRouter, Query, HTTPException, status
from models.schemas import WeatherResponse
from services.base_weather import MockWeatherService, get_weather_service

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
    except RuntimeError as exc:
        # Keep the application usable when the upstream weather provider is
        # unavailable (for example, offline development or a temporary outage).
        # The response is explicitly marked as a development mock payload so
        # the client can distinguish it from live weather data.
        logger.warning("Live weather unavailable; using development fallback: %s", exc)
        return await MockWeatherService().get_weather(latitude, longitude)
