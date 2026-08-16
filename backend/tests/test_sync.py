from fastapi.testclient import TestClient

from main import app
import routes.sync as sync_route
from services.base_firebase import MockFirebaseService


client = TestClient(app)

# Keep sync tests isolated from the real Firestore database.
mock_firebase_service = MockFirebaseService()


def fake_get_user_id(authorization=None):
    """
    Simulate a successfully authenticated Firebase user.
    """
    return "test-user-123"


def fake_get_firebase_service():
    """
    Use the in-memory mock service during tests.
    """
    return mock_firebase_service


# Replace production dependencies with test doubles.
sync_route.get_user_id = fake_get_user_id
sync_route.get_firebase_service = fake_get_firebase_service


def test_sync_records():
    payload = {
        "records": [
            {
                "id": "offline_001",
                "crop": "Potato",
                "disease": "Late Blight",
                "syncStatus": "PENDING",
            }
        ]
    }

    response = client.post(
        "/api/sync",
        json=payload,
        headers={
            "Authorization": "Bearer test-firebase-token"
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["success"] is True
    assert data["syncedCount"] == 1
    assert data["isDevMock"] is True