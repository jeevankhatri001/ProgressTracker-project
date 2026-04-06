from models.exercise_log import ExerciseLog
class WorkoutSession:
    ALLOWED_DAYS = {"sunday","monday","tuesday","wednesday","thursday","friday","saturday"}
    def __init__(self,date,day_name,workout_label):
        # Date
        if not isinstance(date,str) :
            raise ValueError("Date must be in String")
        date = date.strip()
        if not date:
            raise ValueError("Date must not be emptry")
        self._date = date

        # Day Name
        if not isinstance(day_name, str):
            raise ValueError("Day name must be a string")
        day_name = day_name.strip().lower()
        if day_name not in self.ALLOWED_DAYS :
            raise ValueError(f"Day name must be {', '.join(sorted(self.ALLOWED_DAYS))}")
        self._day_name = day_name   
        
        # Workout label
        if not isinstance(workout_label,str):
            raise ValueError("Workout Lable must be a string")
        workout_label = workout_label.strip().lower()
        if not workout_label:
            raise ValueError("Workout Lable cannot be empty")
        self._workout_label = workout_label
        
        self._exercise_logs = []
        
    def add_exercise_log(self,exercise_log):
        if not isinstance(exercise_log, ExerciseLog):
            raise ValueError("Only ExerciseLog objects can be added")

        # Duplicate check (based on name)
        for ex in self._exercise_logs:
            if ex.name.lower() == exercise_log._exercise._name.lower():
                raise ValueError(f"{exercise_log.name} already exists in this session")

        # Add to list
        self._exercise_logs.append(exercise_log)
    
    def __str__(self):
        result = (
              f"\n{'='*35}\n"
            f"         Workout Session\n"     
            f"         Date: {self._date.capitalize()}\n"
            f"         Day: {self._day_name.capitalize()}\n"
            f"         Label:{self._workout_label}\n"
            f"{'='*35}"
        )
        for exercise_log in self._exercise_logs:
            result += str(exercise_log) + "\n"
        
        return result
        
    @property
    def date(self):
        return self._date
    
    @property
    def day_name(self):
        return self._day_name
    
    @property
    def workout_label(self):
        return self._workout_label
    
    @property
    def exercise_logs(self):
        return self._exercise_logs
    
    def to_dict(self):
        return {
        "date": self._date,
        "day_name": self._day_name,
        "workout_label": self._workout_label,
        "exercise_logs": [log.to_dict() for log in self._exercise_logs]
    }
    @classmethod
    def from_dict(cls, data):
        # Create session object
        obj = cls(
            data["date"],
            data["day_name"],
            data["workout_label"]
        )

        # Rebuild ExerciseLogs
        for log_data in data["exercise_logs"]:
            exercise_log = ExerciseLog.from_dict(log_data)
            obj.add_exercise_log(exercise_log)

        return obj    