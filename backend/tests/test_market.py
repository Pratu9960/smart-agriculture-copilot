import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_get_market_crops():
    response = client.get("/api/market/crops")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5
    crop_ids = [c["id"] for c in data]
    assert "soybean" in crop_ids
    assert "tomato" in crop_ids
    assert "wheat" in crop_ids


def test_get_market_locations():
    response = client.get("/api/market/locations")
    assert response.status_code == 200
    data = response.json()
    assert "Maharashtra" in data
    assert "Dharashiv" in data["Maharashtra"]
    assert "Dharashiv" in data["Maharashtra"]["Dharashiv"]


def test_get_latest_market_price_success():
    response = client.get("/api/market/latest", params={
        "commodity": "Soybean",
        "state": "Maharashtra",
        "district": "Dharashiv",
        "market": "Dharashiv"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["commodity"].lower() == "soybean"
    assert data["selectedMarket"] is not None
    assert data["selectedMarket"]["market"] == "Dharashiv"
    assert data["selectedMarket"]["modalPrice"] > 0
    assert data["selectedMarket"]["unit"] == "₹ / Quintal"
    assert len(data["nearbyMarkets"]) >= 1


def test_get_market_price_history_30d():
    response = client.get("/api/market/history", params={
        "commodity": "Tomato",
        "state": "Maharashtra",
        "district": "Dharashiv",
        "market": "Dharashiv",
        "period": "30d"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["commodity"].lower() == "tomato"
    assert data["period"] == "30d"
    assert len(data["records"]) > 0
    assert data["periodHigh"] is not None
    assert data["periodLow"] is not None
    assert data["trend"] in ["Increasing", "Stable", "Decreasing", "Insufficient data"]
    assert len(data["whatChartShows"]) > 0
