class Exercise:
    ALLOWED_MUSCLE_GROUPS = {
        "chest", "back", "shoulder", "biceps", "triceps",
        "legs", "calves", "glutes", "quads", "hamstring",
        "abs", "full body", "upper chest", "middle chest", "lower chest",
        "inner chest", "upper back", "middle back", "lower back", "lats",
        "upper lats", "lower lats", "traps", "front delts", "side delts", "rear delts",
        "long head biceps", "short head biceps", "brachialis",
        "all head triceps", "long head triceps", "lateral head triceps", "medial head triceps",
        "upper legs", "inner thighs", "outer thighs", "adductors",
        "gastrocnemius", "soleus", "outer calves", "upper glutes",
        "lower glutes", "glute medius", "glute max", "upper quads",
        "lower quads", "vastus medialis", "vastus lateralis",
        "rectus femoris", "upper hamstring", "lower hamstring",
        "inner hamstring", "outer hamstring", "upper abs", "lower abs",
        "obliques", "deep core"
    }

    def __init__(self, name, muscle_group, primary_muscle=None, secondary_muscle=None):
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
        self._primary_muscle = self._validate_optional_muscle(primary_muscle, "Primary muscle")
        self._secondary_muscle = self._validate_optional_muscle(secondary_muscle)

    def _validate_optional_muscle(self, muscle_group, label="Secondary muscle"):
        if muscle_group is None:
            return None
        if not isinstance(muscle_group, str):
            raise ValueError(f"{label} must be a string")
        muscle_group = muscle_group.strip().lower()
        if not muscle_group:
            return None
        if muscle_group not in self.ALLOWED_MUSCLE_GROUPS:
            raise ValueError(
                f"{label} must be one of: {', '.join(sorted(self.ALLOWED_MUSCLE_GROUPS))}"
            )
        return muscle_group

    @property
    def name(self):
        return self._name

    @property
    def muscle_group(self):
        return self._muscle_group

    @property
    def primary_muscle(self):
        return self._primary_muscle

    @property
    def secondary_muscle(self):
        return self._secondary_muscle

    def __str__(self):
        details = []
        if self._primary_muscle:
            details.append(f"primary: {self._primary_muscle}")
        if self._secondary_muscle:
            details.append(f"secondary: {self._secondary_muscle}")
        if details:
            return f"{self._name} ({self._muscle_group}, {', '.join(details)})"
        return f"{self._name} ({self._muscle_group})"



    def to_dict(self):
        return{
            "name" : self._name,
            "muscle_group":self._muscle_group,
            "primary_muscle": self._primary_muscle,
            "secondary_muscle": self._secondary_muscle
        }
    
    @classmethod
    def from_dict(cls, data):
        return cls(data["name"], data["muscle_group"], data.get("primary_muscle"), data.get("secondary_muscle"))
