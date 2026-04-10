from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import sys
import os
from io import StringIO
import csv

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../'))
BACKEND_DIR = os.path.join(PROJECT_ROOT, 'backend')

for path in (PROJECT_ROOT, BACKEND_DIR):
    if path not in sys.path:
        sys.path.insert(0, path)

from storage.json_storage import load_user, load_plan, load_sessions
from storage.export import (
    export_sessions_to_csv,
    export_user_profile_to_csv,
    export_plan_to_csv,
    generate_progress_report
)
from models.analytics import (
    get_personal_records,
    get_exercise_frequency,
    get_total_volume_summary,
    get_stats_by_muscle_group
)

router = APIRouter()


@router.get("/sessions/csv")
async def export_sessions_csv():
    """Export all sessions to CSV"""
    sessions = load_sessions()
    if not sessions:
        raise HTTPException(status_code=404, detail="No sessions to export")

    output = StringIO()
    rows = []

    for session in sessions:
        for exercise_log in session.exercise_logs:
            for set_entry in exercise_log.set_entry:
                rows.append({
                    'date': session.date,
                    'day_name': session.day_name,
                    'workout_label': session.workout_label,
                    'exercise': exercise_log.exercise.name,
                    'muscle_group': exercise_log.exercise.muscle_group,
                    'set_num': set_entry.set_number,
                    'reps': set_entry.reps,
                    'weight_kg': set_entry.weight
                })

    if rows:
        writer = csv.DictWriter(output, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sessions.csv"}
    )


@router.get("/user-profile/csv")
async def export_user_csv():
    """Export user profile to CSV"""
    user = load_user()
    if not user:
        raise HTTPException(status_code=404, detail="No user profile to export")

    output = StringIO()
    rows = [{
        'name': user.name,
        'age': user.age,
        'sex': user.sex,
        'weight_kg': user.weight,
        'height_m': user.height,
        'bmi': user.bmi,
        'bmi_category': user.bmi_category,
        'experience_years': user.training_experience_years,
        'experience_level': user.experience_level,
        'training_days_per_week': user.training_days_per_week
    }]

    writer = csv.DictWriter(output, fieldnames=rows[0].keys())
    writer.writeheader()
    writer.writerows(rows)

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=user_profile.csv"}
    )


@router.get("/plan/csv")
async def export_plan_csv():
    """Export workout plan to CSV"""
    plan = load_plan()
    if not plan:
        raise HTTPException(status_code=404, detail="No workout plan to export")

    output = StringIO()
    rows = []

    for day in plan.workout_days:
        for exercise in day.exercises:
            rows.append({
                'day_name': day.day_name,
                'workout_label': day.workout_label,
                'exercise': exercise.name,
                'muscle_group': exercise.muscle_group
            })

    if rows:
        writer = csv.DictWriter(output, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=workout_plan.csv"}
    )


@router.get("/progress-report")
async def export_progress_report():
    """Generate and export progress report"""
    user = load_user()
    sessions = load_sessions()

    if not user:
        raise HTTPException(status_code=404, detail="No user profile found")
    if not sessions:
        raise HTTPException(status_code=404, detail="No sessions found")

    # Gather analytics
    analytics_data = {
        'personal_records': get_personal_records(sessions),
        'frequency': get_exercise_frequency(sessions),
        'volume_summary': get_total_volume_summary(sessions),
        'muscle_groups': get_stats_by_muscle_group(sessions)
    }

    # Generate report
    report_lines = []
    report_lines.append("=" * 70)
    report_lines.append(" " * 20 + "PROGRESS TRACKING REPORT")
    report_lines.append("=" * 70)
    from datetime import datetime
    report_lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    # User Info
    report_lines.append("USER PROFILE")
    report_lines.append("-" * 70)
    report_lines.append(f"Name:           {user.name}")
    report_lines.append(f"Age:            {user.age}")
    report_lines.append(f"Sex:            {user.sex.title()}")
    report_lines.append(f"Height:         {user.height}m")
    report_lines.append(f"Weight:         {user.weight}kg")
    report_lines.append(f"BMI:            {user.bmi} ({user.bmi_category})")
    report_lines.append(f"Experience:     {user.training_experience_years} years ({user.experience_level})")
    report_lines.append(f"Training Freq:  {user.training_days_per_week} days/week\n")

    # Session Summary
    report_lines.append("SESSION SUMMARY")
    report_lines.append("-" * 70)
    report_lines.append(f"Total Sessions: {len(sessions)}")
    if sessions:
        dates = [s.date for s in sessions]
        report_lines.append(f"Date Range:     {min(dates)} to {max(dates)}")

    report_lines.append("")

    # Personal Records
    if analytics_data["personal_records"]:
        report_lines.append("PERSONAL RECORDS (MAX WEIGHT)")
        report_lines.append("-" * 70)
        for ex_name, data in sorted(analytics_data["personal_records"].items()):
            report_lines.append(
                f"{ex_name:30s} {data['max_weight']:6.1f}kg  ({data['reps']} reps on {data['date']})"
            )
        report_lines.append("")

    # Exercise Frequency
    if analytics_data["frequency"]:
        report_lines.append("EXERCISE FREQUENCY")
        report_lines.append("-" * 70)
        for ex_name, count in sorted(analytics_data["frequency"].items(), key=lambda x: x[1], reverse=True):
            report_lines.append(f"{ex_name:40s} {count:3d} times")
        report_lines.append("")

    # Volume Summary
    vol = analytics_data["volume_summary"]
    report_lines.append("VOLUME STATISTICS")
    report_lines.append("-" * 70)
    report_lines.append(f"Total Volume:        {vol['total_volume']:10.1f} kg×reps")
    report_lines.append(f"Avg per Session:     {vol['avg_per_session']:10.1f} kg×reps")
    report_lines.append("")

    # Muscle Group Stats
    if analytics_data["muscle_groups"]:
        report_lines.append("MUSCLE GROUP BREAKDOWN")
        report_lines.append("-" * 70)
        for mg, stats in sorted(analytics_data["muscle_groups"].items()):
            report_lines.append(
                f"{mg.title():20s} {stats['total_sets']:3d} sets, "
                f"{stats['total_volume']:8.1f} vol, "
                f"{len(stats['exercises'])} exercises"
            )
        report_lines.append("")

    report_lines.append("=" * 70)

    report_text = '\n'.join(report_lines)

    return StreamingResponse(
        iter([report_text]),
        media_type="text/plain",
        headers={"Content-Disposition": "attachment; filename=progress_report.txt"}
    )
