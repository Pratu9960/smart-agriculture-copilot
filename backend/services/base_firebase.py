from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import os
import time

import firebase_admin
from firebase_admin import credentials, firestore

from config.settings import settings
from models.schemas import (
    ScanRecordItem,
    SaveHistoryResponse,
    SyncResponse,
)


class BaseFirebaseService(ABC):
    """
    Abstract interface for Scan History & Synchronization with Cloud Firestore.
    """

    @abstractmethod
    async def get_history(
        self,
        user_id: Optional[str] = None
    ) -> List[ScanRecordItem]:
        pass

    @abstractmethod
    async def save_history(
        self,
        record: ScanRecordItem,
        user_id: Optional[str] = None
    ) -> SaveHistoryResponse:
        pass

    @abstractmethod
    async def sync_records(
        self,
        records: List[Dict[str, Any]],
        user_id: Optional[str] = None
    ) -> SyncResponse:
        pass


class MockFirebaseService(BaseFirebaseService):
    """
    Development fallback service.

    Used when Firebase credentials are not configured.
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
                treatment="Apply copper oxychloride spray.",
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
                treatment="Apply systemic fungicide (Metalaxyl + Mancozeb).",
            ),
        ]

    async def get_history(
        self,
        user_id: Optional[str] = None
    ) -> List[ScanRecordItem]:
        return self._history_db

    async def save_history(
        self,
        record: ScanRecordItem,
        user_id: Optional[str] = None
    ) -> SaveHistoryResponse:

        if not record.id:
            record.id = f"scan_{int(time.time() * 1000)}"

        if not record.date:
            record.date = time.strftime("%Y-%m-%d %H:%M")

        record.syncStatus = "SYNCED"

        self._history_db.insert(0, record)

        return SaveHistoryResponse(
            success=True,
            record=record,
            isLocalDevMock=True,
        )

    async def sync_records(
        self,
        records: List[Dict[str, Any]],
        user_id: Optional[str] = None
    ) -> SyncResponse:

        synced_count = 0

        for rec in records:
            item = ScanRecordItem(
                id=rec.get("id")
                or f"sync_{int(time.time())}_{synced_count}",
                crop=rec.get("crop", "Unknown Crop"),
                disease=rec.get("disease", "Unknown Disease"),
                confidence=float(rec.get("confidence", 1.0)),
                date=rec.get("date")
                or time.strftime("%Y-%m-%d %H:%M"),
                syncStatus="SYNCED",
                imagePreview=rec.get("imagePreview"),
                symptoms=rec.get("symptoms", []),
                treatment=rec.get("treatment", ""),
            )

            self._history_db.insert(0, item)
            synced_count += 1

        return SyncResponse(
            success=True,
            syncedCount=synced_count,
            isDevMock=True,
        )


class FirestoreFirebaseService(BaseFirebaseService):
    """
    Real Firebase Firestore implementation.

    Data structure:

        users/{user_id}/scans/{scan_id}
    """

    def __init__(self):
        self.db = _get_firestore_client()

    def _scans_collection(self, user_id: str):
        if not user_id:
            raise ValueError("A Firebase user ID is required.")

        return (
            self.db
            .collection("users")
            .document(user_id)
            .collection("scans")
        )

    async def get_history(
        self,
        user_id: Optional[str] = None
    ) -> List[ScanRecordItem]:

        if not user_id:
            raise ValueError("A Firebase user ID is required.")

        collection = self._scans_collection(user_id)

        docs = (
            collection
            .order_by(
                "createdAt",
                direction=firestore.Query.DESCENDING
            )
            .stream()
        )

        records: List[ScanRecordItem] = []

        for doc in docs:
            data = doc.to_dict() or {}

            data["id"] = data.get("id") or doc.id
            data["syncStatus"] = data.get("syncStatus", "SYNCED")

            # Firestore-only field; don't pass it to Pydantic.
            data.pop("createdAt", None)

            records.append(
                ScanRecordItem(**data)
            )

        return records

    async def save_history(
        self,
        record: ScanRecordItem,
        user_id: Optional[str] = None
    ) -> SaveHistoryResponse:

        if not user_id:
            raise ValueError("A Firebase user ID is required.")

        if not record.id:
            record.id = f"scan_{int(time.time() * 1000)}"

        if not record.date:
            record.date = time.strftime("%Y-%m-%d %H:%M")

        record.syncStatus = "SYNCED"

        collection = self._scans_collection(user_id)
        document = collection.document(record.id)

        data = record.model_dump()
        data["createdAt"] = firestore.SERVER_TIMESTAMP

        document.set(data, merge=True)

        return SaveHistoryResponse(
            success=True,
            record=record,
            isLocalDevMock=False,
        )

    async def sync_records(
        self,
        records: List[Dict[str, Any]],
        user_id: Optional[str] = None
    ) -> SyncResponse:

        if not user_id:
            raise ValueError("A Firebase user ID is required.")

        collection = self._scans_collection(user_id)

        synced_count = 0

        for rec in records:
            scan_id = (
                rec.get("id")
                or f"sync_{int(time.time() * 1000)}_{synced_count}"
            )

            item = ScanRecordItem(
                id=scan_id,
                crop=rec.get("crop", "Unknown Crop"),
                disease=rec.get("disease", "Unknown Disease"),
                confidence=float(rec.get("confidence", 1.0)),
                date=rec.get("date")
                or time.strftime("%Y-%m-%d %H:%M"),
                syncStatus="SYNCED",
                imagePreview=rec.get("imagePreview"),
                symptoms=rec.get("symptoms", []),
                treatment=rec.get("treatment", ""),
            )

            data = item.model_dump()
            data["createdAt"] = firestore.SERVER_TIMESTAMP

            collection.document(scan_id).set(
                data,
                merge=True
            )

            synced_count += 1

        return SyncResponse(
            success=True,
            syncedCount=synced_count,
            isDevMock=False,
        )


def initialize_firebase_admin():
    """
    Initialize Firebase Admin SDK exactly once.
    """

    if firebase_admin._apps:
        return True

    credential_path = (
        settings.FIREBASE_CREDENTIALS_PATH or ""
    ).strip()

    if not credential_path:
        raise RuntimeError(
            "FIREBASE_CREDENTIALS_PATH is not configured."
        )

    if not os.path.isabs(credential_path):
        backend_dir = os.path.dirname(
            os.path.dirname(os.path.abspath(__file__))
        )

        credential_path = os.path.join(
            backend_dir,
            credential_path
        )

    if not os.path.isfile(credential_path):
        raise FileNotFoundError(
            f"Firebase credentials file not found: {credential_path}"
        )

    cred = credentials.Certificate(credential_path)

    firebase_admin.initialize_app(
        cred,
        {
            "projectId": "smart-agriculture-copilot"
        }
    )

    print("[Firebase] Admin SDK initialized successfully.")

    return True


def _get_firestore_client():
    """
    Initialize Firebase Admin SDK if necessary,
    then return the Firestore client.
    """

    initialize_firebase_admin()

    return firestore.client()


def get_firebase_service() -> BaseFirebaseService:
    """
    Return the appropriate Firebase service.
    """

    credential_path = (
        settings.FIREBASE_CREDENTIALS_PATH or ""
    ).strip()

    if credential_path:
        try:
            return FirestoreFirebaseService()

        except Exception as exc:
            print(
                "[Firebase] Failed to initialize Firestore:",
                str(exc)
            )

            return MockFirebaseService()

    print(
        "[Firebase] FIREBASE_CREDENTIALS_PATH is not configured. "
        "Using MockFirebaseService."
    )

    return MockFirebaseService()