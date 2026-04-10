class Exercise:
    ALLOWED_MUSCLE_GROUPS = {
        "chest", "back", "shoulder", "biceps", "triceps",
        "legs", "calves", "glutes", "quads", "hamstring",
        "abs", "full body"
    }

    def __init__(self, name, muscle_group):
        # Exercise name
        if not isinstance(name, str):
            raise ValueError("Exercise name must be a string")
        name = name.strip()
        if not name:
            raise ValueError("Exercise name cannot be empty")
        self._name = name

        # Muscle group
        if not isinstance(muscle_group, str):
            raise ValueError("Muscle group must be a string")
        muscle_group = muscle_group.strip().lower()
        if muscle_group not in self.ALLOWED_MUSCLE_GROUPS:
            raise ValueError(
                f"Muscle group must be one of: {', '.join(sorted(self.ALLOWED_MUSCLE_GROUPS))}"
            )
        self._muscle_group = muscle_group

    @property
    def name(self):
        return self._name

    @property
    def muscle_group(self):
        return self._muscle_group

    def __str__(self):
        return f"{self._name} ({self._muscle_group})"



    def to_dict(self):
        return{
            "name" : self._name,
            "muscle_group":self._muscle_group
        }
    
    @classmethod
    def from_dict(cls, data):
        return cls(data["name"], data["muscle_group"])