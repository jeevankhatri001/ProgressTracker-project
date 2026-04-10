from models.user_profile import UserProfile
from models.exercise import Exercise
from models.workoutday import WorkoutDay
from models.workout_plan import WorkoutPlan
from models.set_entry import SetEntry
from models.exercise_log import ExerciseLog
from models.workout_session import WorkoutSession
from models.analytics import (
    get_personal_records,
    get_progression_by_exercise,
    calculate_total_volume,
    get_stats_by_muscle_group,
    get_exercise_frequency,
    get_session_frequency_by_day,
    get_total_volume_summary,
    calculate_average_weight,
    get_strength_progress_summary
)

from storage.json_storage import (
    save_user,
    load_user,
    save_plan,
    load_plan,
    save_sessions,
    load_sessions,
    delete_session_by_date,
    delete_session_by_index,
    delete_plan,
    delete_user,
    find_sessions_by_date,
    find_sessions_by_label,
)

from storage.export import (
    export_sessions_to_csv,
    export_user_profile_to_csv,
    export_plan_to_csv,
    generate_progress_report,
)


def create_user_profile():
    print("\n--- Create User Profile ---")

    while True:
        try:
            name = input("Enter name: ").strip()
            age = int(input("Enter age: ").strip())
            sex = input("Enter sex (male / female / prefer not to say): ").strip()
            weight = float(input("Enter weight (kg): ").strip())
            height = float(input("Enter height (m): ").strip())
            exp = float(input("Enter training experience (years): ").strip())
            days = int(input("Enter training days per week (1-7): ").strip())

            user = UserProfile(name, age, sex, weight, height, exp, days)
            save_user(user)
            print("\nUser profile saved successfully.")
            return user

        except ValueError as e:
            print(f"Error: {e}")
            print("Please re-enter the profile.\n")


def create_workout_plan(user):
    print("\n--- Create Workout Plan ---")

    while True:
        try:
            plan_name = input("Enter workout plan name (e.g. PPL, Bro Split): ").strip()
            plan = WorkoutPlan(plan_name)
            break
        except ValueError as e:
            print(f"Error: {e}")
            print("Please re-enter the plan name.\n")

    for i in range(user.training_days_per_week):
        print(f"\nWorkout day {i + 1}")

        while True:
            try:
                day_name = input("Enter calendar day (e.g. sunday): ").strip()
                workout_label = input("Enter workout label (e.g. chest, push, pull): ").strip()
                workout_day = WorkoutDay(day_name, workout_label)
                break
            except ValueError as e:
                print(f"Error: {e}")
                print("Please re-enter this workout day.\n")

        while True:
            add_more = input("Add exercise? (y/n): ").strip().lower()

            if add_more == "n":
                break

            if add_more != "y":
                print("Please enter only y or n.")
                continue

            while True:
                try:
                    ex_name = input("Enter exercise name: ").strip()
                    muscle_group = input("Enter muscle group: ").strip()
                    exercise = Exercise(ex_name, muscle_group)
                    workout_day.add_exercise(exercise)
                    print(f"{exercise.name} added successfully.")
                    break
                except ValueError as e:
                    print(f"Error: {e}")
                    print("Please re-enter this exercise.\n")

        try:
            plan.add_workout_day(workout_day)
        except ValueError as e:
            print(f"Error: {e}")
            print("This day was not added.\n")

    save_plan(plan)
    print("\nWorkout plan saved successfully.")
    return plan


def select_workout_day(plan):
    if not plan.workout_days:
        print("No workout days found in the plan.")
        return None

    print("\nAvailable workout days:")
    for i, day in enumerate(plan.workout_days, start=1):
        print(f"{i}. {day.day_name.capitalize()} - {day.workout_label.capitalize()}")

    while True:
        choice = input("Select a workout day by number: ").strip()

        try:
            choice = int(choice)
            if 1 <= choice <= len(plan.workout_days):
                return plan.workout_days[choice - 1]
            else:
                print("Invalid number. Try again.")
        except ValueError:
            print("Please enter a valid number.")


def log_workout_session(plan, sessions):
    print("\n--- Log Workout Session ---")

    while True:
        date = input("Enter date (YYYY-MM-DD): ").strip()
        if date:
            break
        print("Date cannot be empty.")

    matched_day = select_workout_day(plan)
    if matched_day is None:
        return sessions

    try:
        session = WorkoutSession(date, matched_day.day_name, matched_day.workout_label)
    except ValueError as e:
        print(f"Error: {e}")
        return sessions

    print(f"\nLogging session for {matched_day.day_name.capitalize()} - {matched_day.workout_label.capitalize()}")

    for exercise in matched_day.exercises:
        while True:
            do_exercise = input(f"\nLog {exercise.name}? (y/n): ").strip().lower()
            if do_exercise in ("y", "n"):
                break
            print("Please enter only y or n.")

        if do_exercise == "n":
            continue

        exercise_log = ExerciseLog(exercise)

        while True:
            try:
                set_count = int(input(f"How many sets for {exercise.name}? ").strip())
                if set_count <= 0:
                    print("Set count must be greater than 0.")
                    continue
                break
            except ValueError:
                print("Please enter a valid integer for set count.")

        for set_num in range(1, set_count + 1):
            while True:
                try:
                    reps = int(input(f"Set {set_num} reps: ").strip())
                    weight = float(input(f"Set {set_num} weight (kg): ").strip())
                    set_entry = SetEntry(set_num, reps, weight)
                    exercise_log.add_set(set_entry)
                    break
                except ValueError as e:
                    print(f"Error: {e}")
                    print("Please re-enter this set.\n")

        try:
            session.add_exercise_log(exercise_log)
        except ValueError as e:
            print(f"Error: {e}")
            print("This exercise log was not added.\n")

    sessions.append(session)
    save_sessions(sessions)
    print("\nWorkout session saved successfully.")
    return sessions


