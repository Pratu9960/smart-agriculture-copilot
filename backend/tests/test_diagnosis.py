import io
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_diagnose_valid_image():
    # Simulate valid JPEG upload
    fake_image_bytes = b"\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00\x60\x60\x00\x00"
    files = {"file": ("leaf.jpg", io.BytesIO(fake_image_bytes), "image/jpeg")}
    
    response = client.post("/api/diagnose", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["crop"] == "Tomato"
    assert data["disease"] == "Early Blight"
    assert "symptoms" in data
    assert "treatment" in data
    assert "pesticides" in data
    assert data["isDevMockPayload"] is True

def test_diagnose_non_image_file():
    files = {"file": ("notes.txt", io.BytesIO(b"Hello world"), "text/plain")}
    response = client.post("/api/diagnose", files=files)
    assert response.status_code == 400
    assert "Uploaded file must be an image" in response.json()["detail"]

def test_diagnose_empty_file():
    files = {"file": ("empty.png", io.BytesIO(b""), "image/png")}
    response = client.post("/api/diagnose", files=files)
    assert response.status_code == 400
    assert "Uploaded file is empty" in response.json()["detail"]
