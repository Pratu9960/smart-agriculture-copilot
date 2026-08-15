import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_get_scheme_categories():
    response = client.get("/api/schemes/categories")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5
    cat_ids = [c["id"] for c in data]
    assert "financial_support" in cat_ids
    assert "crop_insurance" in cat_ids
    assert "irrigation" in cat_ids


def test_get_schemes_all():
    response = client.get("/api/schemes")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 10
    ids = [s["id"] for s in data]
    assert "pm-kisan" in ids
    assert "pmfby" in ids


def test_get_schemes_filtered():
    response = client.get("/api/schemes", params={"category": "Crop Insurance"})
    assert response.status_code == 200
    data = response.json()
    assert all("insurance" in s["category"].lower() for s in data)


def test_get_scheme_details():
    response = client.get("/api/schemes/pm-kisan")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "pm-kisan"
    assert "PM-KISAN" in data["name"]
    assert len(data["benefits"]) > 0
    assert len(data["eligibility"]) > 0
    assert "pmkisan.gov.in" in data["officialUrl"]


def test_check_scheme_eligibility():
    response = client.post("/api/schemes/pm-kisan/check-eligibility", json={
        "answers": {
            "isLandowner": True,
            "hasAadhaar": True,
            "hasBankAccount": True,
            "isIncomeTaxPayer": False,
            "state": "Maharashtra"
        }
    })
    assert response.status_code == 200
    data = response.json()
    assert data["schemeId"] == "pm-kisan"
    assert data["eligible"] is True
    assert len(data["matchedCriteria"]) > 0
    assert len(data["unmatchedCriteria"]) == 0
