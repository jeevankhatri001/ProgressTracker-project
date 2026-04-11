import os

from fastapi import APIRouter, HTTPException
from google.auth.transport import requests
from google.oauth2 import id_token

from app.schemas import GoogleLoginRequest, LoginRequest, LoginResponse
from storage.json_storage import load_user, normalize_user_id

router = APIRouter()
GOOGLE_CLIENT_ID = os.getenv(
    "GOOGLE_CLIENT_ID",
    "173831809916-12q81jpgkr8k0uavm84m9k8l8i8h6c99.apps.googleusercontent.com",
)


@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """Start a lightweight local account session."""
    user_id = normalize_user_id(login_data.username)
    return LoginResponse(
        user_id=user_id,
        username=login_data.username.strip(),
        has_profile=load_user(user_id) is not None,
        provider="local",
    )


@router.post("/google", response_model=LoginResponse)
async def google_login(login_data: GoogleLoginRequest):
    """Verify a Google ID token and start an account session."""
    try:
        payload = id_token.verify_oauth2_token(
            login_data.credential,
            requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except ValueError as error:
        raise HTTPException(status_code=401, detail="Google login could not be verified.") from error

    subject = payload.get("sub")
    if not subject:
        raise HTTPException(status_code=401, detail="Google login did not include an account id.")

    email = payload.get("email")
    name = payload.get("name") or email or "Google user"
    user_id = normalize_user_id(f"google-{subject}")

    return LoginResponse(
        user_id=user_id,
        username=name,
        has_profile=load_user(user_id) is not None,
        email=email,
        picture=payload.get("picture"),
        provider="google",
    )
