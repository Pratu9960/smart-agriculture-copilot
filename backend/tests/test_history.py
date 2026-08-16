from fastapi.testclient import TestClient

from main import app
import routes.history as history_route
from services.base_firebase import MockFirebaseService


client = TestClient(app)

# Use one mock service for the test suite so both tests
# operate against the same in-memory history database.
mock_firebase_service = MockFirebaseService()


def fake_get_user_id(authorization=None):
    """
    Simulate a successfully authenticated Firebase user.
    """
    return "test-user-123"


def fake_get_firebase_service():
    """
    Keep tests isolated from the real Firestore database.
    """
    return mock_firebase_service


# Replace production authentication/Firebase service with test doubles.
history_route.get_user_id = fake_get_user_id
history_route.get_firebase_service = fake_get_firebase_service


def test_get_history():
    response = client.get(
        "/api/history",
        headers={
            "Authorization": "Bearer test-firebase-token"
        }
    )

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

    response = client.post(
        "/api/history",
        json=payload,
        headers={
            "Authorization": "Bearer test-firebase-token"
        }
    )

    assert response.status_code == 200

    data = response.json()

    assert data["success"] is True
    assert data["record"]["crop"] == "Tomato"
    assert data["record"]["disease"] == "Early Blight"