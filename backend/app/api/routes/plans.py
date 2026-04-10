from fastapi import APIRouter, HTTPException
from typing import Optional
import sys
import os

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../'))
BACKEND_DIR = os.path.join(PROJECT_ROOT, 'backend')

for path in (PROJECT_ROOT, BACKEND_DIR):
    if path not in sys.path:
        sys.path.insert(0, path)

from models.workout_plan import WorkoutPlan
from models.workoutday import WorkoutDay
from models.exercise import Exercise
from storage.json_storage import save_plan, load_plan, delete_plan
from app.schemas import WorkoutPlanCreate, WorkoutPlanResponse, SuccessResponse

router = APIRouter()


def _create_plan_from_request(plan_data: WorkoutPlanCreate) -> WorkoutPlan:
    """Helper to create WorkoutPlan from request schema"""
    plan = WorkoutPlan(plan_data.plan_name)

    for day_data in plan_data.workout_days:
        day = WorkoutDay(day_data.day_name, day_data.workout_label)

        for ex_data in day_data.exercises:
            exercise = Exercise(ex_data.name, ex_data.muscle_group)
            day.add_exercise(exercise)

        plan.add_workout_day(day)

    return plan


def _plan_to_response(plan: WorkoutPlan) -> WorkoutPlanResponse:
    """Helper to convert WorkoutPlan to response schema"""
    days_data = []
    for day in plan.workout_days:
        exercises_data = []
        for exercise in day.exercises:
            exercises_data.append({
                "name": exercise.name,
                "muscle_group": exercise.muscle_group
            })
        days_data.append({
            "day_name": day.day_name,
            "workout_label": day.workout_label,
            "exercises": exercises_data
        })

    return WorkoutPlanResponse(
        plan_name=plan.plan_name,
        workout_days=days_data
    )


@router.post("", response_model=WorkoutPlanResponse)
async def create_plan(plan_data: WorkoutPlanCreate):
    """Create a new workout plan"""
    try:
        plan = _create_plan_from_request(plan_data)
        save_plan(plan)
        return _plan_to_response(plan)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=Optional[WorkoutPlanResponse])
async def get_plan():
    """Get current workout plan"""
    plan = load_plan()
    if not plan:
        raise HTTPException(status_code=404, detail="No workout plan found")
    return _plan_to_response(plan)


@router.delete("")
async def delete_plan_endpoint():
    """Delete workout plan"""
    if delete_plan():
        return SuccessResponse(message="Workout plan deleted successfully")
    raise HTTPException(status_code=404, detail="Workout plan not found")
