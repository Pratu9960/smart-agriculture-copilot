import json
import logging
from unittest.mock import MagicMock, patch
import pytest

import firebase_admin
from config.settings import settings
from services.base_firebase import (
    FirestoreFirebaseService,
    MockFirebaseService,
    _get_firestore_client,
    get_firebase_service,
    initialize_firebase_admin,
)


@pytest.fixture(autouse=True)
def reset_firebase_apps():
    """Ensure firebase_admin._apps is clean before and after each test."""
    original_apps = dict(firebase_admin._apps)
    firebase_admin._apps.clear()
    yield
    firebase_admin._apps.clear()
    firebase_admin._apps.update(original_apps)


SAMPLE_SERVICE_ACCOUNT = {
    "type": "service_account",
    "project_id": "test-ag-project",
    "private_key_id": "key123",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk@test-ag-project.iam.gserviceaccount.com",
    "client_id": "123456789",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
}


# ============================================================================
# 1. FIREBASE SERVICE ACCOUNT JSON INITIALIZATION
# ============================================================================

def test_firebase_init_with_service_account_json():
    """Requirement B1 & G1: Initialize using FIREBASE_SERVICE_ACCOUNT_JSON parsed via json.loads()."""
    json_str = json.dumps(SAMPLE_SERVICE_ACCOUNT)

    with patch.object(settings, "FIREBASE_SERVICE_ACCOUNT_JSON", json_str), \
         patch.object(settings, "FIREBASE_CREDENTIALS_PATH", ""), \
         patch.object(settings, "ENVIRONMENT", "production"), \
         patch("firebase_admin.credentials.Certificate") as mock_cert, \
         patch("firebase_admin.initialize_app") as mock_init:

        dummy_cert = MagicMock()
        mock_cert.return_value = dummy_cert

        result = initialize_firebase_admin()

        assert result is True
        mock_cert.assert_called_once_with(SAMPLE_SERVICE_ACCOUNT)
        mock_init.assert_called_once_with(
            dummy_cert,
            {"projectId": "test-ag-project"}
        )


def test_firebase_init_priority_json_over_path():
    """Requirement B: FIREBASE_SERVICE_ACCOUNT_JSON takes priority over FIREBASE_CREDENTIALS_PATH."""
    json_str = json.dumps(SAMPLE_SERVICE_ACCOUNT)

    with patch.object(settings, "FIREBASE_SERVICE_ACCOUNT_JSON", json_str), \
         patch.object(settings, "FIREBASE_CREDENTIALS_PATH", "relative/path/to/creds.json"), \
         patch.object(settings, "ENVIRONMENT", "production"), \
         patch("firebase_admin.credentials.Certificate") as mock_cert, \
         patch("firebase_admin.initialize_app") as mock_init:

        dummy_cert = MagicMock()
        mock_cert.return_value = dummy_cert

        result = initialize_firebase_admin()

        assert result is True
        # Must be called with dict (service account json), NOT string (file path)
        mock_cert.assert_called_once_with(SAMPLE_SERVICE_ACCOUNT)
        mock_init.assert_called_once()


# ============================================================================
# 2. LOCAL CREDENTIALS PATH INITIALIZATION
# ============================================================================

def test_firebase_init_with_local_credentials_path():
    """Requirement B2 & G2: Initialize using FIREBASE_CREDENTIALS_PATH resolved relative to backend."""
    rel_path = "config/service_account.json"

    with patch.object(settings, "FIREBASE_SERVICE_ACCOUNT_JSON", ""), \
         patch.object(settings, "FIREBASE_CREDENTIALS_PATH", rel_path), \
         patch.object(settings, "ENVIRONMENT", "development"), \
         patch("os.path.isfile", return_value=True), \
         patch("firebase_admin.credentials.Certificate") as mock_cert, \
         patch("firebase_admin.initialize_app") as mock_init:

        dummy_cert = MagicMock()
        mock_cert.return_value = dummy_cert

        result = initialize_firebase_admin()

        assert result is True
        assert mock_cert.call_count == 1
        called_path = mock_cert.call_args[0][0]
        assert called_path.endswith("service_account.json")
        assert "backend" in called_path
        mock_init.assert_called_once_with(
            dummy_cert,
            {"projectId": "smart-agriculture-copilot"}
        )


def test_firebase_init_with_missing_credentials_file_raises():
    """Requirement B2 & G2: Missing local credentials file raises FileNotFoundError."""
    with patch.object(settings, "FIREBASE_SERVICE_ACCOUNT_JSON", ""), \
         patch.object(settings, "FIREBASE_CREDENTIALS_PATH", "missing_creds.json"), \
         patch.object(settings, "ENVIRONMENT", "development"), \
         patch("os.path.isfile", return_value=False):

        with pytest.raises(FileNotFoundError) as exc_info:
            initialize_firebase_admin()

        assert "Firebase credentials file not found" in str(exc_info.value)


# ============================================================================
# 3. DEVELOPMENT FALLBACK TO MOCK FIREBASE SERVICE
# ============================================================================

def test_firebase_dev_fallback_when_no_credentials():
    """Requirement B3 & G3: In development, missing credentials falls back to MockFirebaseService."""
    with patch.object(settings, "FIREBASE_SERVICE_ACCOUNT_JSON", ""), \
         patch.object(settings, "FIREBASE_CREDENTIALS_PATH", ""), \
         patch.object(settings, "ENVIRONMENT", "development"):

        assert initialize_firebase_admin() is False

        service = get_firebase_service()
        assert isinstance(service, MockFirebaseService)