def view_sessions(sessions):
    print("\n--- Workout Sessions ---")
    if not sessions:
        print("No sessions found.")
        return

    print("1. View all sessions")
    print("2. Search by date")
    print("3. Search by workout day label")

    choice = input("Enter your choice: ").strip()

    if choice == "1":
        for session in sessions:
            print(session)
            print()

    elif choice == "2":
        date = input("Enter date (YYYY-MM-DD): ").strip()
        found = False
        for session in sessions:
            if session.date == date:
                print(session)
                print()
                found = True
        if not found:
            print("No session found for that date.")

    elif choice == "3":
        label = input("Enter workout label (e.g. chest, push, pull): ").strip().lower()
        found = False
        for session in sessions:
            if session.workout_label.lower() == label:
                print(session)
                print()
                found = True
        if not found:
            print("No session found for that workout label.")

    else:
        print("Invalid choice.")


def view_analytics(sessions):
    """Display progress analytics and trends."""
    print("\n--- Progress Analytics ---")

    if not sessions:
        print("No sessions recorded yet. Log some workouts to see analytics!")
        return

    print("\n1. View Personal Records")
    print("2. View Exercise Progression")
    print("3. View Exercise Frequency")
    print("4. View Muscle Group Statistics")
    print("5. View Volume Summary")
    print("6. View Strength Progress")
    print("7. Back to Menu")

    choice = input("Enter your choice: ").strip()

    if choice == "1":
        prs = get_personal_records(sessions)
        if not prs:
            print("No exercise data available.")
            return
        print("\n" + "=" * 50)
        print("         PERSONAL RECORDS (MAX WEIGHT)")
        print("=" * 50)
        for ex_name in sorted(prs.keys()):
            data = prs[ex_name]
            print(f"{ex_name:35s} {data['max_weight']:6.1f}kg")
            print(f"  └─ {data['reps']} reps on {data['date']}")
        print()

    elif choice == "2":
        ex_name = input("Enter exercise name to track: ").strip()
        progression = get_progression_by_exercise(sessions, ex_name)
        if not progression:
            print(f"No data found for '{ex_name}'.")
            return
        print(f"\n" + "=" * 50)
        print(f"         PROGRESSION: {ex_name.upper()}")
        print("=" * 50)
        for entry in progression:
            print(f"{entry['date']} - Set {entry['set_num']}: {entry['weight']}kg x {entry['reps']} reps")
        print()

    elif choice == "3":
        frequency = get_exercise_frequency(sessions)
        if not frequency:
            print("No exercise data available.")
            return
        print("\n" + "=" * 50)
        print("         EXERCISE FREQUENCY")
        print("=" * 50)
        for ex_name in sorted(frequency.keys(), key=lambda x: frequency[x], reverse=True):
            print(f"{ex_name:40s} {frequency[ex_name]:3d} times")
        print()

    elif choice == "4":
        stats = get_stats_by_muscle_group(sessions)
        if not stats:
            print("No muscle group data available.")
            return
        print("\n" + "=" * 50)
        print("         MUSCLE GROUP STATISTICS")
        print("=" * 50)
        for mg in sorted(stats.keys()):
            s = stats[mg]
            print(f"{mg.title():20s} Sets: {s['total_sets']:3d} | Volume: {s['total_volume']:8.1f} | Reps: {s['total_reps']:5d}")
            print(f"  Exercises: {', '.join(s['exercises'])}")
        print()

    elif choice == "5":
        summary = get_total_volume_summary(sessions)
        print("\n" + "=" * 50)
        print("         VOLUME SUMMARY")
        print("=" * 50)
        print(f"Total Volume:        {summary['total_volume']:10.1f} kg×reps")
        print(f"Average per Session: {summary['avg_per_session']:10.1f} kg×reps")
        print(f"Total Sessions:      {summary['num_sessions']:10d}")
        print()

    elif choice == "6":
        progress = get_strength_progress_summary(sessions)
        if not progress:
            print("Need at least 2 sessions with exercises to show progress.")
            return
        print("\n" + "=" * 50)
        print("         STRENGTH PROGRESS")
        print("=" * 50)
        improved = {k: v for k, v in progress.items() if v['improved']}
        if improved:
            for ex_name in sorted(improved.keys()):
                data = improved[ex_name]
                print(f"✓ {ex_name}: {data['prev_max']}kg → {data['current_max']}kg (+{data['improvement']}kg)")
        else:
            print("No strength gains detected yet. Keep training!")
        print()

    elif choice == "7":
        return

    else:
        print("Invalid choice.")


