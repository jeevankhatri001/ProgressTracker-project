from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime


class LoginRequest(BaseModel):
    """Request schema for a lightweight local login"""
    username: str = Field(..., min_length=1, max_length=50)


class LoginResponse(BaseModel):
    """Response schema for active local account"""
    user_id: str
    username: str
    has_profile: bool

# ── User Profile Schema ──

class UserProfileCreate(BaseModel):
    """Request schema for creating a user profile"""
    name: str = Field(..., min_length=1, max_length=100)
    age: int = Field(..., gt=0, le=150)
    sex: str = Field(..., description="male, female, or prefer not to say")
    weight: float = Field(..., gt=0, description="Weight in kg")
    height: float = Field(..., gt=0, description="Height in meters")
    training_experience_years: float = Field(..., ge=0)
    training_days_per_week: int = Field(..., ge=1, le=7)

    @validator('sex')
    def validate_sex(cls, v):
        valid = {"male", "female", "prefer not to say"}
        if v.lower() not in valid:
            raise ValueError(f"Sex must be one of {valid}")
        return v.lower()


class UserProfileResponse(UserProfileCreate):
    """Response schema for user profile (includes computed fields)"""
    bmi: float
    bmi_category: str
    experience_level: str


# ── Exercise Schema ──

class ExerciseCreate(BaseModel):
    """Request schema for creating an exercise"""
    name: str = Field(..., min_length=1, max_length=100)
    muscle_group: str = Field(..., min_length=1)

    @validator('muscle_group')
    def validate_muscle_group(cls, v):
        valid = {
            "chest", "back", "shoulder", "biceps", "triceps",
            "legs", "calves", "glutes", "quads", "hamstring",
            "abs", "full body", "upper chest", "middle chest", "lower chest",
            "inner chest", "upper back", "middle back", "lower back", "lats",
            "traps", "front delts", "side delts", "rear delts",
            "long head biceps", "short head biceps", "brachialis",
            "long head triceps", "lateral head triceps", "medial head triceps",
            "upper legs", "inner thighs", "outer thighs", "adductors",
            "gastrocnemius", "soleus", "outer calves", "upper glutes",
            "lower glutes", "glute medius", "glute max", "upper quads",
            "lower quads", "vastus medialis", "vastus lateralis",
            "rectus femoris", "upper hamstring", "lower hamstring",
            "inner hamstring", "outer hamstring", "upper abs", "lower abs",
            "obliques", "deep core"
        }
        if v.lower() not in valid:
            raise ValueError(f"Muscle group must be one of {valid}")
        return v.lower()


class ExerciseResponse(ExerciseCreate):
    """Response schema for exercise"""
    pass


# ── Set Entry Schema ──

class SetEntryCreate(BaseModel):
    """Request schema for creating a set entry"""
    set_number: int = Field(..., gt=0)
    reps: int = Field(..., gt=0)
    weight: float = Field(..., ge=0)


class SetEntryResponse(SetEntryCreate):
    """Response schema for set entry"""
    pass


# ── Exercise Log Schema ──

class ExerciseLogCreate(BaseModel):
    """Request schema for creating exercise log"""
    exercise: ExerciseCreate
    sets: List[SetEntryCreate]


class ExerciseLogResponse(BaseModel):
    """Response schema for exercise log"""
    exercise: ExerciseResponse
    sets: List[SetEntryResponse]


# ── Workout Day Schema ──

class WorkoutDayCreate(BaseModel):
    """Request schema for creating a workout day"""
    day_name: str = Field(..., min_length=1)
    workout_label: str = Field(..., min_length=1, max_length=50)
    exercises: List[ExerciseCreate]


class WorkoutDayResponse(WorkoutDayCreate):
    """Response schema for workout day"""
    pass


# ── Workout Plan Schema ──

class WorkoutPlanCreate(BaseModel):
    """Request schema for creating a workout plan"""
    plan_name: str = Field(..., min_length=1, max_length=100)
    workout_days: List[WorkoutDayCreate]


class WorkoutPlanResponse(WorkoutPlanCreate):
    """Response schema for workout plan"""
    pass


# ── Workout Session Schema ──

class WorkoutSessionCreate(BaseModel):
    """Request schema for creating a workout session"""
    date: str = Field(..., description="Format: YYYY-MM-DD")
    day_name: str = Field(..., min_length=1)
    workout_label: str = Field(..., min_length=1)
    exercise_logs: List[ExerciseLogCreate]


class WorkoutSessionResponse(BaseModel):
    """Response schema for workout session"""
    date: str
    day_name: str
    workout_label: str
    exercise_logs: List[ExerciseLogResponse]


# ── Analytics Response Schemas ──

class PersonalRecordResponse(BaseModel):
    """Schema for personal record"""
    exercise_name: str
    max_weight: float
    reps: int
    date: str


class ProgressionEntry(BaseModel):
    """Single entry in exercise progression"""
    date: str
    weight: float
    reps: int
    set_num: int


class MuscleGroupStats(BaseModel):
    """Statistics for a muscle group"""
    total_sets: int
    total_volume: float
    total_reps: int
    exercises: List[str]


class VolumeSummary(BaseModel):
    """Overall volume statistics"""
    total_volume: float
    avg_per_session: float
    num_sessions: int


class StrengthProgressEntry(BaseModel):
    """Entry for strength progress"""
    exercise_name: str
    improved: bool
    prev_max: float
    current_max: float
    improvement: float


class AverageWeightStats(BaseModel):
    """Average weight statistics for an exercise"""
    avg_weight: float
    heaviest: float
    lightest: float
    num_sets: int


# ── Error Response Schema ──

class ErrorResponse(BaseModel):
    """Error response schema"""
    detail: str
    status_code: int


# ── Success Response Schema ──

class SuccessResponse(BaseModel):
    """Generic success response"""
    message: str
    data: Optional[Any] = None
