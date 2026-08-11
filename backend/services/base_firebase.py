from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import time
from config.settings import settings
from models.schemas import ScanRecordItem, SaveHistoryResponse, SyncResponse

class BaseFirebaseService(ABC):
    """
    Abstract interface for Scan History & Synchronization with Cloud Firestore.
    """
    @abstractmethod
    async def get_history(self, user_id: Optional[str] = None) -> List[ScanRecordItem]:
        pass

    @abstractmethod
    async def save_history(self, record: ScanRecordItem) -> SaveHistoryResponse:
        pass

    @abstractmethod
    async def sync_records(self, records: List[Dict[str, Any]]) -> SyncResponse:
        pass

class MockFirebaseService(BaseFirebaseService):
    """
    Development Mock Firebase service storing scan history in memory.
    """
    def __init__(self):
        self._history_db: List[ScanRecordItem] = [
            ScanRecordItem(
                id="scan_001",
                crop="Tomato",
                disease="Early Blight",
                confidence=0.94,
                date="2026-08-10 14:30",
                syncStatus="SYNCED",
                imagePreview=None,
                symptoms=["Concentric dark rings on leaves"],
                treatment="Apply copper oxychloride spray."
            ),
            ScanRecordItem(
                id="scan_002",
                crop="Potato",
                disease="Late Blight",
                confidence=0.88,
                date="2026-08-09 09:15",
                syncStatus="SYNCED",
                imagePreview=None,
                symptoms=["Water-soaked dark lesions on leaf tips"],
                treatment="Apply systemic fungicide (Metalaxyl + Mancozeb)."
            )
        ]

    async def get_history(self, user_id: Optional[str] = None) -> List[ScanRecordItem]:
        return self._history_db

    async def save_history(self, record: ScanRecordItem) -> SaveHistoryResponse:
        if not record.id:
            record.id = f"scan_{int(time.time())}"
        if not record.date:
            record.date = time.strftime("%Y-%m-%d %H:%M")
        record.syncStatus = "SYNCED"

        self._history_db.insert(0, record)
        return SaveHistoryResponse(
            success=True,
            record=record,
            isLocalDevMock=True
        )

    async def sync_records(self, records: List[Dict[str, Any]]) -> SyncResponse:
        synced_count = 0
        for rec in records:
            item = ScanRecordItem(
                id=rec.get("id") or f"sync_{int(time.time())}_{synced_count}",
                crop=rec.get("crop", "Unknown Crop"),
                disease=rec.get("disease", "Unknown Disease"),
                confidence=float(rec.get("confidence", 1.0)),
                date=rec.get("date") or time.strftime("%Y-%m-%d %H:%M"),
                syncStatus="SYNCED",
                symptoms=rec.get("symptoms", []),
                treatment=rec.get("treatment", "")
            )
            self._history_db.insert(0, item)
            synced_count += 1

        return SyncResponse(
            success=True,
            syncedCount=synced_count,
            isDevMock=True
        )

def get_firebase_service() -> BaseFirebaseService:
    """
    Factory function for Firebase Service.
    If FIREBASE_CREDENTIALS_PATH is empty/missing, uses MockFirebaseService.
    """
    if not settings.FIREBASE_CREDENTIALS_PATH or not settings.FIREBASE_CREDENTIALS_PATH.strip():
        return MockFirebaseService()
    return MockFirebaseService()