def manage_data(plan, sessions, user):
    """Menu for editing and deleting data."""
    print("\n--- Manage Data ---")
    print("1. Delete a Session by Date")
    print("2. Delete Workout Plan")
    print("3. Delete User Profile")
    print("4. Back to Menu")

    choice = input("Enter your choice: ").strip()

    if choice == "1":
        if not sessions:
            print("No sessions to delete.")
            return sessions
        print("\nAvailable sessions:")
        for i, session in enumerate(sessions, 1):
            print(f"{i}. {session.date} - {session.workout_label.capitalize()}")

        date = input("Enter date of session to delete (YYYY-MM-DD): ").strip()
        if delete_session_by_date(date):
            print(f"Session on {date} deleted successfully.")
            return load_sessions()
        else:
            print(f"No session found for {date}.")
            return sessions

    elif choice == "2":
        if plan is None:
            print("No workout plan to delete.")
            return plan
        confirm = input("Are you sure you want to delete the workout plan? (yes/no): ").strip().lower()
        if confirm == "yes":
            if delete_plan():
                print("Workout plan deleted successfully.")
                return None
            else:
                print("Error deleting plan.")
                return plan
        return plan

    elif choice == "3":
        if user is None:
            print("No user profile to delete.")
            return user
        confirm = input("Are you sure you want to delete your profile? (yes/no): ").strip().lower()
        if confirm == "yes":
            if delete_user():
                print("User profile deleted successfully.")
                return None
            else:
                print("Error deleting user.")
                return user
        return user

    elif choice == "4":
        return None if choice == "4" else (user, plan, sessions)

    return None


def export_data(user, plan, sessions):
    """Menu for exporting data to CSV and reports."""
    print("\n--- Export Data ---")
    print("1. Export Sessions to CSV")
    print("2. Export User Profile to CSV")
    print("3. Export Workout Plan to CSV")
    print("4. Generate Progress Report")
    print("5. Back to Menu")

    choice = input("Enter your choice: ").strip()

    if choice == "1":
        if not sessions:
            print("No sessions to export.")
            return
        filepath = input("Enter filepath for CSV (default: exports/sessions.csv): ").strip()
        if not filepath:
            filepath = "exports/sessions.csv"
        export_sessions_to_csv(sessions, filepath)

    elif choice == "2":
        if not user:
            print("No user profile to export.")
            return
        filepath = input("Enter filepath for CSV (default: exports/user.csv): ").strip()
        if not filepath:
            filepath = "exports/user.csv"
        export_user_profile_to_csv(user, filepath)

    elif choice == "3":
        if not plan:
            print("No workout plan to export.")
            return
        filepath = input("Enter filepath for CSV (default: exports/plan.csv): ").strip()
        if not filepath:
            filepath = "exports/plan.csv"
        export_plan_to_csv(plan, filepath)

    elif choice == "4":
        if not user:
            print("Create a user profile first.")
            return

        # Gather analytics
        analytics_data = {}
        if sessions:
            analytics_data['personal_records'] = get_personal_records(sessions)
            analytics_data['frequency'] = get_exercise_frequency(sessions)
            analytics_data['volume_summary'] = get_total_volume_summary(sessions)
            analytics_data['muscle_groups'] = get_stats_by_muscle_group(sessions)

        filepath = input("Enter filepath for report (default: exports/progress_report.txt): ").strip()
        if not filepath:
            filepath = "exports/progress_report.txt"
        generate_progress_report(user, sessions, filepath, analytics_data)

    elif choice == "5":
        return

        print("Invalid choice.")


def main():
    user = load_user()
    plan = load_plan()
    sessions = load_sessions()

    while True:
        print("\n" + "=" * 40)
        print("         PROGRESS TRACKER MENU")
        print("=" * 40)
        print("1. Create/View User Profile")
        print("2. Create/View Workout Plan")
        print("3. Log Workout Session")
        print("4. View Workout Sessions")
        print("5. View Progress Analytics")
        print("6. Manage Data")
        print("7. Export Data")
        print("8. Exit")

        choice = input("Enter your choice: ").strip()

        if choice == "1":
            if user is None:
                user = create_user_profile()
            else:
                print(user)

        elif choice == "2":
            if user is None:
                print("Create user profile first.")
            elif plan is None:
                plan = create_workout_plan(user)
            else:
                print(plan)

        elif choice == "3":
            if plan is None:
                print("Create workout plan first.")
            else:
                sessions = log_workout_session(plan, sessions)

        elif choice == "4":
            view_sessions(sessions)

        elif choice == "5":
            view_analytics(sessions)

        elif choice == "6":
            result = manage_data(plan, sessions, user)
            if result is not None:
                sessions = load_sessions()

        elif choice == "7":
            export_data(user, plan, sessions)

        elif choice == "8":
            print("Exiting program.")
            break

        else:
            print("Invalid choice. Please choose between 1 and 8.")


if __name__ == "__main__":
    main()