from fastapi import APIRouter, HTTPException
from typing import Optional
import sys
import os

# Add parent directories to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../../'))

from models.user_profile import UserProfile
from storage.json_storage import save_user, load_user, delete_user
from app.schemas import UserProfileCreate, UserProfileResponse, SuccessResponse

router = APIRouter()


@router.post("", response_model=UserProfileResponse)
async def create_user(user_data: UserProfileCreate):
    """Create a new user profile"""
    try:
        user = UserProfile(
            user_data.name,
            user_data.age,
            user_data.sex,
            user_data.weight,
            user_data.height,
            user_data.training_experience_years,
            user_data.training_days_per_week
        )
        save_user(user)
        return UserProfileResponse(
            name=user.name,
            age=user.age,
            sex=user.sex,
            weight=user.weight,
            height=user.height,
            training_experience_years=user.training_experience_years,
            training_days_per_week=user.training_days_per_week,
            bmi=user.bmi,
            bmi_category=user.bmi_category,
            experience_level=user.experience_level
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=Optional[UserProfileResponse])
async def get_user():
    """Get current user profile"""
    user = load_user()
    if not user:
        raise HTTPException(status_code=404, detail="No user profile found")

    return UserProfileResponse(
        name=user.name,
        age=user.age,
        sex=user.sex,
        weight=user.weight,
        height=user.height,
        training_experience_years=user.training_experience_years,
        training_days_per_week=user.training_days_per_week,
        bmi=user.bmi,
        bmi_category=user.bmi_category,
        experience_level=user.experience_level
    )


@router.delete("")
async def delete_user_profile():
    """Delete user profile"""
    if delete_user():
        return SuccessResponse(message="User profile deleted successfully")
    raise HTTPException(status_code=404, detail="User profile not found")
