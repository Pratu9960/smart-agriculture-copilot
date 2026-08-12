import io
import json
import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from fastapi.testclient import TestClient

from main import app
from services.base_gemini import RealGeminiService, MockGeminiService, get_gemini_service
from config.settings import settings

client = TestClient(app)

@pytest.mark.asyncio
async def test_real_gemini_valid_structured_response():
    fake_response = MagicMock()
    fake_response.text = json.dumps({
        "crop": "Tomato",
        "disease": "Early Blight",
        "confidence": 0.96
    })

    service = RealGeminiService(api_key="test_fake_key")
    service.client.aio.models.generate_content = AsyncMock(return_value=fake_response)

    result = await service.diagnose_crop(b"fake_image_bytes", "leaf.jpg")
    assert result["crop"] == "Tomato"
    assert result["disease"] == "Early Blight"
    assert result["confidence"] == 0.96

@pytest.mark.asyncio
async def test_real_gemini_malformed_json():
    fake_response = MagicMock()
    fake_response.text = "NOT_A_JSON_STRING"

    service = RealGeminiService(api_key="test_fake_key")
    service.client.aio.models.generate_content = AsyncMock(return_value=fake_response)

    with pytest.raises(ValueError) as exc_info:
        await service.diagnose_crop(b"fake_image_bytes", "leaf.jpg")
    assert "invalid non-JSON" in str(exc_info.value)

@pytest.mark.asyncio
async def test_real_gemini_missing_crop():
    fake_response = MagicMock()
    fake_response.text = json.dumps({
        "disease": "Early Blight",
        "confidence": 0.90
    })

    service = RealGeminiService(api_key="test_fake_key")
    service.client.aio.models.generate_content = AsyncMock(return_value=fake_response)

    with pytest.raises(ValueError) as exc_info:
        await service.diagnose_crop(b"fake_image_bytes", "leaf.jpg")
    assert "missing valid 'crop'" in str(exc_info.value)

@pytest.mark.asyncio
async def test_real_gemini_missing_disease():
    fake_response = MagicMock()
    fake_response.text = json.dumps({
        "crop": "Tomato",
        "confidence": 0.90
    })

    service = RealGeminiService(api_key="test_fake_key")
    service.client.aio.models.generate_content = AsyncMock(return_value=fake_response)

    with pytest.raises(ValueError) as exc_info:
        await service.diagnose_crop(b"fake_image_bytes", "leaf.jpg")
    assert "missing valid 'disease'" in str(exc_info.value)

@pytest.mark.asyncio
async def test_real_gemini_invalid_confidence():
    fake_response = MagicMock()
    fake_response.text = json.dumps({
        "crop": "Tomato",
        "disease": "Early Blight",
        "confidence": 2.5  # Invalid > 1.0
    })

    service = RealGeminiService(api_key="test_fake_key")
    service.client.aio.models.generate_content = AsyncMock(return_value=fake_response)

    with pytest.raises(ValueError) as exc_info:
        await service.diagnose_crop(b"fake_image_bytes", "leaf.jpg")
    assert "invalid 'confidence'" in str(exc_info.value)

@pytest.mark.asyncio
async def test_real_gemini_api_error():
    service = RealGeminiService(api_key="test_fake_key")
    service.client.aio.models.generate_content = AsyncMock(side_effect=Exception("API Connection Error"))

    with pytest.raises(RuntimeError) as exc_info:
        await service.diagnose_crop(b"fake_image_bytes", "leaf.jpg")
    assert "Gemini API request failed" in str(exc_info.value)

@pytest.mark.asyncio
async def test_real_gemini_timeout():
    import asyncio
    service = RealGeminiService(api_key="test_fake_key")
    service.client.aio.models.generate_content = AsyncMock(side_effect=TimeoutError("Request Timed Out"))

    with pytest.raises(RuntimeError) as exc_info:
        await service.diagnose_crop(b"fake_image_bytes", "leaf.jpg")
    assert "Gemini API request failed" in str(exc_info.value)


def test_get_gemini_service_missing_api_key():
    with patch.object(settings, "GEMINI_API_KEY", ""):
        service = get_gemini_service()
        assert isinstance(service, MockGeminiService)

def test_full_diagnosis_route_with_real_gemini_integration():
    fake_response = MagicMock()
    fake_response.text = json.dumps({
        "crop": "Potato",
        "disease": "Late Blight",
        "confidence": 0.92
    })

    with patch.object(settings, "GEMINI_API_KEY", "real_test_key"):
        with patch("google.genai.Client") as mock_genai_client:
            mock_instance = MagicMock()
            mock_instance.aio.models.generate_content = AsyncMock(return_value=fake_response)
            mock_genai_client.return_value = mock_instance

            fake_image_bytes = b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00\x60\x60\x00\x00"
            files = {"file": ("potato_leaf.jpg", io.BytesIO(fake_image_bytes), "image/jpeg")}
            
            response = client.post("/api/diagnose", files=files)
            assert response.status_code == 200
            data = response.json()
            assert data["crop"] == "Potato"
            assert data["disease"] == "Late Blight"
            assert data["confidence"] == 0.92
            assert data["isDevMockPayload"] is False  # Verified real Gemini service sets isDevMockPayload=False
            # Verify KnowledgeService provided recommendations from knowledge base
            assert data["severity"] == "High"
            assert "symptoms" in data
            assert len(data["symptoms"]) > 0
            assert "pesticides" in data

def test_diagnosis_route_api_failure_returns_503():
    with patch.object(settings, "GEMINI_API_KEY", "real_test_key"):
        with patch("google.genai.Client") as mock_genai_client:
            mock_instance = MagicMock()
            mock_instance.aio.models.generate_content = AsyncMock(side_effect=Exception("API Connection Failure"))
            mock_genai_client.return_value = mock_instance

            fake_image_bytes = b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00\x60\x60\x00\x00"
            files = {"file": ("leaf.jpg", io.BytesIO(fake_image_bytes), "image/jpeg")}
            
            response = client.post("/api/diagnose", files=files)
            assert response.status_code == 503
            data = response.json()
            assert "detail" in data
            assert "temporarily unavailable" in data["detail"]

