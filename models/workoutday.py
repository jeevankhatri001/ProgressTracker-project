from exercise import Exercise
class WorkoutDay:
    ALLOWED_DAYS = {"sunday","monday","tuesday","wednesday","thursday","friday","saturday"}
    def __init__(self,day_name,workout_label):
        # Day Name
        if not isinstance(day_name, str):
            raise ValueError("Day name must be a string")
        day_name = day_name.strip().lower()
        if day_name not in self.ALLOWED_DAYS :
            raise ValueError(f"Day name must be {', '.join(sorted(self.ALLOWED_DAYS))}")
        self._day_name = day_name
        
        # Workout Lable
        if not isinstance(workout_label,str):
            raise ValueError("Workout Lable must be a string")
        workout_label = workout_label.strip().lower()
        if not workout_label:
            raise ValueError("Workout Lable cannot be empty")
        self._workout_label = workout_label
        
        # Exercise
        self._exercises = []
        
    def add_exercise(self, exercise):
        # Type check
        if not isinstance(exercise, Exercise):
            raise ValueError("Only Exercise objects can be added")

        # Duplicate check (based on name)
        for ex in self._exercises:
            if ex.name.lower() == exercise.name.lower():
                raise ValueError(f"{exercise.name} already exists in this workout day")

        # Add to list
        self._exercises.append(exercise)
    
    def __str__(self):
        if not self._exercises:
            exercises_str = "No exercises added"
        else:
            exercises_str = ", ".join(ex.name for ex in self._exercises)

        return (
            f"\n{'='*35}\n"
            f"         Workout Day\n"
            f"{'='*35}\n"
            f"Day name         : {self.day_name.capitalize()}\n"
            f"Workout Label    : {self.workout_label.capitalize()}\n"
            f"Exercises        : {exercises_str}\n"
            f"{'='*35}"
        )

    @property
    def day_name(self):
        return self._day_name
        
    @property
    def workout_label(self):
        return self._workout_label
        
    @property
    def exercises(self):
        return self._exercises
    
    def to_dict(self):
        return {
        "day_name": self._day_name,
        "workout_label": self._workout_label,
        "exercises": [ex.to_dict() for ex in self._exercises]
    }
    
    @classmethod
    def from_dict(cls, data):
        obj = cls(data["day_name"], data["workout_label"])

        for ex_data in data["exercises"]:
            exercise = Exercise.from_dict(ex_data)
            obj.add_exercise(exercise)

        return obj
    
    
