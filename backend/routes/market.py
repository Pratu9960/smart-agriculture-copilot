from typing import Optional, List
from fastapi import APIRouter, Query, HTTPException
from models.schemas import (
    CropMetadataItem,
    MarketPriceLatestResponse,
    MarketPriceHistoryResponse,
    LocationHierarchyItem
)
from services.base_market import market_service

router = APIRouter(prefix="/api/market", tags=["Market Prices"])


@router.get("/crops", response_model=List[CropMetadataItem])
async def get_market_crops():
    """
    Returns list of supported agricultural commodities with metadata,
    standard units, accent colors, and categories.
    """
    try:
        crops = market_service.get_crops()
        return crops
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve crop metadata: {str(ex)}")


@router.get("/locations")
async def get_market_locations():
    """
    Returns hierarchical location mapping of States -> Districts -> Mandis/APMCs.
    """
    try:
        locations = market_service.get_locations()
        return locations
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve locations: {str(ex)}")


@router.get("/latest", response_model=MarketPriceLatestResponse)
async def get_latest_market_price(
    commodity: str = Query(..., description="Crop name, e.g. 'Soybean' or 'Tomato'"),
    state: Optional[str] = Query("Maharashtra", description="State name"),
    district: Optional[str] = Query("Dharashiv", description="District name"),
    market: Optional[str] = Query(None, description="Specific Mandi/APMC name")
):
    """
    Retrieves latest wholesale mandi prices for the requested commodity and location,
    along with comparison prices from nearby markets.
    """
    try:
        result = await market_service.get_latest_prices(
            commodity=commodity,
            state=state,
            district=district,
            market=market
        )
        return result
    except Exception as ex:
        raise HTTPException(status_code=503, detail=f"Market price service temporarily unavailable: {str(ex)}")


@router.get("/history", response_model=MarketPriceHistoryResponse)
async def get_market_price_history(
    commodity: str = Query(..., description="Crop name, e.g. 'Soybean'"),
    state: Optional[str] = Query("Maharashtra", description="State name"),
    district: Optional[str] = Query("Dharashiv", description="District name"),
    market: Optional[str] = Query(None, description="Mandi/APMC name"),
    period: Optional[str] = Query("30d", description="Time period: '7d', '30d', '3m', '6m', '1y'")
):
    """
    Retrieves authentic daily recorded historical mandi price observations
    and calculated summary metrics (High, Low, Net Change, Trend).
    """
    try:
        result = await market_service.get_price_history(
            commodity=commodity,
            state=state,
            district=district,
            market=market,
            period=period
        )
        return result
    except Exception as ex:
        raise HTTPException(status_code=503, detail=f"Price history temporarily unavailable: {str(ex)}")
