from fastapi import APIRouter
from models.schemas import SyncRequest, SyncResponse
from services.base_firebase import get_firebase_service

router = APIRouter(prefix="/api", tags=["Synchronization"])

@router.post("/sync", response_model=SyncResponse)
async def sync_records(payload: SyncRequest):
    """
    Synchronize pending offline scan records.
    Canonical field: 'records'
    """
    firebase_service = get_firebase_service()
    return await firebase_service.sync_records(payload.records)
