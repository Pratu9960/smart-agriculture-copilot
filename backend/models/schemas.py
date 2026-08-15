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


class WeatherForecastDay(BaseModel):
    date: str
    temperatureMax: Optional[float] = None
    temperatureMin: Optional[float] = None
    precipitation: Optional[float] = None
    rainProbability: Optional[float] = None
    condition: str
    icon: str


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
    feelsLike: Optional[float] = None
    windDirection: Optional[float] = None
    cloudCover: Optional[float] = None
    visibility: Optional[float] = None
    pressure: Optional[float] = None
    precipitation: Optional[float] = None
    forecast: List[WeatherForecastDay] = Field(default_factory=list)
    isDevMockPayload: Optional[bool] = False

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


# --- Market Prices Schemas ---
class CropMetadataItem(BaseModel):
    id: str
    name: str
    category: str
    accentColor: str
    iconKey: str
    defaultVariety: Optional[str] = "Standard"
    unit: Optional[str] = "₹ / Quintal"


class MarketPriceRecord(BaseModel):
    commodity: str
    variety: Optional[str] = "Standard"
    state: str
    district: str
    market: str
    arrivalDate: str
    minPrice: float
    maxPrice: float
    modalPrice: float
    unit: str = "₹ / Quintal"
    source: str = "Government of India — Data.gov.in / AGMARKNET"


class MarketComparisonItem(BaseModel):
    market: str
    district: str
    state: str
    modalPrice: float
    minPrice: float
    maxPrice: float
    variety: str
    arrivalDate: str
    relation: str  # 'selected', 'same_district', 'nearby_district', 'same_state'


class MarketPriceLatestResponse(BaseModel):
    commodity: str
    selectedMarket: Optional[MarketPriceRecord] = None
    nearbyMarkets: List[MarketComparisonItem] = Field(default_factory=list)
    stateAverageModal: Optional[float] = None
    timestamp: str
    source: str = "Government of India — Data.gov.in / AGMARKNET"
    isRealData: bool = True
    isDevFallback: bool = False


class MarketPriceHistoryPoint(BaseModel):
    date: str
    modalPrice: float
    minPrice: float
    maxPrice: float
    market: str
    variety: str


class MarketPriceHistoryResponse(BaseModel):
    commodity: str
    market: str
    district: str
    state: str
    variety: str
    period: str
    records: List[MarketPriceHistoryPoint] = Field(default_factory=list)
    latestModal: Optional[float] = None
    periodHigh: Optional[float] = None
    periodLow: Optional[float] = None
    netChange: Optional[float] = None
    percentageChange: Optional[float] = None
    trend: str  # 'Increasing', 'Stable', 'Decreasing', 'Insufficient data'
    trendSummary: str
    whatChartShows: str
    unit: str = "₹ / Quintal"
    latestDataDate: Optional[str] = None
    source: str = "Government of India — Data.gov.in / AGMARKNET"
    isRealData: bool = True


class LocationHierarchyItem(BaseModel):
    state: str
    districts: Dict[str, List[str]]  # District Name -> List of Markets/APMCs


# --- Government Schemes Schemas ---
class SchemeCategoryItem(BaseModel):
    id: str
    name: str
    count: int
    icon: str


class GovernmentSchemeItem(BaseModel):
    id: str
    name: str
    shortName: str
    category: str
    level: str  # 'Central' or 'State'
    state: str  # 'All India' or specific state (e.g. 'Maharashtra')
    description: str
    benefits: List[str]
    eligibility: List[str]
    documentsRequired: List[str]
    applicationProcess: List[str]
    officialUrl: str
    lastVerified: str
    icon: str
    applicableCrops: List[str] = Field(default_factory=list)
    farmTypes: List[str] = Field(default_factory=list)
    maxSubsidyAmount: Optional[str] = None


class SchemeEligibilityCheckRequest(BaseModel):
    answers: Dict[str, Any]


class SchemeEligibilityCheckResponse(BaseModel):
    schemeId: str
    eligible: bool
    statusText: str
    matchedCriteria: List[str]
    unmatchedCriteria: List[str]
    recommendation: str
    officialUrl: str

