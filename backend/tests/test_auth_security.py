import io
from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient
from firebase_admin import auth

from main import app
from models.schemas import ScanRecordItem
from services.base_firebase import MockFirebaseService
import routes.history as history_route
import routes.sync as sync_route

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_dependency_overrides():
    app.dependency_overrides.clear()
    yield
    app.dependency_overrides.clear()


# ============================================================================
# 1. AUTHENTICATION REJECTION TESTS (UNAUTHENTICATED / MALFORMED / INVALID)
# ============================================================================

def test_history_missing_auth_header_returns_401():
    """Accessing /api/history without an Authorization header must return 401."""
    response = client.get("/api/history")
    assert response.status_code == 401
    assert "Authentication required" in response.json()["detail"]


def test_history_non_bearer_scheme_returns_401():
    """Authorization header with non-Bearer scheme must return 401."""
    response = client.get("/api/history", headers={"Authorization": "Basic dXNlcjpwYXNz"})
    assert response.status_code == 401
    assert "Invalid authorization header" in response.json()["detail"]


def test_history_empty_bearer_token_returns_401():
    """Authorization header with empty Bearer token must return 401."""
    response = client.get("/api/history", headers={"Authorization": "Bearer   "})
    assert response.status_code == 401
    assert "Missing Firebase ID token" in response.json()["detail"]


def test_history_invalid_token_signature_returns_401():
    """Invalid token signature must be caught and return 401."""
    with patch("firebase_admin.auth.verify_id_token", side_effect=Exception("Invalid token signature")):
        response = client.get("/api/history", headers={"Authorization": "Bearer invalid.jwt.token"})
        assert response.status_code == 401
        assert "Invalid or expired authentication token" in response.json()["detail"]


def test_history_expired_token_returns_401():
    """Expired Firebase token must return 401."""
    with patch("firebase_admin.auth.verify_id_token", side_effect=Exception("Firebase ID token has expired")):
        response = client.get("/api/history", headers={"Authorization": "Bearer expired.jwt.token"})
        assert response.status_code == 401
        assert "Invalid or expired authentication token" in response.json()["detail"]


def test_save_history_missing_auth_returns_401():
    """POST /api/history without auth must return 401."""
    payload = {"crop": "Tomato", "disease": "Early Blight", "treatment": "Spray fungicide"}
    response = client.post("/api/history", json=payload)
    assert response.status_code == 401


def test_sync_missing_auth_returns_401():
    """POST /api/sync without auth must return 401."""
    payload = {"records": [{"id": "offline_1", "crop": "Wheat", "disease": "Rust"}]}
    response = client.post("/api/sync", json=payload)
    assert response.status_code == 401


# ============================================================================
# 2. AUTHORIZATION & USER ISOLATION (IDOR DEFENSE)
# ============================================================================

def test_user_history_isolation_and_idor_resistance():
    """
    Verify strict multi-tenant data isolation:
    User Alice saving a scan record must NOT be visible or accessible to User Bob.
    """
    mock_service = MockFirebaseService()

    with patch("routes.history.get_firebase_service", return_value=mock_service):
        # Alice saves a scan
        alice_token = {"uid": "farmer-alice"}
        with patch("firebase_admin.auth.verify_id_token", return_value=alice_token):
            save_resp = client.post(
                "/api/history",
                json={
                    "crop": "Cotton",
                    "disease": "Bacterial Blight",
                    "confidence": 0.96,
                    "symptoms": ["Angular leaf spots"],
                    "treatment": "Copper spray"
                },
                headers={"Authorization": "Bearer alice-token"}
            )
            assert save_resp.status_code == 200
            alice_scan_id = save_resp.json()["record"]["id"]

        # Bob checks history -> Alice's scan MUST NOT be present in Bob's history
        bob_token = {"uid": "farmer-bob"}
        with patch("firebase_admin.auth.verify_id_token", return_value=bob_token):
            bob_resp = client.get(
                "/api/history",
                headers={"Authorization": "Bearer bob-token"}
            )
            assert bob_resp.status_code == 200
            bob_records = bob_resp.json()
            bob_scan_ids = [r["id"] for r in bob_records]
            assert alice_scan_id not in bob_scan_ids

        # Alice checks history -> Alice's scan MUST be present in Alice's history
        with patch("firebase_admin.auth.verify_id_token", return_value=alice_token):
            alice_resp = client.get(
                "/api/history",
                headers={"Authorization": "Bearer alice-token"}
            )
            assert alice_resp.status_code == 200
            alice_records = alice_resp.json()
            alice_scan_ids = [r["id"] for r in alice_records]
            assert alice_scan_id in alice_scan_ids


