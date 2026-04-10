from fastapi import APIRouter, HTTPException, Query
from typing import Dict, List, Optional, Any
import sys
import os

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../'))
BACKEND_DIR = os.path.join(PROJECT_ROOT, 'backend')

for path in (PROJECT_ROOT, BACKEND_DIR):
    if path not in sys.path:
        sys.path.insert(0, path)

from storage.json_storage import load_sessions
from models.analytics import (
    get_personal_records,
    get_progression_by_exercise,
    get_stats_by_muscle_group,
    get_exercise_frequency,
    get_session_frequency_by_day,
    get_total_volume_summary,
    calculate_average_weight,
    get_strength_progress_summary
)

router = APIRouter()


@router.get("/personal-records")
async def personal_records():
    """Get personal records (max weight per exercise)"""
    sessions = load_sessions()
    if not sessions:
        raise HTTPException(status_code=404, detail="No sessions found")

    records = get_personal_records(sessions)
    return {
        "records": [
            {
                "exercise": name,
                "max_weight": data["max_weight"],
                "reps": data["reps"],
                "date": data["date"]
            }
            for name, data in records.items()
        ]
    }


@router.get("/progression")
async def progression(exercise: str = Query(..., description="Exercise name")):
    """Get weight progression for a specific exercise"""
    sessions = load_sessions()
    if not sessions:
        raise HTTPException(status_code=404, detail="No sessions found")

    progression_data = get_progression_by_exercise(sessions, exercise)
    if not progression_data:
        raise HTTPException(status_code=404, detail=f"No data found for exercise: {exercise}")

    return {"exercise": exercise, "progression": progression_data}


@router.get("/muscle-groups")
async def muscle_groups():
    """Get statistics by muscle group"""
    sessions = load_sessions()
    if not sessions:
        raise HTTPException(status_code=404, detail="No sessions found")

    stats = get_stats_by_muscle_group(sessions)
    return {
        "muscle_groups": [
            {
                "name": mg,
                "total_sets": stat["total_sets"],
                "total_volume": stat["total_volume"],
                "total_reps": stat["total_reps"],
                "exercises": stat["exercises"]
            }
            for mg, stat in stats.items()
        ]
    }


@router.get("/exercise-frequency")
async def exercise_frequency():
    """Get how many times each exercise has been performed"""
    sessions = load_sessions()
    if not sessions:
        raise HTTPException(status_code=404, detail="No sessions found")

    frequency = get_exercise_frequency(sessions)
    return {
        "frequency": [
            {"exercise": name, "count": count}
            for name, count in sorted(frequency.items(), key=lambda x: x[1], reverse=True)
        ]
    }


@router.get("/session-frequency")
async def session_frequency():
    """Get how many sessions per workout label"""
    sessions = load_sessions()
    if not sessions:
        raise HTTPException(status_code=404, detail="No sessions found")

    frequency = get_session_frequency_by_day(sessions)
    return {
        "frequency": [
            {"workout_label": label, "count": count}
            for label, count in sorted(frequency.items(), key=lambda x: x[1], reverse=True)
        ]
    }


@router.get("/volume-summary")
async def volume_summary():
    """Get overall volume statistics"""
    sessions = load_sessions()
    if not sessions:
        raise HTTPException(status_code=404, detail="No sessions found")

    summary = get_total_volume_summary(sessions)
    return summary


@router.get("/average-weight")
async def average_weight(exercise: str = Query(..., description="Exercise name")):
    """Get average weight for a specific exercise"""
    sessions = load_sessions()
    if not sessions:
        raise HTTPException(status_code=404, detail="No sessions found")

    stats = calculate_average_weight(exercise, sessions)
    if stats["num_sets"] == 0:
        raise HTTPException(status_code=404, detail=f"No data found for exercise: {exercise}")

    return {"exercise": exercise, "stats": stats}


@router.get("/strength-progress")
async def strength_progress():
    """Get strength progress (which exercises improved)"""
    sessions = load_sessions()
    if len(sessions) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 sessions to show progress")

    progress = get_strength_progress_summary(sessions)
    if not progress:
        return {"progress": []}

    improved = [
        {
            "exercise": name,
            "improved": data["improved"],
            "prev_max": data["prev_max"],
            "current_max": data["current_max"],
            "improvement": data["improvement"]
        }
        for name, data in progress.items()
        if data["improved"]
    ]

    return {"progress": sorted(improved, key=lambda x: x["improvement"], reverse=True)}
