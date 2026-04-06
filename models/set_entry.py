class SetEntry:
    def __init__(self,set_number,reps,weight):
        # Set number
        if not isinstance(set_number,int):
            raise ValueError("Sets Number number be an integer")
        if set_number <= 0:
            raise ValueError("Sets must be greater than 0") 
        self._set_number = set_number

        # Reps
        if not isinstance(reps,int):
            raise ValueError("Reps must be an integer")
        if reps <= 0:
            raise ValueError("Reps must be greater than 0") 
        self._reps = reps
        
        # Weight
        if not isinstance(weight,(int,float)):
            raise ValueError("Weight must be in Numbers")
        if weight < 0:
            raise ValueError("Weight must be equals or greater than 0") 
        self._weight = float(weight) 
     
    def __str__(self):
        return(
            f"Set {self._set_number} {self._reps} reps @ {self._weight:.1f} kg"
        )   
    
    @property
    def set_number(self):
        return self._set_number
    
    @property
    def reps(self):
        return self._reps
    
    @property
    def weight(self):
        return self._weight
    
    def to_dict(self):
        return{
            "set_number": self._set_number,
            "reps":self._reps,
            "weight":self._weight
        }
    
    @classmethod
    def from_dict(cls, data):
        return cls(data["set_number"], data["reps"],data["weight"])