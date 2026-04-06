from models.user_profile import UserProfile
from models.exercise import Exercise
from models.workoutday import WorkoutDay
from models.workout_plan import WorkoutPlan
from models.set_entry import SetEntry
from models.exercise_log import ExerciseLog
from models.workout_session import WorkoutSession

from storage.json_storage import (
    save_user,
    load_user,
    save_plan,
    load_plan,
    save_sessions,
    load_sessions,
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
        print("5. Exit")

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
            print("Exiting program.")
            break

        else:
            print("Invalid choice. Please choose between 1 and 5.")


if __name__ == "__main__":
    main()