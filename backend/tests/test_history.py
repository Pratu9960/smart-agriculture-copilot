from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_history():
    response = client.get("/api/history")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "crop" in data[0]

def test_save_history():
    payload = {
        "crop": "Tomato",
        "disease": "Early Blight",
        "confidence": 0.95,
        "symptoms": ["Concentric dark rings"],
        "treatment": "Copper fungicide"
    }
    response = client.post("/api/history", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["record"]["crop"] == "Tomato"
    assert data["record"]["disease"] == "Early Blight"
