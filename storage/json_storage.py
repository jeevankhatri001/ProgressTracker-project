import json
import os
from models.user_profile import UserProfile
from models.workout_plan import WorkoutPlan
from models.workout_session import WorkoutSession
# Save User Information
def save_user(user):
    if not isinstance(user,UserProfile):
        raise ValueError("Expected userProfile Object")
    with open("data/user.json","w") as f:
        json.dump(user.to_dict(),f,indent=4)
# Load user information
def load_user():
    try:
        with open("data/user.json","r")as f:
            data = json.load(f)
            return UserProfile.from_dict(data)
    except FileNotFoundError:
        return None

# save plan
def save_plan(plan):
    if not isinstance(plan,WorkoutPlan):
        raise ValueError("Expected WorkoutPlan object")
    with open("data/plan.json","w") as f:
        json.dump(plan.to_dict(),f,indent=4)
        
# load plan
def load_plan():
    try:
        with open("data/plan.json","r") as f:
            data = json.load(f)
            return WorkoutPlan.from_dict(data)
    except FileNotFoundError:
        return None
    
    
    
def save_sessions(sessions):
    if not isinstance(sessions, list):
        raise ValueError("Expected a list of WorkoutSession objects")

    for s in sessions:
        if not isinstance(s, WorkoutSession):
            raise ValueError("All items must be WorkoutSession objects")

    with open("data/session.json", "w") as f:
        json.dump([s.to_dict() for s in sessions], f, indent=4)
        
def load_sessions():
    try:
        with open("data/session.json", "r") as f:
            data = json.load(f)
            return [WorkoutSession.from_dict(d) for d in data]
    except FileNotFoundError:
        return []


# ── CRUD Helper Functions ── #

def delete_session_by_date(target_date):
    """Delete a session by date. Returns True if found and deleted, False otherwise."""
    try:
        sessions = load_sessions()
        original_count = len(sessions)
        sessions = [s for s in sessions if s.date != target_date]

        if len(sessions) < original_count:
            save_sessions(sessions)
            return True
        return False
    except Exception as e:
        print(f"Error deleting session: {e}")
        return False


def delete_session_by_index(index):
    """Delete a session by index (0-based). Returns True if found and deleted, False otherwise."""
    try:
        sessions = load_sessions()
        if 0 <= index < len(sessions):
            del sessions[index]
            save_sessions(sessions)
            return True
        return False
    except Exception as e:
        print(f"Error deleting session: {e}")
        return False


def edit_session_by_date(target_date, updated_session):
    """Replace an existing session by date. Returns True if found and updated, False otherwise."""
    try:
        if not isinstance(updated_session, WorkoutSession):
            raise ValueError("Expected WorkoutSession object")

        sessions = load_sessions()
        for i, s in enumerate(sessions):
            if s.date == target_date:
                sessions[i] = updated_session
                save_sessions(sessions)
                return True
        return False
    except Exception as e:
        print(f"Error editing session: {e}")
        return False


def delete_plan():
    """Delete the workout plan file. Returns True if successful, False otherwise."""
    try:
        if os.path.exists("data/plan.json"):
            os.remove("data/plan.json")
            return True
        return False
    except Exception as e:
        print(f"Error deleting plan: {e}")
        return False


def delete_user():
    """Delete the user profile file. Returns True if successful, False otherwise."""
    try:
        if os.path.exists("data/user.json"):
            os.remove("data/user.json")
            return True
        return False
    except Exception as e:
        print(f"Error deleting user: {e}")
        return False


def find_sessions_by_date(target_date):
    """Find all sessions on a specific date. Returns list of WorkoutSession objects."""
    try:
        sessions = load_sessions()
        return [s for s in sessions if s.date == target_date]
    except Exception:
        return []


def find_sessions_by_label(label):
    """Find all sessions by workout label. Returns list of WorkoutSession objects."""
    try:
        sessions = load_sessions()
        return [s for s in sessions if s.workout_label.lower() == label.lower()]
    except Exception:
        return []