def test_sync_user_isolation():
    """
    Verify offline sync records are strictly scoped to the authenticated user UID.
    """
    mock_service = MockFirebaseService()

    with patch("routes.sync.get_firebase_service", return_value=mock_service), \
         patch("routes.history.get_firebase_service", return_value=mock_service):

        # Alice syncs offline records
        with patch("firebase_admin.auth.verify_id_token", return_value={"uid": "farmer-alice"}):
            sync_resp = client.post(
                "/api/sync",
                json={
                    "records": [
                        {"id": "sync_alice_01", "crop": "Rice", "disease": "Blast"}
                    ]
                },
                headers={"Authorization": "Bearer alice-token"}
            )
            assert sync_resp.status_code == 200
            assert sync_resp.json()["syncedCount"] == 1

        # Bob cannot see Alice's synced scan in Bob's history
        with patch("firebase_admin.auth.verify_id_token", return_value={"uid": "farmer-bob"}):
            bob_resp = client.get(
                "/api/history",
                headers={"Authorization": "Bearer bob-token"}
            )
            assert bob_resp.status_code == 200
            assert "sync_alice_01" not in [r["id"] for r in bob_resp.json()]


# ============================================================================
# 3. PUBLIC ENDPOINT ACCESSIBILITY (NO AUTH REQUIRED)
# ============================================================================

def test_public_health_endpoint_accessible():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_public_market_endpoints_accessible():
    # Crops
    resp_crops = client.get("/api/market/crops")
    assert resp_crops.status_code == 200

    # Locations
    resp_loc = client.get("/api/market/locations")
    assert resp_loc.status_code == 200

    # Latest
    resp_latest = client.get("/api/market/latest?commodity=Soybean")
    assert resp_latest.status_code == 200

    # History
    resp_hist = client.get("/api/market/history?commodity=Soybean")
    assert resp_hist.status_code == 200


def test_public_schemes_endpoints_accessible():
    # List
    resp_list = client.get("/api/schemes")
    assert resp_list.status_code == 200

    # Categories
    resp_cats = client.get("/api/schemes/categories")
    assert resp_cats.status_code == 200

    # Scheme detail
    resp_detail = client.get("/api/schemes/pm-kisan")
    assert resp_detail.status_code == 200

    # Eligibility check
    resp_check = client.post(
        "/api/schemes/pm-kisan/check-eligibility",
        json={"answers": {"ownsLand": True, "isInstitutionalLandholder": False}}
    )
    assert resp_check.status_code == 200


def test_public_location_endpoints_accessible():
    with patch("routes.location._nominatim_request", return_value=[{"lat": "20.0", "lon": "73.78", "display_name": "Nashik"}]):
        resp_search = client.get("/api/location/search?q=Nashik")
        assert resp_search.status_code == 200


def test_public_diagnosis_endpoint_accessible():
    """Diagnosis endpoint should be accessible without credentials."""
    dummy_image = io.BytesIO(b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xFF\xDB\x00C\x00")
    response = client.post(
        "/api/diagnose",
        files={"file": ("potato_leaf.jpg", dummy_image, "image/jpeg")}
    )
    assert response.status_code == 200
    assert "crop" in response.json()
    assert "treatment" in response.json()


def test_public_translate_endpoint_accessible():
    """Translate endpoint should be accessible without credentials."""
    response = client.post(
        "/api/translate",
        json={"text": "Tomato", "targetLanguage": "mr"}
    )
    assert response.status_code == 200
    assert "translatedText" in response.json()


# ============================================================================
# 4. INFORMATION DISCLOSURE PREVENTION
# ============================================================================

def test_global_exception_handler_sanitizes_internal_errors():
    """
    Verify that unhandled server exceptions do not leak stack traces or raw exception details.
    """
    with patch("routes.schemes.schemes_service.get_schemes", side_effect=RuntimeError("Secret database connection failed at /var/secrets/db.key")):
        response = client.get("/api/schemes")
        assert response.status_code == 500
        data = response.json()
        assert "Secret database connection failed" not in str(data)
        assert "/var/secrets" not in str(data)
        assert "error" not in data  # Ensure no raw 'error' key is exposed
        assert data["detail"] == "Failed to query government schemes."
