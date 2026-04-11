from typing import Optional

from fastapi import Header, HTTPException

from storage.json_storage import normalize_user_id

ADMIN_EMAIL = "jeevankhatri001@gmail.com"


def get_active_user_id(x_user_id: Optional[str] = Header(None)) -> str:
    return normalize_user_id(x_user_id)


def require_admin(x_user_email: Optional[str] = Header(None)) -> str:
    if (x_user_email or "").strip().lower() != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Admin access required")
    return ADMIN_EMAIL
