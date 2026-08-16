from typing import List

from fastapi import APIRouter, HTTPException, Header, status
from firebase_admin import auth

from models.schemas import ScanRecordItem, SaveHistoryResponse
from services.base_firebase import (
    get_firebase_service,
    initialize_firebase_admin,
)

router = APIRouter(prefix="/api", tags=["Scan History"])


def get_user_id(authorization: str | None) -> str:
    """
    Verify Firebase ID token and return authenticated user's UID.
    """

    # Firebase Admin SDK must be initialized before verify_id_token().
    try:
        initialize_firebase_admin()
    except Exception as exc:
        print(
            "[History] Firebase Admin initialization failed:",
            str(exc)
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Firebase authentication service is unavailable."
        )

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

    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token["uid"]

    except Exception as exc:
        print(
            "[History] Firebase token verification failed:",
            str(exc)
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token."
        )


@router.get(
    "/history",
    response_model=List[ScanRecordItem]
)
async def get_history(
    authorization: str | None = Header(default=None)
):
    """
    Retrieve scan history belonging to the authenticated user.
    """

    user_id = get_user_id(authorization)

    try:
        firebase_service = get_firebase_service()

        return await firebase_service.get_history(
            user_id=user_id
        )

    except HTTPException:
        raise

    except Exception as exc:
        print("[History] Failed to retrieve history:", str(exc))

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
    authorization: str | None = Header(default=None)
):
    """
    Save a scan record for the authenticated user.
    """

    user_id = get_user_id(authorization)

    try:
        firebase_service = get_firebase_service()

        return await firebase_service.save_history(
            record=record,
            user_id=user_id
        )

    except HTTPException:
        raise

    except Exception as exc:
        print("[History] Failed to save history:", str(exc))

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save scan history."
        )