def test_firebase_dev_fallback_when_credentials_invalid():
    """Requirement B3 & G3: In development, failed Firestore initialization falls back to MockFirebaseService."""
    with patch.object(settings, "FIREBASE_SERVICE_ACCOUNT_JSON", "invalid-json-string"), \
         patch.object(settings, "FIREBASE_CREDENTIALS_PATH", ""), \
         patch.object(settings, "ENVIRONMENT", "development"):

        service = get_firebase_service()
        assert isinstance(service, MockFirebaseService)


# ============================================================================
# 4. PRODUCTION SAFITY: MUST NOT SILENTLY USE MOCK SERVICE
# ============================================================================

def test_firebase_production_raises_when_credentials_missing():
    """Requirement B3, C, G4: In production, missing credentials must raise RuntimeError and NOT return MockFirebaseService."""
    with patch.object(settings, "FIREBASE_SERVICE_ACCOUNT_JSON", ""), \
         patch.object(settings, "FIREBASE_CREDENTIALS_PATH", ""), \
         patch.object(settings, "ENVIRONMENT", "production"):

        with pytest.raises(RuntimeError) as init_exc:
            initialize_firebase_admin()
        assert "Firebase credentials are required in production" in str(init_exc.value)

        with pytest.raises(RuntimeError) as svc_exc:
            get_firebase_service()
        assert "Failed to initialize Firebase in production" in str(svc_exc.value)


def test_firebase_production_raises_when_credentials_invalid():
    """Requirement B3, C, G4: In production, invalid credentials must raise RuntimeError and NOT return MockFirebaseService."""
    with patch.object(settings, "FIREBASE_SERVICE_ACCOUNT_JSON", "invalid-json-content"), \
         patch.object(settings, "FIREBASE_CREDENTIALS_PATH", ""), \
         patch.object(settings, "ENVIRONMENT", "production"):

        with pytest.raises(ValueError):
            initialize_firebase_admin()

        with pytest.raises(RuntimeError) as svc_exc:
            get_firebase_service()
        assert "Failed to initialize Firebase in production" in str(svc_exc.value)


def test_firebase_production_succeeds_when_credentials_valid():
    """Requirement C: In production, valid credentials successfully returns FirestoreFirebaseService."""
    json_str = json.dumps(SAMPLE_SERVICE_ACCOUNT)

    with patch.object(settings, "FIREBASE_SERVICE_ACCOUNT_JSON", json_str), \
         patch.object(settings, "FIREBASE_CREDENTIALS_PATH", ""), \
         patch.object(settings, "ENVIRONMENT", "production"), \
         patch("firebase_admin.credentials.Certificate"), \
         patch("firebase_admin.initialize_app"), \
         patch("firebase_admin.firestore.client") as mock_client:

        mock_client.return_value = MagicMock()
        service = get_firebase_service()

        assert isinstance(service, FirestoreFirebaseService)


# ============================================================================
# 5. SAFE VALIDATION OF FIREBASE_SERVICE_ACCOUNT_JSON (NO SECRET LEAKS)
# ============================================================================

def test_firebase_invalid_json_handled_safely_no_secrets_leaked(caplog):
    """Requirement E & G5: Invalid JSON logs clear error without exposing secret content."""
    secret_key_marker = "SUPER_SECRET_PRIVATE_KEY_VALUE_XYZ"
    malformed_json_with_secret = f'{{"private_key": "{secret_key_marker}", "broken_json": '

    with patch.object(settings, "FIREBASE_SERVICE_ACCOUNT_JSON", malformed_json_with_secret), \
         patch.object(settings, "FIREBASE_CREDENTIALS_PATH", ""), \
         patch.object(settings, "ENVIRONMENT", "development"):

        with caplog.at_level(logging.DEBUG):
            with pytest.raises(ValueError) as exc_info:
                initialize_firebase_admin()

            assert "Invalid FIREBASE_SERVICE_ACCOUNT_JSON" in str(exc_info.value)

            # Ensure the secret marker was NEVER written into the logs
            assert secret_key_marker not in caplog.text
            assert "Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: invalid JSON format." in caplog.text


def test_firebase_non_dict_json_handled_safely():
    """Requirement E & G5: Non-dict JSON (e.g. array or integer) is safely rejected."""
    with patch.object(settings, "FIREBASE_SERVICE_ACCOUNT_JSON", "[\"not\", \"a\", \"dict\"]"), \
         patch.object(settings, "FIREBASE_CREDENTIALS_PATH", ""), \
         patch.object(settings, "ENVIRONMENT", "development"):

        with pytest.raises(ValueError) as exc_info:
            initialize_firebase_admin()

        assert "must be a valid JSON object" in str(exc_info.value)


# ============================================================================
# 6. IDEMPOTENCY & CLIENT INITIALIZATION
# ============================================================================

def test_firebase_init_already_initialized_returns_true():
    """initialize_firebase_admin is idempotent when apps already exist."""
    firebase_admin._apps["[DEFAULT]"] = MagicMock()

    result = initialize_firebase_admin()
    assert result is True


def test_get_firestore_client_fails_if_init_returns_false():
    """_get_firestore_client raises RuntimeError when initialize_firebase_admin returns False."""
    with patch("services.base_firebase.initialize_firebase_admin", return_value=False):
        with pytest.raises(RuntimeError) as exc_info:
            _get_firestore_client()
        assert "Firebase Admin SDK is not initialized" in str(exc_info.value)
