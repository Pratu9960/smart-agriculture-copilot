"""Location search and reverse-geocoding endpoints used by the weather flow."""

import logging

import httpx
from fastapi import APIRouter, HTTPException, Query, status

router = APIRouter(prefix="/api/location", tags=["Location"])
logger = logging.getLogger("smart_ag_backend.location")

NOMINATIM_URL = "https://nominatim.openstreetmap.org"
NOMINATIM_HEADERS = {
    "User-Agent": "HaritKranti-Smart-Agriculture-Copilot/1.0 (weather location lookup)"
}


def _location_payload(item):
    address = item.get("address") or {}
    city = (
        address.get("city")
        or address.get("town")
        or address.get("village")
        or address.get("municipality")
        or address.get("county")
    )
    return {
        "latitude": float(item["lat"]),
        "longitude": float(item["lon"]),
        "displayName": item.get("display_name") or city or "",
        "city": city or "",
        "state": address.get("state") or "",
        "country": address.get("country") or ""
    }


async def _nominatim_request(path, params):
    try:
        async with httpx.AsyncClient(timeout=8.0, headers=NOMINATIM_HEADERS) as client:
            response = await client.get(f"{NOMINATIM_URL}{path}", params=params)
            response.raise_for_status()
            return response.json()
    except (httpx.TimeoutException, httpx.HTTPError, ValueError) as exc:
        logger.warning("Nominatim request failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Location service is temporarily unavailable."
        ) from exc


@router.get("/search")
async def search_location(
    q: str = Query(..., min_length=2, max_length=120),
    limit: int = Query(5, ge=1, le=8)
):
    results = await _nominatim_request(
        "/search",
        {
            "q": q.strip(),
            "format": "jsonv2",
            "addressdetails": 1,
            "limit": limit,
            "countrycodes": "in"
        }
    )
    return [_location_payload(item) for item in results if item.get("lat") and item.get("lon")]


@router.get("/reverse")
async def reverse_location(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180)
):
    result = await _nominatim_request(
        "/reverse",
        {
            "lat": latitude,
            "lon": longitude,
            "format": "jsonv2",
            "addressdetails": 1,
            "zoom": 10
        }
    )
    if not result or not result.get("lat") or not result.get("lon"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location could not be resolved."
        )
    return _location_payload(result)
