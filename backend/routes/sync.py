import logging
from fastapi import APIRouter, Depends, HTTPException, status

from models.schemas import SyncRequest, SyncResponse
from services.base_firebase import get_firebase_service
from routes.history import get_user_id

logger = logging.getLogger("smart_ag_backend.routes.sync")
router = APIRouter(prefix="/api", tags=["Synchronization"])


@router.post("/sync", response_model=SyncResponse)
async def sync_records(
    payload: SyncRequest,
    user_id: str = Depends(get_user_id)
):
    """
    Synchronize pending offline scan records
    for the authenticated Firebase user.
    """
    try:
        firebase_service = get_firebase_service()

        return await firebase_service.sync_records(
            payload.records,
            user_id=user_id
        )

    except HTTPException:
        raise

    except Exception as exc:
        logger.error("[Sync] Failed to synchronize records: %s", exc)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to synchronize scan records."
        )