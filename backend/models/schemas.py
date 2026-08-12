from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

# --- Diagnosis Schemas ---
class PesticideItem(BaseModel):
    name: str
    dosage: str

class DiagnosisResponse(BaseModel):
    id: str
    crop: str
    disease: str
    confidence: float
    severity: str
    timestamp: str
    symptoms: List[str]
    cause: str
    treatment: str
    pesticides: List[PesticideItem]
    fertilizer: str
    prevention: List[str]
    isDevMockPayload: Optional[bool] = False

# --- Weather Schemas ---
class IrrigationAdvisory(BaseModel):
    recommendation: str
    headline: str
    detail: str
    urgency: str

class WeatherResponse(BaseModel):
    location: str
    latitude: float
    longitude: float
    temperature: float
    humidity: float
    windSpeed: float
    condition: str
    icon: str
    rainProbability: float
    timestamp: str
    irrigationAdvisory: IrrigationAdvisory
    isDevMockPayload: Optional[bool] = True

# --- Scan History Schemas ---
class ScanRecordItem(BaseModel):
    id: Optional[str] = None
    crop: str
    disease: str
    confidence: Optional[float] = 1.0
    date: Optional[str] = None
    syncStatus: Optional[str] = "SYNCED"
    imagePreview: Optional[str] = None
    symptoms: Optional[List[str]] = []
    treatment: Optional[str] = ""

class SaveHistoryResponse(BaseModel):
    success: bool
    record: ScanRecordItem
    isLocalDevMock: Optional[bool] = True

# --- Translation Schemas ---
class TranslationRequest(BaseModel):
    text: str
    target_language: str = Field(..., alias="targetLanguage", description="Target language code (e.g. 'mr', 'hi')")
    source_language: Optional[str] = "en"

    model_config = ConfigDict(populate_by_name=True)

class TranslationResponse(BaseModel):
    translatedText: str
    isDevFallback: Optional[bool] = True

# --- Synchronization Schemas ---
class SyncRequest(BaseModel):
    records: List[Dict[str, Any]] = Field(default=[], alias="scans", description="Batch offline scan records")

    model_config = ConfigDict(populate_by_name=True)

class SyncResponse(BaseModel):
    success: bool
    syncedCount: int
    isDevMock: Optional[bool] = True

