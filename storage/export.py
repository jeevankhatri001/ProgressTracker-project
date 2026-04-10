"""
Export module for converting workout data to CSV and text reports.
"""

import csv
import os
from datetime import datetime


def export_sessions_to_csv(sessions, filepath):
    """
    Export all sessions with flattened structure to CSV.
    Each row is one set from one exercise in one session.
    Returns: True if successful, False if no data
    """
    if not sessions:
        print("No sessions to export.")
        return False

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

    if not rows:
        print("No set entries to export.")
        return False

    try:
        # Ensure directory exists
        directory = os.path.dirname(filepath)
        if directory and not os.path.exists(directory):
            os.makedirs(directory)

        with open(filepath, 'w', newline='') as f:
            fieldnames = rows[0].keys()
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)

        print(f"Sessions exported to {filepath}")
        return True
    except Exception as e:
        print(f"Error exporting sessions: {e}")
        return False


def export_user_profile_to_csv(user, filepath):
    """
    Export user profile information to CSV.
    Returns: True if successful, False otherwise
    """
    if not user:
        print("No user profile to export.")
        return False

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

    try:
        # Ensure directory exists
        directory = os.path.dirname(filepath)
        if directory and not os.path.exists(directory):
            os.makedirs(directory)

        with open(filepath, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=rows[0].keys())
            writer.writeheader()
            writer.writerows(rows)

        print(f"User profile exported to {filepath}")
        return True
    except Exception as e:
        print(f"Error exporting user profile: {e}")
        return False


def export_plan_to_csv(plan, filepath):
    """
    Export workout plan structure to CSV.
    Each row is one exercise in one workout day.
    Returns: True if successful, False otherwise
    """
    if not plan:
        print("No workout plan to export.")
        return False

    rows = []
    for day in plan.workout_days:
        for exercise in day.exercises:
            rows.append({
                'day_name': day.day_name,
                'workout_label': day.workout_label,
                'exercise': exercise.name,
                'muscle_group': exercise.muscle_group
            })

    if not rows:
        print("No exercises in plan to export.")
        return False

    try:
        # Ensure directory exists
        directory = os.path.dirname(filepath)
        if directory and not os.path.exists(directory):
            os.makedirs(directory)

        with open(filepath, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=rows[0].keys())
            writer.writeheader()
            writer.writerows(rows)

        print(f"Workout plan exported to {filepath}")
        return True
    except Exception as e:
        print(f"Error exporting workout plan: {e}")
        return False


def generate_progress_report(user, sessions, filepath, analytics_data=None):
    """
    Generate a text-based progress report with user info and statistics.
    Returns: True if successful, False otherwise
    """
    if not user:
        print("No user profile for report.")
        return False

    report_lines = []
    report_lines.append("=" * 70)
    report_lines.append(" " * 20 + "PROGRESS TRACKING REPORT")
    report_lines.append("=" * 70)
    report_lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    # User Information
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
    else:
        report_lines.append("(No sessions logged yet)")

    report_lines.append("")

    # Analytics if provided
    if analytics_data:
        # Personal Records
        if "personal_records" in analytics_data and analytics_data["personal_records"]:
            report_lines.append("PERSONAL RECORDS (MAX WEIGHT)")
            report_lines.append("-" * 70)
            for ex_name, data in sorted(analytics_data["personal_records"].items()):
                report_lines.append(
                    f"{ex_name:30s} {data['max_weight']:6.1f}kg  ({data['reps']} reps on {data['date']})"
                )
            report_lines.append("")

        # Exercise Frequency
        if "frequency" in analytics_data and analytics_data["frequency"]:
            report_lines.append("EXERCISE FREQUENCY")
            report_lines.append("-" * 70)
            for ex_name, count in sorted(analytics_data["frequency"].items(), key=lambda x: x[1], reverse=True):
                report_lines.append(f"{ex_name:40s} {count:3d} times")
            report_lines.append("")

        # Volume Summary
        if "volume_summary" in analytics_data:
            vol = analytics_data["volume_summary"]
            report_lines.append("VOLUME STATISTICS")
            report_lines.append("-" * 70)
            report_lines.append(f"Total Volume:        {vol['total_volume']:10.1f} kg×reps")
            report_lines.append(f"Avg per Session:     {vol['avg_per_session']:10.1f} kg×reps")
            report_lines.append("")

        # Muscle Group Stats
        if "muscle_groups" in analytics_data and analytics_data["muscle_groups"]:
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

    try:
        # Ensure directory exists
        directory = os.path.dirname(filepath)
        if directory and not os.path.exists(directory):
            os.makedirs(directory)

        with open(filepath, 'w') as f:
            f.write('\n'.join(report_lines))

        print(f"Progress report generated: {filepath}")
        return True
    except Exception as e:
        print(f"Error generating report: {e}")
        return False
