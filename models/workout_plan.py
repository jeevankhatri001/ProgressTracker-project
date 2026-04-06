from models.workoutday import WorkoutDay
class WorkoutPlan:
    def __init__(self,plan_name):
        # Workout Plan Name
        if not isinstance(plan_name,str):
            raise ValueError("Plan name must be in string")
        plan_name = plan_name.strip()
        if not plan_name:
            raise ValueError("Plan name cannot be empty")
        self._plan_name = plan_name
        
        self._workout_days = []
        
    def add_workout_day(self,workout_day):
        if not isinstance(workout_day,WorkoutDay):
            raise ValueError("Only WorkoutDay object can be added")

        for w_day in self._workout_days:
            if w_day.day_name == workout_day.day_name:
                raise ValueError(f"{workout_day.day_name} already exists")
        self._workout_days.append(workout_day)
    
    def __str__(self):
        result= (
            f"\n{'='*35}\n"
            f"         Workout Plan:{self._plan_name}\n"     
            f"{'='*35}"
        )
        for w_day in self._workout_days:
            result += f"{w_day.day_name.capitalize()} - {w_day.workout_label.capitalize()}\n"
        
        return result
             
    @property
    def plan_name(self):
        return self._plan_name   
    
    @property
    def workout_days(self):
        return self._workout_days
    
    def to_dict(self):
        return{
            "plan_name" : self._plan_name,
             "workout_days": [w_day.to_dict() for w_day in self._workout_days]
        }
 

    @classmethod
    def from_dict(cls, data):
        obj = cls(data["plan_name"])

        for ex_data in data["workout_days"]:
            workout_day = WorkoutDay.from_dict(ex_data)
            obj.add_workout_day(workout_day)

        return obj

