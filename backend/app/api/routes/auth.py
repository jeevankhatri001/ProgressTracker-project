from fastapi import APIRouter

from app.schemas import LoginRequest, LoginResponse
from storage.json_storage import load_user, normalize_user_id

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """Start a lightweight local account session."""
    user_id = normalize_user_id(login_data.username)
    return LoginResponse(
        user_id=user_id,
        username=login_data.username.strip(),
        has_profile=load_user(user_id) is not None,
    )
