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


def test_reverse_location_success():
    response = client.get("/api/location/reverse?latitude=17.7518&longitude=76.1277")
    assert response.status_code == 200
    data = response.json()
    assert "displayName" in data
    assert "latitude" in data
    assert "longitude" in data


def test_search_location_success():
    response = client.get("/api/location/search?q=Osmanabad")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "latitude" in data[0]
    assert "longitude" in data[0]
