// User Profile Types
export interface UserProfile {
  name: string;
  age: number;
  sex: "male" | "female" | "prefer not to say";
  weight: number;
  height: number;
  training_experience_years: number;
  training_days_per_week: number;
  bmi: number;
  bmi_category: string;
  experience_level: string;
}

// Exercise Types
export interface Exercise {
  name: string;
  muscle_group: string;
}

// Set Entry Types
export interface SetEntry {
  set_number: number;
  reps: number;
  weight: number;
}

// Exercise Log Types
export interface ExerciseLog {
  exercise: Exercise;
  sets: SetEntry[];
}

// Workout Day Types
export interface WorkoutDay {
  day_name: string;
  workout_label: string;
  exercises: Exercise[];
}

// Workout Plan Types
export interface WorkoutPlan {
  plan_name: string;
  workout_days: WorkoutDay[];
}

// Workout Session Types
export interface WorkoutSession {
  date: string;
  day_name: string;
  workout_label: string;
  exercise_logs: ExerciseLog[];
}

// Analytics Types
export interface PersonalRecord {
  exercise: string;
  max_weight: number;
  reps: number;
  date: string;
}

export interface ProgressionEntry {
  date: string;
  weight: number;
  reps: number;
  set_num: number;
}

export interface MuscleGroupStats {
  name: string;
  total_sets: number;
  total_volume: number;
  total_reps: number;
  exercises: string[];
}

export interface VolumeSummary {
  total_volume: number;
  avg_per_session: number;
  num_sessions: number;
}

export interface StrengthProgress {
  exercise: string;
  improved: boolean;
  prev_max: number;
  current_max: number;
  improvement: number;
}

export interface ExerciseFrequency {
  exercise: string;
  count: number;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  detail?: string;
  message?: string;
}
