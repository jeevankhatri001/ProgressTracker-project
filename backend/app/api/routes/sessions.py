from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import sys
import os

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../'))
BACKEND_DIR = os.path.join(PROJECT_ROOT, 'backend')

for path in (PROJECT_ROOT, BACKEND_DIR):
    if path not in sys.path:
        sys.path.insert(0, path)

from models.workout_session import WorkoutSession
from models.exercise_log import ExerciseLog
from models.set_entry import SetEntry
from models.exercise import Exercise
from storage.json_storage import (
    load_sessions, save_sessions, delete_session_by_date,
    find_sessions_by_date, find_sessions_by_label
)
from app.schemas import WorkoutSessionCreate, WorkoutSessionResponse, SuccessResponse

router = APIRouter()


def _session_to_response(session: WorkoutSession) -> WorkoutSessionResponse:
    """Helper to convert WorkoutSession to response schema"""
    exercise_logs_data = []

    for log in session.exercise_logs:
        sets_data = []
        for set_entry in log.set_entry:
            sets_data.append({
                "set_number": set_entry.set_number,
                "reps": set_entry.reps,
                "weight": set_entry.weight
            })

        exercise_logs_data.append({
            "exercise": {
                "name": log.exercise.name,
                "muscle_group": log.exercise.muscle_group
            },
            "sets": sets_data
        })

    return WorkoutSessionResponse(
        date=session.date,
        day_name=session.day_name,
        workout_label=session.workout_label,
        exercise_logs=exercise_logs_data
    )


@router.post("", response_model=WorkoutSessionResponse)
async def create_session(session_data: WorkoutSessionCreate):
    """Log a new workout session"""
    try:
        session = WorkoutSession(
            session_data.date,
            session_data.day_name,
            session_data.workout_label
        )

        for log_data in session_data.exercise_logs:
            exercise = Exercise(log_data.exercise.name, log_data.exercise.muscle_group)
            exercise_log = ExerciseLog(exercise)

            for set_data in log_data.sets:
                set_entry = SetEntry(set_data.set_number, set_data.reps, set_data.weight)
                exercise_log.add_set(set_entry)

            session.add_exercise_log(exercise_log)

        sessions = load_sessions()
        sessions.append(session)
        save_sessions(sessions)

        return _session_to_response(session)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("", response_model=List[WorkoutSessionResponse])
async def list_sessions(date: Optional[str] = Query(None), label: Optional[str] = Query(None)):
    """List sessions with optional filtering"""
    sessions = load_sessions()

    if date:
        sessions = find_sessions_by_date(date)
    elif label:
        sessions = find_sessions_by_label(label)

    return [_session_to_response(s) for s in sessions]


@router.delete("/{session_date}")
async def delete_session(session_date: str):
    """Delete a session by date"""
    if delete_session_by_date(session_date):
        return SuccessResponse(message=f"Session on {session_date} deleted successfully")
    raise HTTPException(status_code=404, detail=f"No session found on {session_date}")
