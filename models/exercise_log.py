from models.exercise import Exercise
from models.set_entry import SetEntry
class ExerciseLog:
    def __init__(self,exercise):
        if not isinstance(exercise,Exercise):
            raise ValueError("ExerciseLog must be initialized with an Exercise object")
        
        self._exercise = exercise
        
        self._set_entries = []
    
    def add_set(self,set_entry):
        if not isinstance(set_entry,SetEntry):
            raise ValueError("only SetEntry object can be added ")
        for set_e in self._set_entries:
            if set_e.set_number == set_entry.set_number:
               raise ValueError(f"Set {set_entry.set_number} already exists") 
        self._set_entries.append(set_entry)
     
    def __str__(self):
        result = (
              f"\n{'='*35}\n"
            f"         {self._exercise.name}:{self._exercise.muscle_group}\n"     
            f"{'='*35}"
        )
        for set_entry in self._set_entries:
            result += str(set_entry) + "\n"

        return result
    
    @property
    def exercise(self):
        return self._exercise
    
    @property
    def set_entry(self):
        return self._set_entries

    def to_dict(self):
        return{
            "exercise" : self._exercise.to_dict(),
            "sets": [set_entry.to_dict() for set_entry in self._set_entries]
        }
    
    @classmethod
    def from_dict(cls, data):
        # Rebuild Exercise
        exercise = Exercise.from_dict(data["exercise"])

        # Create ExerciseLog object
        obj = cls(exercise)

        # Rebuild SetEntry list
        for set_data in data["sets"]:
            set_entry = SetEntry.from_dict(set_data)
            obj.add_set(set_entry)

        return obj
        