class UserProfile:
    ALLOWED_SEX = {"male", "female", "prefer not to say"}

    def __init__(self, name, age, sex, weight, height,
                 training_experience_years, training_days_per_week):

        # Name
        name = name.strip()
        if not name:
            raise ValueError("Name cannot be empty")
        self._name = name

        # Age
        if not isinstance(age, int) or age <= 0:
            raise ValueError("Age must be a positive integer")
        self._age = age

        # Sex
        sex = sex.strip().lower()
        if sex not in self.ALLOWED_SEX:
            raise ValueError(f"Sex must be one of: {self.ALLOWED_SEX}")
        self._sex = sex

        # Weight
        if not isinstance(weight, (int, float)) or weight <= 0:
            raise ValueError("Weight must be a positive number")
        self._weight = float(weight)

        # Height
        if not isinstance(height, (int, float)) or height <= 0:
            raise ValueError("Height must be a positive number")
        self._height = float(height)

        # Training experience
        if not isinstance(training_experience_years, (int, float)) or training_experience_years < 0:
            raise ValueError("Experience must be >= 0")
        self._training_experience_years = float(training_experience_years)

        # Training days
        if not isinstance(training_days_per_week, int) or not (1 <= training_days_per_week <= 7):
            raise ValueError("Training days must be between 1 and 7")
        self._training_days_per_week = training_days_per_week

    # ── Properties 

    @property
    def name(self):
        return self._name

    @property
    def age(self):
        return self._age

    @property
    def sex(self):
        return self._sex

    @property
    def weight(self):
        return self._weight

    @property
    def height(self):
        return self._height

    @property
    def training_experience_years(self):
        return self._training_experience_years

    @property
    def training_days_per_week(self):
        return self._training_days_per_week

    # ── Calculated Properties ──────────────────────────────────────

    @property
    def bmi(self):
        """Body Mass Index = weight(kg) / height(m)^2"""
        return round(self._weight / (self._height ** 2), 2)

    @property
    def bmi_category(self):
        if self.bmi < 18.5:
            return "Underweight"
        elif self.bmi < 25:
            return "Normal"
        elif self.bmi < 30:
            return "Overweight"
        else:
            return "Obese"

    @property
    def experience_level(self):
        if self._training_experience_years < 1:
            return "Beginner"
        elif self._training_experience_years < 3:
            return "Intermediate"
        else:
            return "Advanced"

    # ── Class Method for User Input ────────────────────────────────

    @classmethod
    def from_input(cls):
        """Create a UserProfile by taking input from the user."""
        print("\n--- Create User Profile ---")
        try:
            name     = input("Enter name: ")
            age      = int(input("Enter age: "))
            sex      = input("Enter sex (male / female / prefer not to say): ")
            weight   = float(input("Enter weight (kg): "))
            height   = float(input("Enter height (m): "))
            exp      = float(input("Enter training experience (years): "))
            days     = int(input("Enter training days per week (1-7): "))
        except ValueError:
            raise ValueError("Invalid input type entered")

        return cls(name, age, sex, weight, height, exp, days)

    # ── Dunder Methods ─────────────────────────────────────────────

    def __str__(self):
        return (
            f"\n{'='*35}\n"
            f"         USER PROFILE\n"
            f"{'='*35}\n"
            f"  Name        : {self._name}\n"
            f"  Age         : {self._age}\n"
            f"  Sex         : {self._sex.title()}\n"
            f"  Weight      : {self._weight} kg\n"
            f"  Height      : {self._height} m\n"
            f"  BMI         : {self.bmi} ({self.bmi_category})\n"
            f"  Experience  : {self._training_experience_years} yrs "
            f"({self.experience_level})\n"
            f"  Train Days  : {self._training_days_per_week}/week\n"
            f"{'='*35}"
        )

    def __repr__(self):
        return (
            f"UserProfile(name={self._name!r}, age={self._age}, "
            f"sex={self._sex!r}, weight={self._weight}, "
            f"height={self._height}, "
            f"training_experience_years={self._training_experience_years}, "
            f"training_days_per_week={self._training_days_per_week})"
        )

    def __eq__(self, other):
        if not isinstance(other, UserProfile):
            return False
        return self._name == other._name and self._age == other._age

    def to_dict(self):
        return {
            "name": self._name,
            "age": self._age,
            "sex": self._sex,
            "weight": self._weight,
            "height": self._height,
            "training_experience_years": self._training_experience_years,
            "training_days_per_week": self._training_days_per_week
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            data["name"],
            data["age"],
            data["sex"],
            data["weight"],
            data["height"],
            data["training_experience_years"],
            data["training_days_per_week"]
        )
