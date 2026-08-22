from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import json
import logging
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

logger = logging.getLogger("smart_ag_backend.services.base_firebase")


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
    Development fallback service with strict per-user isolation.

    Used when Firebase credentials are not configured.
    """

    def __init__(self):
        default_scans = [
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
        self._history_by_user: Dict[str, List[ScanRecordItem]] = {
            "test-user-123": list(default_scans),
            "default": list(default_scans),
        }

    async def get_history(
        self,
        user_id: Optional[str] = None
    ) -> List[ScanRecordItem]:
        uid = user_id or "default"
        return list(self._history_by_user.get(uid, []))

    async def save_history(
        self,
        record: ScanRecordItem,
        user_id: Optional[str] = None
    ) -> SaveHistoryResponse:
        uid = user_id or "default"

        if not record.id:
            record.id = f"scan_{int(time.time() * 1000)}"

        if not record.date:
            record.date = time.strftime("%Y-%m-%d %H:%M")

        record.syncStatus = "SYNCED"

        if uid not in self._history_by_user:
            self._history_by_user[uid] = []
        self._history_by_user[uid].insert(0, record)

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
        uid = user_id or "default"
        synced_count = 0

        if uid not in self._history_by_user:
            self._history_by_user[uid] = []

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

            self._history_by_user[uid].insert(0, item)
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


def initialize_firebase_admin() -> bool:
    """
    Initialize Firebase Admin SDK exactly once with priority:
    1. FIREBASE_SERVICE_ACCOUNT_JSON (Vercel / Production environment variable)
    2. FIREBASE_CREDENTIALS_PATH (Local service account JSON file)
    3. Neither configured: allowed in development (returns False), raises RuntimeError in production.
    """
    if firebase_admin._apps:
        return True

    is_production = (settings.ENVIRONMENT or "").strip().lower() == "production"
    service_account_json = (settings.FIREBASE_SERVICE_ACCOUNT_JSON or "").strip()
    credential_path = (settings.FIREBASE_CREDENTIALS_PATH or "").strip()

    # Priority 1: FIREBASE_SERVICE_ACCOUNT_JSON
    if service_account_json:
        try:
            service_account_dict = json.loads(service_account_json)
            if not isinstance(service_account_dict, dict):
                raise ValueError("FIREBASE_SERVICE_ACCOUNT_JSON must be a valid JSON object.")
        except Exception:
            logger.error("[Firebase] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: invalid JSON format.")
            raise ValueError("Invalid FIREBASE_SERVICE_ACCOUNT_JSON: must be a valid JSON object.")

        try:
            cred = credentials.Certificate(service_account_dict)
            project_id = service_account_dict.get("project_id") or "smart-agriculture-copilot"
            firebase_admin.initialize_app(
                cred,
                {
                    "projectId": project_id
                }
            )
            logger.info("[Firebase] Admin SDK initialized successfully from service account JSON.")
            return True
        except Exception as exc:
            logger.error("[Firebase] Failed to initialize Firebase Admin SDK from service account JSON: %s", type(exc).__name__)
            raise RuntimeError("Failed to initialize Firebase Admin from service account JSON.") from exc

    # Priority 2: FIREBASE_CREDENTIALS_PATH
    if credential_path:
        target_path = credential_path
        if not os.path.isabs(target_path):
            backend_dir = os.path.dirname(
                os.path.dirname(os.path.abspath(__file__))
            )
            target_path = os.path.join(
                backend_dir,
                target_path
            )

        if not os.path.isfile(target_path):
            logger.error("[Firebase] Firebase credentials file not found at path: %s", target_path)
            raise FileNotFoundError(
                f"Firebase credentials file not found: {target_path}"
            )

        try:
            cred = credentials.Certificate(target_path)
            firebase_admin.initialize_app(
                cred,
                {
                    "projectId": "smart-agriculture-copilot"
                }
            )
            logger.info("[Firebase] Admin SDK initialized successfully from credentials file.")
            return True
        except Exception as exc:
            logger.error("[Firebase] Failed to initialize Firebase Admin SDK from credentials file: %s", type(exc).__name__)
            raise RuntimeError("Failed to initialize Firebase Admin from credentials file.") from exc

    # Priority 3: Neither configured
    if is_production:
        logger.error("[Firebase] Firebase credentials are not configured in production environment.")
        raise RuntimeError(
            "Firebase credentials are required in production. Please configure FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_CREDENTIALS_PATH."
        )

    logger.info(
        "[Firebase] Neither FIREBASE_SERVICE_ACCOUNT_JSON nor FIREBASE_CREDENTIALS_PATH is configured. "
        "Running in development mode with MockFirebaseService."
    )
    return False


def _get_firestore_client():
    """
    Initialize Firebase Admin SDK if necessary,
    then return the Firestore client.
    """
    if not initialize_firebase_admin():
        raise RuntimeError("Firebase Admin SDK is not initialized.")

    return firestore.client()


def get_firebase_service() -> BaseFirebaseService:
    """
    Return the appropriate Firebase service.
    In production, Firebase credentials must initialize successfully;
    never silently fall back to MockFirebaseService.
    In non-production, fallback to MockFirebaseService is allowed.
    """
    is_production = (settings.ENVIRONMENT or "").strip().lower() == "production"

    if is_production:
        try:
            return FirestoreFirebaseService()
        except Exception as exc:
            logger.error("[Firebase] Failed to initialize Firestore in production: %s", type(exc).__name__)
            raise RuntimeError(f"Failed to initialize Firebase in production: {exc}") from exc

    # In non-production (development/test):
    has_credentials = bool(
        (settings.FIREBASE_SERVICE_ACCOUNT_JSON or "").strip()
        or (settings.FIREBASE_CREDENTIALS_PATH or "").strip()
    )

    if has_credentials:
        try:
            return FirestoreFirebaseService()
        except Exception as exc:
            logger.warning(
                "[Firebase] Failed to initialize Firestore in %s mode (%s). Falling back to MockFirebaseService.",
                settings.ENVIRONMENT,
                type(exc).__name__
            )
            return MockFirebaseService()

    logger.info(
        "[Firebase] Firebase credentials not configured in %s environment. Using MockFirebaseService.",
        settings.ENVIRONMENT
    )
    return MockFirebaseService()