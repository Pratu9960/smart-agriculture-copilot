from fastapi import APIRouter
from typing import List
from models.schemas import ScanRecordItem, SaveHistoryResponse
from services.base_firebase import get_firebase_service

router = APIRouter(prefix="/api", tags=["Scan History"])

@router.get("/history", response_model=List[ScanRecordItem])
async def get_history():
    """
    Retrieve scan history records.
    """
    firebase_service = get_firebase_service()
    return await firebase_service.get_history()

@router.post("/history", response_model=SaveHistoryResponse)
async def save_history(record: ScanRecordItem):
    """
    Save a new scan record.
    """
    firebase_service = get_firebase_service()
    return await firebase_service.save_history(record)
