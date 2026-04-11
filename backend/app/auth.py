from typing import Optional

from fastapi import Header

from storage.json_storage import normalize_user_id


def get_active_user_id(x_user_id: Optional[str] = Header(None)) -> str:
    return normalize_user_id(x_user_id)
