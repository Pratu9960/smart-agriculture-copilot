import io
import json
import pytest
import tempfile
import os
from unittest.mock import MagicMock, AsyncMock, patch
from fastapi.testclient import TestClient

from main import app
from services.crop_knowledge_service import CropKnowledgeService, get_crop_knowledge_service
from services.base_gemini import RealGeminiService
from config.settings import settings

client = TestClient(app)


# -------------------------------------------------------------
# 1. Exact Match: Soybean + Soybean Rust
# -------------------------------------------------------------
def test_exact_match_soybean_rust():
    svc = get_crop_knowledge_service()
    res = svc.get_knowledge_record("Soybean", "Soybean Rust")
    assert res is not None
    record, match_type = res
    assert record["crop"] == "Soybean"
    assert record["disease"] == "Soybean Rust"
    assert match_type in ("exact", "normalized")
    assert record["severity"] == "Severe"
    assert len(record["pesticides"]) > 0


# -------------------------------------------------------------
# 2. Alias Crop Match: Soyabean + Soybean Rust
# -------------------------------------------------------------
def test_alias_crop_match_soyabean():
    svc = get_crop_knowledge_service()
    res = svc.get_knowledge_record("Soyabean", "Soybean Rust")
    assert res is not None
    record, match_type = res
    assert record["crop"] == "Soybean"
    assert record["disease"] == "Soybean Rust"
    assert match_type == "alias"


# -------------------------------------------------------------
# 3. Alias Crop Match: Jowar + Downy Mildew (DB crop is Sorghum (Jowar))
# -------------------------------------------------------------
def test_alias_crop_match_jowar_downy_mildew():
    svc = get_crop_knowledge_service()
    res = svc.get_knowledge_record("Jowar", "Downy Mildew")
    assert res is not None
    record, match_type = res
    assert record["crop"] == "Sorghum (Jowar)"
    assert record["disease"] == "Downy Mildew"
    assert match_type == "alias"


# -------------------------------------------------------------
# 4. Alias Crop Match: Bajra + Downy Mildew (DB crop is Pearl Millet (Bajra))
# -------------------------------------------------------------
def test_alias_crop_match_bajra_downy_mildew():
    svc = get_crop_knowledge_service()
    res = svc.get_knowledge_record("Bajra", "Downy Mildew")
    assert res is not None
    record, match_type = res
    assert record["crop"] == "Pearl Millet (Bajra)"
    assert "Downy Mildew" in record["disease"]
    assert match_type == "alias"


# -------------------------------------------------------------
# 5. Exact Disease Match: Rice + Rice Blast
# -------------------------------------------------------------
def test_exact_match_rice_blast():
    svc = get_crop_knowledge_service()
    res = svc.get_knowledge_record("Rice", "Rice Blast")
    assert res is not None
    record, match_type = res
    assert record["crop"] == "Rice"
    assert record["disease"] == "Rice Blast"
    assert match_type in ("exact", "normalized")


# -------------------------------------------------------------
# 6. Unknown Disease: ensure knowledgeMatch is false, pesticides is []
# -------------------------------------------------------------
def test_unknown_disease_fallback():
    svc = get_crop_knowledge_service()
    res = svc.get_knowledge_record("Tomato", "NonExistentUnknownBlight999")
    assert res is None

    fake_image_bytes = b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00\x60\x60\x00\x00"
    files = {"file": ("unknown_disease.jpg", io.BytesIO(fake_image_bytes), "image/jpeg")}

    fake_response = MagicMock()
    fake_response.text = json.dumps({
        "crop": "Tomato",
        "disease": "NonExistentUnknownBlight999",
        "confidence": 0.85
    })

    with patch.object(settings, "GEMINI_API_KEY", "real_test_key"):
        with patch("google.genai.Client") as mock_genai_client:
            mock_instance = MagicMock()
            mock_instance.aio.models.generate_content = AsyncMock(return_value=fake_response)
            mock_genai_client.return_value = mock_instance

            response = client.post("/api/diagnose", files=files)
            assert response.status_code == 200
            data = response.json()
            assert data["crop"] == "Tomato"
            assert data["disease"] == "NonExistentUnknownBlight999"
            assert data["knowledgeMatch"] is False
            assert data["knowledgeMatchType"] is None
            assert data["severity"] is None
            assert data["pesticides"] == []
            assert data["recommendationsVerified"] is False
            assert "Detailed verified guidance" in data["treatment"]


