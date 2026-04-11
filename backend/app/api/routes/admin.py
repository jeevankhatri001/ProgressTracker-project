from typing import List

from fastapi import APIRouter, Depends, HTTPException

from app.auth import require_admin
from app.schemas import AdminAccountResponse, SuccessResponse
from storage.json_storage import delete_account, list_accounts, normalize_user_id

router = APIRouter()


@router.get("/users", response_model=List[AdminAccountResponse])
async def get_users(_: str = Depends(require_admin)):
    """List local accounts stored on this machine."""
    return list_accounts()


@router.delete("/users/{user_id}")
async def remove_user(user_id: str, _: str = Depends(require_admin)):
    """Delete all local data for a user."""
    normalized_user_id = normalize_user_id(user_id)
    if delete_account(normalized_user_id):
        return SuccessResponse(message=f"Deleted user {normalized_user_id}")
    raise HTTPException(status_code=404, detail="User not found")
