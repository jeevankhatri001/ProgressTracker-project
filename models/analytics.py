"""
Analytics module for workout progress tracking.
Provides functions to calculate PRs, volume, frequency, and other metrics.
"""


def get_personal_records(sessions):
    """
    Get personal records (max weight) for each exercise.
    Returns: {exercise_name: {"max_weight": X, "date": Y, "reps": Z}}
    """
    records = {}
    for session in sessions:
        for exercise_log in session.exercise_logs:
            ex_name = exercise_log.exercise.name
            for set_entry in exercise_log.set_entry:
                if ex_name not in records:
                    records[ex_name] = {
                        "max_weight": set_entry.weight,
                        "date": session.date,
                        "reps": set_entry.reps
                    }
                else:
                    if set_entry.weight > records[ex_name]["max_weight"]:
                        records[ex_name] = {
                            "max_weight": set_entry.weight,
                            "date": session.date,
                            "reps": set_entry.reps
                        }
    return records


def get_progression_by_exercise(sessions, exercise_name):
    """
    Get progression (weight over time) for a specific exercise.
    Returns: [{"date": X, "weight": Y, "reps": Z}, ...] sorted by date
    """
    progression = []
    for session in sessions:
        for exercise_log in session.exercise_logs:
            if exercise_log.exercise.name.lower() == exercise_name.lower():
                for set_entry in exercise_log.set_entry:
                    progression.append({
                        "date": session.date,
                        "weight": set_entry.weight,
                        "reps": set_entry.reps,
                        "set_num": set_entry.set_number
                    })
    return sorted(progression, key=lambda x: x["date"])


def calculate_total_volume(session):
    """
    Calculate total volume (weight × reps) for a workout session.
    Returns: float
    """
    total = 0.0
    for exercise_log in session.exercise_logs:
        for set_entry in exercise_log.set_entry:
            total += set_entry.weight * set_entry.reps
    return total


def get_stats_by_muscle_group(sessions):
    """
    Get statistics aggregated by muscle group.
    Returns: {muscle_group: {"total_sets": N, "total_volume": X, "total_reps": Y}}
    """
    stats = {}
    for session in sessions:
        for exercise_log in session.exercise_logs:
            mg = exercise_log.exercise.muscle_group
            if mg not in stats:
                stats[mg] = {
                    "total_sets": 0,
                    "total_volume": 0.0,
                    "total_reps": 0,
                    "exercises": set()
                }

            set_count = len(exercise_log.set_entry)
            stats[mg]["total_sets"] += set_count
            stats[mg]["exercises"].add(exercise_log.exercise.name)

            for set_entry in exercise_log.set_entry:
                stats[mg]["total_volume"] += set_entry.weight * set_entry.reps
                stats[mg]["total_reps"] += set_entry.reps

    # Convert sets to list for display
    for mg in stats:
        stats[mg]["exercises"] = list(stats[mg]["exercises"])

    return stats


def get_exercise_frequency(sessions):
    """
    Get how many times each exercise has been performed.
    Returns: {exercise_name: count}
    """
    frequency = {}
    for session in sessions:
        for exercise_log in session.exercise_logs:
            ex_name = exercise_log.exercise.name
            frequency[ex_name] = frequency.get(ex_name, 0) + 1
    return frequency


def get_session_frequency_by_day(sessions):
    """
    Get how many sessions per workout day.
    Returns: {day_label: count}
    """
    frequency = {}
    for session in sessions:
        label = session.workout_label
        frequency[label] = frequency.get(label, 0) + 1
    return frequency


def get_total_volume_summary(sessions):
    """
    Get total volume (weight × reps) for all sessions.
    Returns: {"total_volume": X, "avg_per_session": Y, "num_sessions": Z}
    """
    if not sessions:
        return {"total_volume": 0.0, "avg_per_session": 0.0, "num_sessions": 0}

    total_volume = sum(calculate_total_volume(s) for s in sessions)
    return {
        "total_volume": round(total_volume, 2),
        "avg_per_session": round(total_volume / len(sessions), 2),
        "num_sessions": len(sessions)
    }


def calculate_average_weight(exercise_name, sessions):
    """
    Get average weight for a specific exercise across all sessions.
    Returns: {"avg_weight": X, "heaviest": Y, "lightest": Z, "num_sets": N}
    """
    weights = []
    for session in sessions:
        for exercise_log in session.exercise_logs:
            if exercise_log.exercise.name.lower() == exercise_name.lower():
                for set_entry in exercise_log.set_entry:
                    weights.append(set_entry.weight)

    if not weights:
        return {"avg_weight": 0.0, "heaviest": 0.0, "lightest": 0.0, "num_sets": 0}

    return {
        "avg_weight": round(sum(weights) / len(weights), 2),
        "heaviest": max(weights),
        "lightest": min(weights),
        "num_sets": len(weights)
    }


def get_strength_progress_summary(sessions):
    """
    Get overall strength progress (which exercises improved).
    Returns: {exercise_name: {"improved": bool, "prev_max": X, "current_max": Y, "improvement": Z}}
    """
    if len(sessions) < 2:
        return {}

    progress = {}

    # Get current and previous best for each exercise
    exercise_history = {}

    for session in sessions:
        for exercise_log in session.exercise_logs:
            ex_name = exercise_log.exercise.name
            if ex_name not in exercise_history:
                exercise_history[ex_name] = []

            for set_entry in exercise_log.set_entry:
                exercise_history[ex_name].append({
                    "date": session.date,
                    "weight": set_entry.weight,
                    "reps": set_entry.reps
                })

    # Calculate improvement
    for ex_name, history in exercise_history.items():
        if len(history) >= 2:
            prev_max = max(h["weight"] for h in history[:-1])
            current_max = max(h["weight"] for h in history)
            improvement = current_max - prev_max

            progress[ex_name] = {
                "improved": improvement > 0,
                "prev_max": prev_max,
                "current_max": current_max,
                "improvement": round(improvement, 2)
            }

    return progress
