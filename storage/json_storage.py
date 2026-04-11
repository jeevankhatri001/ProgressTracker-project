import json
import os
import re
from models.user_profile import UserProfile
from models.workout_plan import WorkoutPlan
from models.workout_session import WorkoutSession

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
USER_FILE = os.path.join(DATA_DIR, "user.json")
PLAN_FILE = os.path.join(DATA_DIR, "plan.json")
SESSION_FILE = os.path.join(DATA_DIR, "session.json")
USERS_DIR = os.path.join(DATA_DIR, "users")


def normalize_user_id(user_id=None):
    if not user_id:
        return "default"
    normalized = re.sub(r"[^a-zA-Z0-9_-]+", "-", str(user_id).strip().lower()).strip("-")
    return normalized or "default"


def get_user_dir(user_id=None):
    return os.path.join(USERS_DIR, normalize_user_id(user_id))


def get_user_file(user_id=None, filename="user.json"):
    if normalize_user_id(user_id) == "default":
        return os.path.join(DATA_DIR, filename)
    return os.path.join(get_user_dir(user_id), filename)


def ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(USERS_DIR, exist_ok=True)


def ensure_user_dir(user_id=None):
    ensure_data_dir()
    os.makedirs(get_user_dir(user_id), exist_ok=True)


# Save User Information
def save_user(user, user_id=None):
    if not isinstance(user,UserProfile):
        raise ValueError("Expected userProfile Object")
    ensure_user_dir(user_id)
    with open(get_user_file(user_id, "user.json"),"w") as f:
        json.dump(user.to_dict(),f,indent=4)
# Load user information
def load_user(user_id=None):
    try:
        with open(get_user_file(user_id, "user.json"),"r")as f:
            data = json.load(f)
            return UserProfile.from_dict(data)
    except FileNotFoundError:
        return None

# save plan
def save_plan(plan, user_id=None):
    if not isinstance(plan,WorkoutPlan):
        raise ValueError("Expected WorkoutPlan object")
    ensure_user_dir(user_id)
    with open(get_user_file(user_id, "plan.json"),"w") as f:
        json.dump(plan.to_dict(),f,indent=4)
        
# load plan
def load_plan(user_id=None):
    try:
        with open(get_user_file(user_id, "plan.json"),"r") as f:
            data = json.load(f)
            return WorkoutPlan.from_dict(data)
    except FileNotFoundError:
        return None
    
    
    
def save_sessions(sessions, user_id=None):
    if not isinstance(sessions, list):
        raise ValueError("Expected a list of WorkoutSession objects")

    for s in sessions:
        if not isinstance(s, WorkoutSession):
            raise ValueError("All items must be WorkoutSession objects")

    ensure_user_dir(user_id)
    with open(get_user_file(user_id, "session.json"), "w") as f:
        json.dump([s.to_dict() for s in sessions], f, indent=4)
        
def load_sessions(user_id=None):
    try:
        with open(get_user_file(user_id, "session.json"), "r") as f:
            data = json.load(f)
            return [WorkoutSession.from_dict(d) for d in data]
    except FileNotFoundError:
        return []


# ── CRUD Helper Functions ── #

def delete_session_by_date(target_date, user_id=None):
    """Delete a session by date. Returns True if found and deleted, False otherwise."""
    try:
        sessions = load_sessions(user_id)
        original_count = len(sessions)
        sessions = [s for s in sessions if s.date != target_date]

        if len(sessions) < original_count:
            save_sessions(sessions, user_id)
            return True
        return False
    except Exception as e:
        print(f"Error deleting session: {e}")
        return False


def delete_session_by_index(index, user_id=None):
    """Delete a session by index (0-based). Returns True if found and deleted, False otherwise."""
    try:
        sessions = load_sessions(user_id)
        if 0 <= index < len(sessions):
            del sessions[index]
            save_sessions(sessions, user_id)
            return True
        return False
    except Exception as e:
        print(f"Error deleting session: {e}")
        return False


def edit_session_by_date(target_date, updated_session, user_id=None):
    """Replace an existing session by date. Returns True if found and updated, False otherwise."""
    try:
        if not isinstance(updated_session, WorkoutSession):
            raise ValueError("Expected WorkoutSession object")

        sessions = load_sessions(user_id)
        for i, s in enumerate(sessions):
            if s.date == target_date:
                sessions[i] = updated_session
                save_sessions(sessions, user_id)
                return True
        return False
    except Exception as e:
        print(f"Error editing session: {e}")
        return False


def delete_plan(user_id=None):
    """Delete the workout plan file. Returns True if successful, False otherwise."""
    try:
        plan_file = get_user_file(user_id, "plan.json")
        if os.path.exists(plan_file):
            os.remove(plan_file)
            return True
        return False
    except Exception as e:
        print(f"Error deleting plan: {e}")
        return False


def delete_user(user_id=None):
    """Delete the user profile file. Returns True if successful, False otherwise."""
    try:
        user_file = get_user_file(user_id, "user.json")
        if os.path.exists(user_file):
            os.remove(user_file)
            return True
        return False
    except Exception as e:
        print(f"Error deleting user: {e}")
        return False


def find_sessions_by_date(target_date, user_id=None):
    """Find all sessions on a specific date. Returns list of WorkoutSession objects."""
    try:
        sessions = load_sessions(user_id)
        return [s for s in sessions if s.date == target_date]
    except Exception:
        return []


def find_sessions_by_label(label, user_id=None):
    """Find all sessions by workout label. Returns list of WorkoutSession objects."""
    try:
        sessions = load_sessions(user_id)
        return [s for s in sessions if s.workout_label.lower() == label.lower()]
    except Exception:
        return []
