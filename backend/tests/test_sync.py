from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_sync_records():
    payload = {
        "records": [
            {
                "id": "offline_001",
                "crop": "Potato",
                "disease": "Late Blight",
                "syncStatus": "PENDING"
            }
        ]
    }
    response = client.post("/api/sync", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["syncedCount"] == 1
    assert data["isDevMock"] is True
