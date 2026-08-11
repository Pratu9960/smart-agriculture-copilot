from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_translate_text_marathi():
    payload = {
        "text": "What disease is affecting my crop?",
        "target_language": "mr"
    }
    response = client.post("/api/translate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "translatedText" in data
    assert data["translatedText"] == "माझ्या पिकावर कोणता रोग झाला आहे?"

def test_translate_text_hindi():
    payload = {
        "text": "What disease is affecting my crop?",
        "target_language": "hi"
    }
    response = client.post("/api/translate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "translatedText" in data
    assert data["translatedText"] == "मेरी फसल में कौन सा रोग लगा है?"