# -------------------------------------------------------------
# 7. Healthy Crop Fallback
# -------------------------------------------------------------
def test_healthy_crop_fallback():
    svc = get_crop_knowledge_service()
    res = svc.get_knowledge_record("Soybean", "Healthy")
    assert res is None  # Soybean has no distinct disease named Healthy

    healthy_payload = svc.get_healthy_fallback()
    assert healthy_payload["severity"] == "None"
    assert healthy_payload["pesticides"] == []
    assert healthy_payload["knowledgeMatch"] is False
    assert "No disease treatment is indicated" in healthy_payload["treatment"]

    fake_image_bytes = b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00\x60\x60\x00\x00"
    files = {"file": ("healthy_soybean.jpg", io.BytesIO(fake_image_bytes), "image/jpeg")}

    fake_response = MagicMock()
    fake_response.text = json.dumps({
        "crop": "Soybean",
        "disease": "Healthy",
        "confidence": 0.99
    })

    with patch.object(settings, "GEMINI_API_KEY", "real_test_key"):
        with patch("google.genai.Client") as mock_genai_client:
            mock_instance = MagicMock()
            mock_instance.aio.models.generate_content = AsyncMock(return_value=fake_response)
            mock_genai_client.return_value = mock_instance

            response = client.post("/api/diagnose", files=files)
            assert response.status_code == 200
            data = response.json()
            assert data["crop"] == "Soybean"
            assert data["disease"] == "Healthy"
            assert data["severity"] == "None"
            assert data["pesticides"] == []
            assert data["knowledgeMatch"] is False
            assert "No disease treatment is indicated" in data["treatment"]


# -------------------------------------------------------------
# 8. Invalid/Corrupted Database File: fail safely with clear error
# -------------------------------------------------------------
def test_corrupted_database_file_fails_safely():
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as tmp_corrupt:
        tmp_corrupt.write("INVALID_JSON_CORRUPTED{")
        tmp_corrupt_path = tmp_corrupt.name

    try:
        with pytest.raises(ValueError) as exc_info:
            CropKnowledgeService(database_path=tmp_corrupt_path)
        assert "Corrupted or invalid JSON" in str(exc_info.value)
    finally:
        if os.path.exists(tmp_corrupt_path):
            os.remove(tmp_corrupt_path)


# -------------------------------------------------------------
# 9. Gemini Service Output Validation: confidence, crop, disease
# -------------------------------------------------------------
@pytest.mark.asyncio
async def test_gemini_output_validation():
    service = RealGeminiService(api_key="test_fake_key")

    # Invalid confidence > 1.0
    fake_resp_conf = MagicMock()
    fake_resp_conf.text = json.dumps({"crop": "Tomato", "disease": "Early Blight", "confidence": 1.5})
    service.client.aio.models.generate_content = AsyncMock(return_value=fake_resp_conf)
    with pytest.raises(ValueError) as exc:
        await service.diagnose_crop(b"fake", "test.jpg")
    assert "confidence" in str(exc.value).lower()

    # Missing crop
    fake_resp_crop = MagicMock()
    fake_resp_crop.text = json.dumps({"disease": "Early Blight", "confidence": 0.9})
    service.client.aio.models.generate_content = AsyncMock(return_value=fake_resp_crop)
    with pytest.raises(ValueError) as exc:
        await service.diagnose_crop(b"fake", "test.jpg")
    assert "crop" in str(exc.value).lower()

    # Missing disease
    fake_resp_dis = MagicMock()
    fake_resp_dis.text = json.dumps({"crop": "Tomato", "confidence": 0.9})
    service.client.aio.models.generate_content = AsyncMock(return_value=fake_resp_dis)
    with pytest.raises(ValueError) as exc:
        await service.diagnose_crop(b"fake", "test.jpg")
    assert "disease" in str(exc.value).lower()


# -------------------------------------------------------------
# 10. Full Endpoint Test: Mocked Gemini -> Normalization -> DB Lookup -> Enriched API
# -------------------------------------------------------------
def test_full_endpoint_enriched_diagnosis_flow():
    fake_response = MagicMock()
    fake_response.text = json.dumps({
        "crop": "Soyabean",  # Alias format
        "disease": "Soybean Rust",
        "confidence": 0.93
    })

    with patch.object(settings, "GEMINI_API_KEY", "real_test_key"):
        with patch("google.genai.Client") as mock_genai_client:
            mock_instance = MagicMock()
            mock_instance.aio.models.generate_content = AsyncMock(return_value=fake_response)
            mock_genai_client.return_value = mock_instance

            fake_image_bytes = b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00\x60\x60\x00\x00"
            files = {"file": ("soybean_leaf.jpg", io.BytesIO(fake_image_bytes), "image/jpeg")}

            response = client.post("/api/diagnose", files=files)
            assert response.status_code == 200
            data = response.json()

            assert data["crop"] == "Soyabean"
            assert data["disease"] == "Soybean Rust"
            assert data["confidence"] == 0.93
            assert data["severity"] == "Severe"
            assert data["knowledgeMatch"] is True
            assert data["knowledgeMatchType"] == "alias"
            assert data["recommendationsVerified"] is True
            assert data["mode"] == "online"
            assert len(data["symptoms"]) > 0
            assert len(data["pesticides"]) > 0
            assert len(data["sources"]) > 0
            assert data["isDevMockPayload"] is False
