import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Header, status
from firebase_admin import auth

from models.schemas import ScanRecordItem, SaveHistoryResponse
from services.base_firebase import (
    get_firebase_service,
    initialize_firebase_admin,
)

logger = logging.getLogger("smart_ag_backend.routes.history")
router = APIRouter(prefix="/api", tags=["Scan History"])


def get_user_id(authorization: str | None = Header(default=None)) -> str:
    """
    Verify Firebase ID token and return authenticated user's UID.
    Used as a FastAPI dependency for user-scoped protected endpoints.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required."
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header."
        )

    token = authorization.replace("Bearer ", "", 1).strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Firebase ID token."
        )

    # Initialize Firebase Admin SDK if configured
    try:
        initialize_firebase_admin()
    except Exception as exc:
        logger.debug("[History] Firebase Admin initialization notice: %s", exc)

    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token.get("uid")
        if not uid:
            raise ValueError("Token does not contain a valid user ID (uid).")
        return uid

    except Exception as exc:
        logger.warning("[History] Firebase token verification failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token."
        )


@router.get(
    "/history",
    response_model=List[ScanRecordItem]
)
async def get_history(
    user_id: str = Depends(get_user_id)
):
    """
    Retrieve scan history belonging to the authenticated user.
    """
    try:
        firebase_service = get_firebase_service()
        return await firebase_service.get_history(
            user_id=user_id
        )

    except HTTPException:
        raise

    except Exception as exc:
        logger.error("[History] Failed to retrieve history: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to retrieve scan history."
        )


@router.post(
    "/history",
    response_model=SaveHistoryResponse
)
async def save_history(
    record: ScanRecordItem,
    user_id: str = Depends(get_user_id)
):
    """
    Save a scan record for the authenticated user.
    """
    try:
        firebase_service = get_firebase_service()
        return await firebase_service.save_history(
            record=record,
            user_id=user_id
        )

    except HTTPException:
        raise

    except Exception as exc:
        logger.error("[History] Failed to save history: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save scan history."
        )