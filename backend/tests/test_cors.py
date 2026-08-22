import os
import json
import pytest
from fastapi.testclient import TestClient
from main import app
from config.settings import Settings, settings

client = TestClient(app)

def test_cors_preflight_allowed_origin():
    """Verify that an allowed origin receives correct CORS headers on OPTIONS preflight."""
    allowed_origin = settings.CORS_ORIGINS[0]
    response = client.options(
        "/api/health",
        headers={
            "Origin": allowed_origin,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization,content-type"
        }
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == allowed_origin
    assert response.headers.get("access-control-allow-credentials") == "true"


def test_cors_request_allowed_origin():
    """Verify that an allowed origin receives correct CORS headers on actual GET request."""
    allowed_origin = settings.CORS_ORIGINS[0]
    response = client.get(
        "/api/health",
        headers={"Origin": allowed_origin}
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == allowed_origin


def test_cors_disallowed_origin():
    """Verify that an unlisted origin does not receive access-control-allow-origin header."""
    untrusted_origin = "http://malicious-site.com"
    response = client.get(
        "/api/health",
        headers={"Origin": untrusted_origin}
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") is None


def test_settings_cors_origins_parsing():
    """Test that Settings correctly parses different CORS_ORIGINS string formats."""
    # Test comma-separated string
    s1 = Settings(CORS_ORIGINS="https://app.haritkranti.ai, https://haritkranti.ai, http://localhost:5500")
    assert s1.CORS_ORIGINS == [
        "https://app.haritkranti.ai",
        "https://haritkranti.ai",
        "http://localhost:5500"
    ]

    # Test JSON formatted array string
    json_origins = json.dumps(["https://prod.haritkranti.ai", "http://localhost:3000"])
    s2 = Settings(CORS_ORIGINS=json_origins)
    assert s2.CORS_ORIGINS == [
        "https://prod.haritkranti.ai",
        "http://localhost:3000"
    ]

    # Test list directly
    s3 = Settings(CORS_ORIGINS=["https://custom.domain.com"])
    assert s3.CORS_ORIGINS == ["https://custom.domain.com"]
