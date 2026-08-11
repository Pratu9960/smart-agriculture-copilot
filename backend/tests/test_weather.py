from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_weather_success():
    response = client.get("/api/weather?latitude=20.0&longitude=73.78")
    assert response.status_code == 200
    data = response.json()
    assert "location" in data
    assert data["latitude"] == 20.0
    assert data["longitude"] == 73.78
    assert "temperature" in data
    assert "irrigationAdvisory" in data
    assert data["irrigationAdvisory"]["recommendation"] == "DELAY_IRRIGATION"

def test_get_weather_invalid_latitude():
    response = client.get("/api/weather?latitude=150.0&longitude=73.78")
    assert response.status_code == 400
    assert "Latitude must be between -90 and 90" in response.json()["detail"]

def test_get_weather_missing_params():
    response = client.get("/api/weather")
    assert response.status_code == 422
