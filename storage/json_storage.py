import json
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