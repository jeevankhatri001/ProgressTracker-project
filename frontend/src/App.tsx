import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from './services/api';
import type { Exercise, SetEntry, UserProfile, WorkoutDay, WorkoutPlan, WorkoutSession } from './types';

type Page = 'dashboard' | 'plan' | 'log' | 'history' | 'analytics' | 'export' | 'settings';

type ProfileFormState = {
  name: string;
  age: string;
  sex: UserProfile['sex'];
  weight: string;
  height: string;
  training_experience_years: string;
  training_days_per_week: string;
};

type SessionEntryForm = {
  exercise: Exercise;
  sets: SetEntry[];
};

type SessionFormState = {
  date: string;
  workoutDayName: string;
  entries: SessionEntryForm[];
};

type EditableExercise = {
  name: string;
  muscle_group: string;
};

type EditableWorkoutDay = {
  id: string;
  day_name: string;
  workout_label: string;
  exercises: EditableExercise[];
};

type CustomPlanState = {
  plan_name: string;
  workout_days: EditableWorkoutDay[];
};

type AppNotice = {
  kind: 'success' | 'error';
  message: string;
} | null;

const pages: Array<{ id: Page; label: string; eyebrow: string }> = [
  { id: 'dashboard', label: 'Dashboard', eyebrow: 'Snapshot' },
  { id: 'plan', label: 'Plan Studio', eyebrow: 'Structure' },
  { id: 'log', label: 'Log Session', eyebrow: 'Training' },
  { id: 'history', label: 'History', eyebrow: 'Archive' },
  { id: 'analytics', label: 'Analytics', eyebrow: 'Progress' },
  { id: 'export', label: 'Export', eyebrow: 'Backups' },
  { id: 'settings', label: 'Settings', eyebrow: 'Control' },
];

const sexOptions: UserProfile['sex'][] = ['male', 'female', 'prefer not to say'];

const presetSeeds: Record<number, { name: string; days: WorkoutDay[] }> = {
  2: {
    name: 'Upper / Lower',
    days: [
      {
        day_name: 'Monday',
        workout_label: 'Upper',
        exercises: [
          { name: 'Bench Press', muscle_group: 'chest' },
          { name: 'Seated Row', muscle_group: 'back' },
          { name: 'Overhead Press', muscle_group: 'shoulder' },
          { name: 'EZ Bar Curl', muscle_group: 'biceps' },
          { name: 'Tricep Pushdown', muscle_group: 'triceps' },
        ],
      },
      {
        day_name: 'Thursday',
        workout_label: 'Lower',
        exercises: [
          { name: 'Back Squat', muscle_group: 'quads' },
          { name: 'Romanian Deadlift', muscle_group: 'hamstring' },
          { name: 'Walking Lunge', muscle_group: 'glutes' },
          { name: 'Leg Press Calf Raise', muscle_group: 'calves' },
          { name: 'Hanging Knee Raise', muscle_group: 'abs' },
        ],
      },
    ],
  },
  3: {
    name: 'Full Body Rotation',
    days: [
      {
        day_name: 'Monday',
        workout_label: 'Full Body A',
        exercises: [
          { name: 'Back Squat', muscle_group: 'quads' },
          { name: 'Bench Press', muscle_group: 'chest' },
          { name: 'Barbell Row', muscle_group: 'back' },
          { name: 'Dumbbell Lateral Raise', muscle_group: 'shoulder' },
          { name: 'Cable Crunch', muscle_group: 'abs' },
        ],
      },
      {
        day_name: 'Wednesday',
        workout_label: 'Full Body B',
        exercises: [
          { name: 'Romanian Deadlift', muscle_group: 'hamstring' },
          { name: 'Incline Dumbbell Press', muscle_group: 'chest' },
          { name: 'Lat Pulldown', muscle_group: 'back' },
          { name: 'Bulgarian Split Squat', muscle_group: 'glutes' },
          { name: 'Hammer Curl', muscle_group: 'biceps' },
        ],
      },
      {
        day_name: 'Friday',
        workout_label: 'Full Body C',
        exercises: [
          { name: 'Leg Press', muscle_group: 'quads' },
          { name: 'Push Up', muscle_group: 'chest' },
          { name: 'Chest Supported Row', muscle_group: 'back' },
          { name: 'Overhead Press', muscle_group: 'shoulder' },
          { name: 'Tricep Pushdown', muscle_group: 'triceps' },
        ],
      },
    ],
  },
  4: {
    name: 'Upper / Lower Builder',
    days: [
      {
        day_name: 'Monday',
        workout_label: 'Upper Strength',
        exercises: [
          { name: 'Bench Press', muscle_group: 'chest' },
          { name: 'Pull Up', muscle_group: 'back' },
          { name: 'Overhead Press', muscle_group: 'shoulder' },
          { name: 'Barbell Curl', muscle_group: 'biceps' },
          { name: 'Dips', muscle_group: 'triceps' },
        ],
      },
      {
        day_name: 'Tuesday',
        workout_label: 'Lower Strength',
        exercises: [
          { name: 'Back Squat', muscle_group: 'quads' },
          { name: 'Romanian Deadlift', muscle_group: 'hamstring' },
          { name: 'Hip Thrust', muscle_group: 'glutes' },
          { name: 'Standing Calf Raise', muscle_group: 'calves' },
          { name: 'Plank', muscle_group: 'abs' },
        ],
      },
      {
        day_name: 'Thursday',
        workout_label: 'Upper Volume',
        exercises: [
          { name: 'Incline Dumbbell Press', muscle_group: 'chest' },
          { name: 'Seated Cable Row', muscle_group: 'back' },
          { name: 'Lateral Raise', muscle_group: 'shoulder' },
          { name: 'Hammer Curl', muscle_group: 'biceps' },
          { name: 'Overhead Tricep Extension', muscle_group: 'triceps' },
        ],
      },
      {
        day_name: 'Friday',
        workout_label: 'Lower Volume',
        exercises: [
          { name: 'Front Squat', muscle_group: 'quads' },
          { name: 'Leg Curl', muscle_group: 'hamstring' },
          { name: 'Walking Lunge', muscle_group: 'glutes' },
          { name: 'Seated Calf Raise', muscle_group: 'calves' },
          { name: 'Hanging Leg Raise', muscle_group: 'abs' },
        ],
      },
    ],
  },
  5: {
    name: 'Push Pull Legs Plus',
    days: [
      {
        day_name: 'Monday',
        workout_label: 'Push',
        exercises: [
          { name: 'Bench Press', muscle_group: 'chest' },
          { name: 'Incline Dumbbell Press', muscle_group: 'chest' },
          { name: 'Overhead Press', muscle_group: 'shoulder' },
          { name: 'Lateral Raise', muscle_group: 'shoulder' },
          { name: 'Tricep Pushdown', muscle_group: 'triceps' },
        ],
      },
      {
        day_name: 'Tuesday',
        workout_label: 'Pull',
        exercises: [
          { name: 'Deadlift', muscle_group: 'back' },
          { name: 'Lat Pulldown', muscle_group: 'back' },
          { name: 'Seated Row', muscle_group: 'back' },
          { name: 'Face Pull', muscle_group: 'shoulder' },
          { name: 'Hammer Curl', muscle_group: 'biceps' },
        ],
      },
      {
        day_name: 'Wednesday',
        workout_label: 'Legs',
        exercises: [
          { name: 'Back Squat', muscle_group: 'quads' },
          { name: 'Romanian Deadlift', muscle_group: 'hamstring' },
          { name: 'Leg Press', muscle_group: 'quads' },
          { name: 'Hip Thrust', muscle_group: 'glutes' },
          { name: 'Standing Calf Raise', muscle_group: 'calves' },
        ],
      },
      {
        day_name: 'Friday',
        workout_label: 'Upper Detail',
        exercises: [
          { name: 'Incline Bench Press', muscle_group: 'chest' },
          { name: 'Chest Supported Row', muscle_group: 'back' },
          { name: 'Arnold Press', muscle_group: 'shoulder' },
          { name: 'Cable Curl', muscle_group: 'biceps' },
          { name: 'Skull Crusher', muscle_group: 'triceps' },
        ],
      },
      {
        day_name: 'Saturday',
        workout_label: 'Lower Detail',
        exercises: [
          { name: 'Front Squat', muscle_group: 'quads' },
          { name: 'Leg Curl', muscle_group: 'hamstring' },
          { name: 'Walking Lunge', muscle_group: 'glutes' },
          { name: 'Seated Calf Raise', muscle_group: 'calves' },
          { name: 'Cable Crunch', muscle_group: 'abs' },
        ],
      },
    ],
  },
  6: {
    name: 'Push Pull Legs Double',
    days: [
      {
        day_name: 'Monday',
        workout_label: 'Push A',
        exercises: [
          { name: 'Bench Press', muscle_group: 'chest' },
          { name: 'Overhead Press', muscle_group: 'shoulder' },
          { name: 'Incline Dumbbell Press', muscle_group: 'chest' },
          { name: 'Cable Lateral Raise', muscle_group: 'shoulder' },
          { name: 'Tricep Dip', muscle_group: 'triceps' },
        ],
      },
      {
        day_name: 'Tuesday',
        workout_label: 'Pull A',
        exercises: [
          { name: 'Deadlift', muscle_group: 'back' },
          { name: 'Pull Up', muscle_group: 'back' },
          { name: 'Barbell Row', muscle_group: 'back' },
          { name: 'Rear Delt Fly', muscle_group: 'shoulder' },
          { name: 'EZ Bar Curl', muscle_group: 'biceps' },
        ],
      },
      {
        day_name: 'Wednesday',
        workout_label: 'Legs A',
        exercises: [
          { name: 'Back Squat', muscle_group: 'quads' },
          { name: 'Romanian Deadlift', muscle_group: 'hamstring' },
          { name: 'Walking Lunge', muscle_group: 'glutes' },
          { name: 'Standing Calf Raise', muscle_group: 'calves' },
          { name: 'Ab Wheel', muscle_group: 'abs' },
        ],
      },
      {
        day_name: 'Friday',
        workout_label: 'Push B',
        exercises: [
          { name: 'Incline Bench Press', muscle_group: 'chest' },
          { name: 'Arnold Press', muscle_group: 'shoulder' },
          { name: 'Machine Chest Press', muscle_group: 'chest' },
          { name: 'Lateral Raise', muscle_group: 'shoulder' },
          { name: 'Rope Pushdown', muscle_group: 'triceps' },
        ],
      },
      {
        day_name: 'Saturday',
        workout_label: 'Pull B',
        exercises: [
          { name: 'Chest Supported Row', muscle_group: 'back' },
          { name: 'Lat Pulldown', muscle_group: 'back' },
          { name: 'Single Arm Row', muscle_group: 'back' },
          { name: 'Face Pull', muscle_group: 'shoulder' },
          { name: 'Hammer Curl', muscle_group: 'biceps' },
        ],
      },
      {
        day_name: 'Sunday',
        workout_label: 'Legs B',
        exercises: [
          { name: 'Front Squat', muscle_group: 'quads' },
          { name: 'Leg Curl', muscle_group: 'hamstring' },
          { name: 'Hip Thrust', muscle_group: 'glutes' },
          { name: 'Seated Calf Raise', muscle_group: 'calves' },
          { name: 'Cable Crunch', muscle_group: 'abs' },
        ],
      },
    ],
  },
};

const todayIso = new Date().toISOString().slice(0, 10);
const weekdayOptions = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const muscleGroupOptions = ['chest', 'back', 'shoulder', 'biceps', 'triceps', 'legs', 'calves', 'glutes', 'quads', 'hamstring', 'abs', 'full body'];

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createDefaultProfileForm(): ProfileFormState {
  return {
    name: '',
    age: '20',
    sex: 'male',
    weight: '72',
    height: '172',
    training_experience_years: '1',
    training_days_per_week: '4',
  };
}

function normalizeHeightMeters(height: number): number {
  return height > 10 ? height / 100 : height;
}

function heightForDisplay(height: number): string {
  return `${Math.round(normalizeHeightMeters(height) * 100)} cm`;
}

function getDisplayBmi(profile: UserProfile): { bmi: number; category: string } {
  const normalizedHeight = normalizeHeightMeters(profile.height);
  const bmi = Number((profile.weight / (normalizedHeight * normalizedHeight)).toFixed(1));
  if (bmi < 18.5) {
    return { bmi, category: 'Underweight' };
  }
  if (bmi < 25) {
    return { bmi, category: 'Normal' };
  }
  if (bmi < 30) {
    return { bmi, category: 'Overweight' };
  }
  return { bmi, category: 'Obese' };
}

function formatDateLabel(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function formatShortDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date);
}

function toTitleCase(value: string): string {
  return value
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function sumSessionVolume(session: WorkoutSession): number {
  return session.exercise_logs.reduce(
    (sessionSum, exerciseLog) =>
      sessionSum + exerciseLog.sets.reduce((setSum, setEntry) => setSum + setEntry.weight * setEntry.reps, 0),
    0,
  );
}

function sumSessionSets(session: WorkoutSession): number {
  return session.exercise_logs.reduce((sessionSum, exerciseLog) => sessionSum + exerciseLog.sets.length, 0);
}

function buildSessionForm(day: WorkoutDay): SessionFormState {
  return {
    date: todayIso,
    workoutDayName: day.day_name,
    entries: day.exercises.map((exercise) => ({
      exercise,
      sets: Array.from({ length: 3 }, (_, index) => ({ set_number: index + 1, reps: 10, weight: 0 })),
    })),
  };
}

function createPresetPlan(daysPerWeek: number): WorkoutPlan {
  const safeDays = Math.max(2, Math.min(6, daysPerWeek));
  const seed = presetSeeds[safeDays];
  return { plan_name: `${seed.name} Split`, workout_days: seed.days };
}

function createCustomPlan(daysPerWeek: number): CustomPlanState {
  const safeDays = Math.max(1, Math.min(7, daysPerWeek || 4));
  return {
    plan_name: 'My Split',
    workout_days: Array.from({ length: safeDays }, (_, index) => ({
      id: createId(),
      day_name: weekdayOptions[index % weekdayOptions.length],
      workout_label: `Day ${index + 1}`,
      exercises: [
        { name: '', muscle_group: 'full body' },
        { name: '', muscle_group: 'full body' },
      ],
    })),
  };
}

function sanitizeCustomPlan(planState: CustomPlanState): WorkoutPlan {
  return {
    plan_name: planState.plan_name.trim() || 'My Split',
    workout_days: planState.workout_days
      .map((day) => ({
        day_name: day.day_name.trim(),
        workout_label: day.workout_label.trim() || day.day_name.trim(),
        exercises: day.exercises
          .map((exercise) => ({
            name: exercise.name.trim(),
            muscle_group: exercise.muscle_group.trim().toLowerCase(),
          }))
          .filter((exercise) => exercise.name.length > 0),
      }))
      .filter((day) => day.day_name.length > 0 && day.exercises.length > 0),
  };
}

function deriveAnalytics(sessions: WorkoutSession[]) {
  const sortedSessions = [...sessions].sort((a, b) => a.date.localeCompare(b.date));
  const uniqueExercises = new Set<string>();
  const records = new Map<string, { exercise: string; maxWeight: number; reps: number; date: string }>();
  const muscleGroups = new Map<string, number>();

  sortedSessions.forEach((session) => {
    session.exercise_logs.forEach((log) => {
      uniqueExercises.add(log.exercise.name);
      muscleGroups.set(log.exercise.muscle_group, (muscleGroups.get(log.exercise.muscle_group) ?? 0) + log.sets.length);

      log.sets.forEach((setEntry) => {
        const current = records.get(log.exercise.name);
        if (!current || setEntry.weight > current.maxWeight) {
          records.set(log.exercise.name, {
            exercise: log.exercise.name,
            maxWeight: setEntry.weight,
            reps: setEntry.reps,
            date: session.date,
          });
        }
      });
    });
  });

  return {
    totalVolume: sortedSessions.reduce((total, session) => total + sumSessionVolume(session), 0),
    averageVolume: sortedSessions.length
      ? sortedSessions.reduce((total, session) => total + sumSessionVolume(session), 0) / sortedSessions.length
      : 0,
    uniqueExerciseCount: uniqueExercises.size,
    timeline: sortedSessions.map((session) => ({
      date: formatShortDate(session.date),
      volume: Math.round(sumSessionVolume(session)),
      sets: sumSessionSets(session),
      exercises: session.exercise_logs.length,
    })),
    muscleBreakdown: [...muscleGroups.entries()]
      .map(([name, totalSets]) => ({ name: toTitleCase(name), totalSets }))
      .sort((a, b) => b.totalSets - a.totalSets),
    topRecords: [...records.values()].sort((a, b) => b.maxWeight - a.maxWeight).slice(0, 6),
  };
}

export default function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyLabel, setBusyLabel] = useState<string | null>(null);
  const [notice, setNotice] = useState<AppNotice>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormState>(createDefaultProfileForm);
  const [sessionForm, setSessionForm] = useState<SessionFormState | null>(null);
  const [customPlan, setCustomPlan] = useState<CustomPlanState>(createCustomPlan(4));

  const analytics = useMemo(() => deriveAnalytics(sessions), [sessions]);
  const recommendedPlan = useMemo(() => {
    const requestedDays = Number(profileForm.training_days_per_week || user?.training_days_per_week || 4);
    return createPresetPlan(requestedDays);
  }, [profileForm.training_days_per_week, user?.training_days_per_week]);

  useEffect(() => {
    const requestedDays = Number(profileForm.training_days_per_week || user?.training_days_per_week || 4);
    setCustomPlan((current) =>
      current.workout_days.length ? current : createCustomPlan(requestedDays),
    );
  }, [profileForm.training_days_per_week, user?.training_days_per_week]);

  useEffect(() => {
    void loadApplication();
  }, []);

  useEffect(() => {
    if (plan && !sessionForm) {
      setSessionForm(buildSessionForm(plan.workout_days[0]));
    }
  }, [plan, sessionForm]);

  async function loadApplication() {
    setLoading(true);
    try {
      const [nextUser, nextPlan, nextSessions] = await Promise.all([
        api.getUser(),
        api.getPlan(),
        api.getSessions().catch(() => []),
      ]);
      setUser(nextUser);
      setPlan(nextPlan);
      setSessions(nextSessions);
      setSessionForm(nextPlan?.workout_days.length ? buildSessionForm(nextPlan.workout_days[0]) : null);
    } catch (error) {
      setNotice({ kind: 'error', message: error instanceof Error ? error.message : 'Could not reach the API.' });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyLabel('Saving profile');
    setNotice(null);
    try {
      const nextUser = await api.createUser({
        name: profileForm.name.trim(),
        age: Number(profileForm.age),
        sex: profileForm.sex,
        weight: Number(profileForm.weight),
        height: normalizeHeightMeters(Number(profileForm.height)),
        training_experience_years: Number(profileForm.training_experience_years),
        training_days_per_week: Number(profileForm.training_days_per_week),
      });
      setUser(nextUser);
      setCustomPlan(createCustomPlan(nextUser.training_days_per_week));
      setActivePage('plan');
      setNotice({ kind: 'success', message: 'Profile created. Your training space is ready.' });
    } catch (error) {
      setNotice({ kind: 'error', message: error instanceof Error ? error.message : 'Profile creation failed.' });
    } finally {
      setBusyLabel(null);
    }
  }

  async function handleCreatePlan(nextPlan: WorkoutPlan) {
    setBusyLabel('Building plan');
    setNotice(null);
    try {
      const savedPlan = await api.createPlan(nextPlan);
      setPlan(savedPlan);
      setSessionForm(buildSessionForm(savedPlan.workout_days[0]));
      setActivePage('dashboard');
      setNotice({ kind: 'success', message: `${savedPlan.plan_name} is live.` });
    } catch (error) {
      setNotice({ kind: 'error', message: error instanceof Error ? error.message : 'Plan creation failed.' });
    } finally {
      setBusyLabel(null);
    }
  }

  async function handleCreateCustomPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextPlan = sanitizeCustomPlan(customPlan);

    if (!nextPlan.workout_days.length) {
      setNotice({ kind: 'error', message: 'Add at least one workout day with one exercise before saving the plan.' });
      return;
    }

    await handleCreatePlan(nextPlan);
  }

  async function handleSubmitSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!plan || !sessionForm) {
      return;
    }

    const payload: WorkoutSession = {
      date: sessionForm.date,
      day_name: sessionForm.workoutDayName,
      workout_label:
        plan.workout_days.find((day) => day.day_name === sessionForm.workoutDayName)?.workout_label ??
        sessionForm.workoutDayName,
      exercise_logs: sessionForm.entries.map((entry) => ({
        exercise: entry.exercise,
        sets: entry.sets.filter((setEntry) => setEntry.reps > 0),
      })),
    };

    setBusyLabel('Logging session');
    setNotice(null);
    try {
      const savedSession = await api.createSession(payload);
      setSessions((current) => [...current, savedSession].sort((a, b) => b.date.localeCompare(a.date)));
      setNotice({ kind: 'success', message: `${savedSession.workout_label} logged for ${formatDateLabel(savedSession.date)}.` });
      setActivePage('history');
    } catch (error) {
      setNotice({ kind: 'error', message: error instanceof Error ? error.message : 'Session logging failed.' });
    } finally {
      setBusyLabel(null);
    }
  }

  async function handleDeleteSession(date: string) {
    setBusyLabel('Removing session');
    setNotice(null);
    try {
      await api.deleteSession(date);
      setSessions((current) => current.filter((session) => session.date !== date));
      setNotice({ kind: 'success', message: `Removed the session from ${formatDateLabel(date)}.` });
    } catch (error) {
      setNotice({ kind: 'error', message: error instanceof Error ? error.message : 'Could not delete that session.' });
    } finally {
      setBusyLabel(null);
    }
  }

  async function handleDeletePlan() {
    setBusyLabel('Deleting plan');
    setNotice(null);
    try {
      await api.deletePlan();
      setPlan(null);
      setSessionForm(null);
      setActivePage('plan');
      setNotice({ kind: 'success', message: 'Workout plan deleted.' });
    } catch (error) {
      setNotice({ kind: 'error', message: error instanceof Error ? error.message : 'Could not delete the plan.' });
    } finally {
      setBusyLabel(null);
    }
  }

  async function handleDeleteProfile() {
    setBusyLabel('Deleting profile');
    setNotice(null);
    try {
      await Promise.all([api.deleteUser(), plan ? api.deletePlan().catch(() => undefined) : Promise.resolve()]);
      setUser(null);
      setPlan(null);
      setSessions([]);
      setSessionForm(null);
      setActivePage('dashboard');
      setProfileForm(createDefaultProfileForm());
      setNotice({ kind: 'success', message: 'Profile deleted. You can start fresh any time.' });
    } catch (error) {
      setNotice({ kind: 'error', message: error instanceof Error ? error.message : 'Could not delete the profile.' });
    } finally {
      setBusyLabel(null);
    }
  }

  async function handleExport(exporter: () => Promise<Blob>, filename: string, label: string) {
    setBusyLabel(label);
    setNotice(null);
    try {
      const blob = await exporter();
      api.downloadFile(blob, filename);
      setNotice({ kind: 'success', message: `${filename} downloaded.` });
    } catch (error) {
      setNotice({ kind: 'error', message: error instanceof Error ? error.message : 'Export failed.' });
    } finally {
      setBusyLabel(null);
    }
  }

  function selectWorkoutDay(dayName: string) {
    if (!plan) {
      return;
    }
    const day = plan.workout_days.find((item) => item.day_name === dayName);
    if (day) {
      setSessionForm(buildSessionForm(day));
    }
  }

  function updateCustomPlanName(value: string) {
    setCustomPlan((current) => ({ ...current, plan_name: value }));
  }

  function updateCustomDay(dayId: string, field: 'day_name' | 'workout_label', value: string) {
    setCustomPlan((current) => ({
      ...current,
      workout_days: current.workout_days.map((day) => (day.id === dayId ? { ...day, [field]: value } : day)),
    }));
  }

  function addCustomDay() {
    setCustomPlan((current) => ({
      ...current,
      workout_days: [
        ...current.workout_days,
        {
          id: createId(),
          day_name: weekdayOptions[current.workout_days.length % weekdayOptions.length],
          workout_label: `Day ${current.workout_days.length + 1}`,
          exercises: [{ name: '', muscle_group: 'full body' }],
        },
      ],
    }));
  }

  function removeCustomDay(dayId: string) {
    setCustomPlan((current) => ({
      ...current,
      workout_days: current.workout_days.filter((day) => day.id !== dayId),
    }));
  }

  function addCustomExercise(dayId: string) {
    setCustomPlan((current) => ({
      ...current,
      workout_days: current.workout_days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: [...day.exercises, { name: '', muscle_group: 'full body' }],
            }
          : day,
      ),
    }));
  }

  function updateCustomExercise(dayId: string, exerciseIndex: number, field: keyof EditableExercise, value: string) {
    setCustomPlan((current) => ({
      ...current,
      workout_days: current.workout_days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: day.exercises.map((exercise, index) =>
                index === exerciseIndex ? { ...exercise, [field]: value } : exercise,
              ),
            }
          : day,
      ),
    }));
  }

  function removeCustomExercise(dayId: string, exerciseIndex: number) {
    setCustomPlan((current) => ({
      ...current,
      workout_days: current.workout_days.map((day) =>
        day.id === dayId
          ? {
              ...day,
              exercises: day.exercises.filter((_, index) => index !== exerciseIndex),
            }
          : day,
      ),
    }));
  }

  function updateSetValue(exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: string) {
    setSessionForm((current) => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        entries: current.entries.map((entry, entryIndex) =>
          entryIndex !== exerciseIndex
            ? entry
            : {
                ...entry,
                sets: entry.sets.map((setEntry, currentSetIndex) =>
                  currentSetIndex === setIndex ? { ...setEntry, [field]: Number(value) } : setEntry,
                ),
              },
        ),
      };
    });
  }

  function addSetRow(exerciseIndex: number) {
    setSessionForm((current) => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        entries: current.entries.map((entry, entryIndex) =>
          entryIndex !== exerciseIndex
            ? entry
            : {
                ...entry,
                sets: [
                  ...entry.sets,
                  {
                    set_number: entry.sets.length + 1,
                    reps: entry.sets[entry.sets.length - 1]?.reps ?? 10,
                    weight: entry.sets[entry.sets.length - 1]?.weight ?? 0,
                  },
                ],
              },
        ),
      };
    });
  }

  function removeSetRow(exerciseIndex: number, setIndex: number) {
    setSessionForm((current) => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        entries: current.entries.map((entry, entryIndex) =>
          entryIndex !== exerciseIndex || entry.sets.length === 1
            ? entry
            : {
                ...entry,
                sets: entry.sets
                  .filter((_, currentSetIndex) => currentSetIndex !== setIndex)
                  .map((setEntry, index) => ({ ...setEntry, set_number: index + 1 })),
              },
        ),
      };
    });
  }

  const recentSessions = [...sessions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const totalSets = sessions.reduce((total, session) => total + sumSessionSets(session), 0);
  const nextWorkout = plan?.workout_days[0] ?? null;
  const activeUser = user;
  const displayBmi = activeUser ? getDisplayBmi(activeUser) : null;

  if (loading) {
    return (
      <div className="shell shell-loading">
        <div className="loading-panel">
          <p className="eyebrow">Preparing your workspace</p>
          <h1>Loading training data...</h1>
        </div>
      </div>
    );
  }

  if (!activeUser) {
    return (
      <div className="shell">
        <div className="background-orbit orbit-one" />
        <div className="background-orbit orbit-two" />

        <aside className="sidebar">
          <div className="brand-block">
            <p className="eyebrow">Progress Tracking</p>
            <h1>Iron Ledger</h1>
            <p className="sidebar-copy">A training space that feels deliberate: your split, your sessions, your numbers.</p>
          </div>

          <nav className="nav-stack">
            {pages.map((page) => (
              <button
                key={page.id}
                type="button"
                className={`nav-card ${activePage === page.id ? 'nav-card-active' : ''}`}
                onClick={() => setActivePage(page.id)}
                disabled={page.id !== 'dashboard'}
              >
                <span>{page.eyebrow}</span>
                <strong>{page.label}</strong>
              </button>
            ))}
          </nav>

          <div className="status-panel">
            <p className="eyebrow">Current Mode</p>
            <strong>First-time setup</strong>
            <p>Create your profile and choose a split to unlock the full app.</p>
          </div>
        </aside>

        <main className="main-stage">
          <header className="topbar">
            <div>
              <p className="eyebrow">Strength system</p>
              <h2>Build your training headquarters.</h2>
            </div>
            <div className="topbar-meta">
              <div className="meta-chip">
                <span>Today</span>
                <strong>{formatDateLabel(todayIso)}</strong>
              </div>
              {busyLabel && (
                <div className="meta-chip meta-chip-highlight">
                  <span>Working</span>
                  <strong>{busyLabel}</strong>
                </div>
              )}
            </div>
          </header>

          {notice && <div className={`notice notice-${notice.kind}`}>{notice.message}</div>}
          <section className="content-grid single-column">
            <article className="panel hero-panel">
              <div className="hero-copy">
                <p className="eyebrow">Onboarding</p>
                <h3>Set up the profile once, then train inside a site that actually feels custom.</h3>
                <p>We keep the setup direct: profile first, then a structured split tailored to your weekly frequency.</p>
              </div>
              <div className="hero-stat-grid">
                <div className="stat-card stat-card-dark">
                  <span>Focus</span>
                  <strong>Strength + consistency</strong>
                </div>
                <div className="stat-card">
                  <span>Flow</span>
                  <strong>Profile, plan, log, review</strong>
                </div>
              </div>
            </article>

            <div className="content-grid onboarding-grid">
              <article className="panel">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">Profile</p>
                    <h3>Your baseline</h3>
                  </div>
                </div>

                <form className="form-grid" onSubmit={handleCreateProfile}>
                  <label>
                    <span>Name</span>
                    <input
                      value={profileForm.name}
                      onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Jeevan"
                      required
                    />
                  </label>

                  <label>
                    <span>Age</span>
                    <input
                      type="number"
                      min="1"
                      value={profileForm.age}
                      onChange={(event) => setProfileForm((current) => ({ ...current, age: event.target.value }))}
                      required
                    />
                  </label>

                  <label>
                    <span>Sex</span>
                    <select
                      value={profileForm.sex}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, sex: event.target.value as UserProfile['sex'] }))
                      }
                    >
                      {sexOptions.map((option) => (
                        <option key={option} value={option}>
                          {toTitleCase(option)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Weight (kg)</span>
                    <input
                      type="number"
                      min="1"
                      step="0.1"
                      value={profileForm.weight}
                      onChange={(event) => setProfileForm((current) => ({ ...current, weight: event.target.value }))}
                      required
                    />
                  </label>

                  <label>
                    <span>Height (cm)</span>
                    <input
                      type="number"
                      min="80"
                      step="1"
                      value={profileForm.height}
                      onChange={(event) => setProfileForm((current) => ({ ...current, height: event.target.value }))}
                      required
                    />
                  </label>

                  <label>
                    <span>Experience (years)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={profileForm.training_experience_years}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, training_experience_years: event.target.value }))
                      }
                      required
                    />
                  </label>

                  <label>
                    <span>Training days / week</span>
                    <input
                      type="number"
                      min="2"
                      max="6"
                      value={profileForm.training_days_per_week}
                      onChange={(event) =>
                        setProfileForm((current) => ({ ...current, training_days_per_week: event.target.value }))
                      }
                      required
                    />
                  </label>

                  <button className="primary-button" type="submit" disabled={!!busyLabel}>
                    Create profile
                  </button>
                </form>
              </article>

              <article className="panel panel-accent">
                <div className="panel-header">
                  <div>
                    <p className="eyebrow">Recommended split</p>
                    <h3>{recommendedPlan.plan_name}</h3>
                  </div>
                  <div className="pill">{recommendedPlan.workout_days.length} days</div>
                </div>
                <div className="preset-preview">
                  {recommendedPlan.workout_days.map((day) => (
                    <div key={`${day.day_name}-${day.workout_label}`} className="preset-day">
                      <strong>
                        {day.day_name} / {day.workout_label}
                      </strong>
                      <p>{day.exercises.map((exercise) => exercise.name).join(' / ')}</p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const dashboardView = (
    <section className="content-grid">
      <article className="panel hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Overview</p>
          <h3>{plan ? `${plan.plan_name} is locked in.` : 'You have the profile, now pick the split.'}</h3>
          <p>
            {plan
              ? `You are training ${activeUser.training_days_per_week} day${activeUser.training_days_per_week === 1 ? '' : 's'} per week with ${analytics.uniqueExerciseCount || plan.workout_days.reduce((total, day) => total + day.exercises.length, 0)} tracked movements in rotation.`
              : 'Choose a preset plan to unlock workout logging, progress history, and analytics.'}
          </p>
        </div>
        <div className="hero-stat-grid">
          <div className="stat-card stat-card-dark">
            <span>Sessions</span>
            <strong>{sessions.length}</strong>
          </div>
          <div className="stat-card">
            <span>Total volume</span>
            <strong>{Math.round(analytics.totalVolume).toLocaleString()} kg</strong>
          </div>
          <div className="stat-card">
            <span>Total sets</span>
            <strong>{totalSets}</strong>
          </div>
        </div>
      </article>

      <div className="three-up">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Body metrics</p>
              <h3>
                {activeUser.weight} kg / {heightForDisplay(activeUser.height)}
              </h3>
            </div>
            <div className="pill">{activeUser.experience_level}</div>
          </div>
          <div className="metric-list">
            <div>
              <span>BMI</span>
              <strong>{displayBmi?.bmi}</strong>
            </div>
            <div>
              <span>Category</span>
              <strong>{displayBmi?.category}</strong>
            </div>
            <div>
              <span>Weekly cadence</span>
              <strong>{activeUser.training_days_per_week} days</strong>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Next workout</p>
              <h3>{nextWorkout ? nextWorkout.workout_label : 'No plan yet'}</h3>
            </div>
          </div>
          <p className="support-copy">
            {nextWorkout
              ? `${nextWorkout.day_name} with ${nextWorkout.exercises.length} exercises.`
              : 'Open Plan Studio and choose one of the preset splits.'}
          </p>
          {nextWorkout && (
            <button className="secondary-button" type="button" onClick={() => setActivePage('log')}>
              Open logger
            </button>
          )}
        </article>

        <article className="panel panel-accent">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Standout lifts</p>
              <h3>{analytics.topRecords[0]?.exercise ?? 'Waiting on first session'}</h3>
            </div>
          </div>
          <p className="support-copy">
            {analytics.topRecords[0]
              ? `${analytics.topRecords[0].maxWeight} kg for ${analytics.topRecords[0].reps} reps on ${formatDateLabel(analytics.topRecords[0].date)}.`
              : 'Once you log workouts, personal bests and volume trends will show up here.'}
          </p>
        </article>
      </div>

      <div className="content-grid dashboard-lower">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Recent sessions</p>
              <h3>Latest work logged</h3>
            </div>
          </div>
          {recentSessions.length ? (
            <div className="session-feed">
              {recentSessions.map((session) => (
                <div key={`${session.date}-${session.workout_label}`} className="feed-row">
                  <div>
                    <strong>{session.workout_label}</strong>
                    <p>{formatDateLabel(session.date)}</p>
                  </div>
                  <div className="feed-stat">
                    <strong>{Math.round(sumSessionVolume(session)).toLocaleString()} kg</strong>
                    <span>{sumSessionSets(session)} sets</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-copy">No training sessions yet. Use Log Session to record your first day.</p>
          )}
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Volume trend</p>
              <h3>Session intensity</h3>
            </div>
          </div>
          {analytics.timeline.length ? (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={analytics.timeline}>
                  <defs>
                    <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d95d39" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#d95d39" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#d9cfbf" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="volume" stroke="#d95d39" fill="url(#volumeFill)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="empty-copy">Log a few sessions to unlock the volume curve.</p>
          )}
        </article>
      </div>
    </section>
  );

  const planView = (
    <section className="content-grid">
      <article className="panel hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Plan Studio</p>
          <h3>{plan ? plan.plan_name : 'Build your own split day by day.'}</h3>
          <p>Name the day, label the focus, add the exact exercises you want, then log directly from that setup.</p>
        </div>
        <div className="hero-stat-grid">
          <div className="stat-card">
            <span>Recommended</span>
            <strong>{activeUser.training_days_per_week} days</strong>
          </div>
          <div className="stat-card stat-card-dark">
            <span>Current plan</span>
            <strong>{plan ? `${plan.workout_days.length} workouts` : 'Not set'}</strong>
          </div>
        </div>
      </article>

      <article className="panel panel-accent">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Custom builder</p>
            <h3>Shape it like your real routine</h3>
          </div>
          <button className="mini-button" type="button" onClick={addCustomDay}>
            Add day
          </button>
        </div>

        <form className="custom-plan-form" onSubmit={handleCreateCustomPlan}>
          <label className="plan-name-field">
            <span>Plan name</span>
            <input value={customPlan.plan_name} onChange={(event) => updateCustomPlanName(event.target.value)} />
          </label>

          <div className="custom-day-stack">
            {customPlan.workout_days.map((day) => (
              <section key={day.id} className="custom-day-card">
                <div className="custom-day-head">
                  <label>
                    <span>Day name</span>
                    <select value={day.day_name} onChange={(event) => updateCustomDay(day.id, 'day_name', event.target.value)}>
                      {weekdayOptions.map((weekday) => (
                        <option key={weekday} value={weekday}>
                          {weekday}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Workout focus</span>
                    <input
                      value={day.workout_label}
                      onChange={(event) => updateCustomDay(day.id, 'workout_label', event.target.value)}
                      placeholder="Hamstring and Shoulder Day"
                    />
                  </label>

                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => removeCustomDay(day.id)}
                    disabled={customPlan.workout_days.length === 1}
                  >
                    Remove day
                  </button>
                </div>

                <div className="custom-exercise-list">
                  {day.exercises.map((exercise, exerciseIndex) => (
                    <div key={`${day.id}-${exerciseIndex}`} className="custom-exercise-row">
                      <input
                        value={exercise.name}
                        onChange={(event) => updateCustomExercise(day.id, exerciseIndex, 'name', event.target.value)}
                        placeholder="Romanian Deadlift"
                      />
                      <select
                        value={exercise.muscle_group}
                        onChange={(event) => updateCustomExercise(day.id, exerciseIndex, 'muscle_group', event.target.value)}
                      >
                        {muscleGroupOptions.map((option) => (
                          <option key={option} value={option}>
                            {toTitleCase(option)}
                          </option>
                        ))}
                      </select>
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => removeCustomExercise(day.id, exerciseIndex)}
                        disabled={day.exercises.length === 1}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <button className="mini-button" type="button" onClick={() => addCustomExercise(day.id)}>
                  Add exercise
                </button>
              </section>
            ))}
          </div>

          <button className="primary-button" type="submit" disabled={!!busyLabel}>
            Save custom plan
          </button>
        </form>
      </article>

      <div className="preset-grid">
        {[2, 3, 4, 5, 6].map((days) => {
          const presetPlan = createPresetPlan(days);
          const isRecommended = days === activeUser.training_days_per_week;
          return (
            <article key={days} className={`panel ${isRecommended ? 'panel-accent' : ''}`}>
              <div className="panel-header">
                <div>
                  <p className="eyebrow">{isRecommended ? 'Recommended' : 'Preset'}</p>
                  <h3>{presetPlan.plan_name}</h3>
                </div>
                <div className="pill">{days} days</div>
              </div>
              <div className="preset-preview">
                {presetPlan.workout_days.map((day) => (
                  <div key={`${presetPlan.plan_name}-${day.day_name}`} className="preset-day">
                    <strong>{day.workout_label}</strong>
                    <p>{day.exercises.slice(0, 3).map((exercise) => exercise.name).join(' / ')}</p>
                  </div>
                ))}
              </div>
              <button className="primary-button" type="button" onClick={() => void handleCreatePlan(presetPlan)}>
                Use this split
              </button>
            </article>
          );
        })}
      </div>

      {plan && (
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Current structure</p>
              <h3>{plan.plan_name}</h3>
            </div>
          </div>
          <div className="plan-columns">
            {plan.workout_days.map((day) => (
              <div key={`${day.day_name}-${day.workout_label}`} className="plan-day-card">
                <strong>
                  {day.day_name} / {day.workout_label}
                </strong>
                <ul>
                  {day.exercises.map((exercise) => (
                    <li key={`${day.day_name}-${exercise.name}`}>{exercise.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>
      )}
    </section>
  );

  const logView = (
    <section className="content-grid">
      <article className="panel hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Logger</p>
          <h3>{plan ? 'Pick a day from your split and log it exercise by exercise.' : 'Choose a plan before logging sessions.'}</h3>
          <p>
            {plan
              ? 'Your saved plan drives this page. Click the day you want, then log every set beneath it.'
              : 'Open Plan Studio and activate a preset split first.'}
          </p>
        </div>
      </article>

      {plan && sessionForm ? (
        <article className="panel">
          <form className="log-form" onSubmit={handleSubmitSession}>
            <div className="day-picker-grid">
              {plan.workout_days.map((day) => (
                <button
                  key={`${day.day_name}-${day.workout_label}`}
                  className={`day-picker-card ${sessionForm.workoutDayName === day.day_name ? 'day-picker-card-active' : ''}`}
                  type="button"
                  onClick={() => selectWorkoutDay(day.day_name)}
                >
                  <span>{day.day_name}</span>
                  <strong>{day.workout_label}</strong>
                  <small>{day.exercises.length} exercises</small>
                </button>
              ))}
            </div>

            <div className="log-toolbar">
              <label>
                <span>Workout day</span>
                <select value={sessionForm.workoutDayName} onChange={(event) => selectWorkoutDay(event.target.value)}>
                  {plan.workout_days.map((day) => (
                    <option key={day.day_name} value={day.day_name}>
                      {day.day_name} / {day.workout_label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Date</span>
                <input
                  type="date"
                  value={sessionForm.date}
                  onChange={(event) =>
                    setSessionForm((current) => (current ? { ...current, date: event.target.value } : current))
                  }
                />
              </label>
            </div>

            <div className="exercise-stack">
              {sessionForm.entries.map((entry, exerciseIndex) => (
                <section key={entry.exercise.name} className="exercise-card">
                  <div className="exercise-header">
                    <div>
                      <p className="eyebrow">{toTitleCase(entry.exercise.muscle_group)}</p>
                      <h4>{entry.exercise.name}</h4>
                    </div>
                    <button className="mini-button" type="button" onClick={() => addSetRow(exerciseIndex)}>
                      Add set
                    </button>
                  </div>

                  <div className="sets-table">
                    <div className="sets-row sets-row-head">
                      <span>Set</span>
                      <span>Reps</span>
                      <span>Weight (kg)</span>
                      <span />
                    </div>
                    {entry.sets.map((setEntry, setIndex) => (
                      <div key={`${entry.exercise.name}-${setEntry.set_number}`} className="sets-row">
                        <span className="set-index">{setEntry.set_number}</span>
                        <input
                          type="number"
                          min="0"
                          value={setEntry.reps}
                          onChange={(event) => updateSetValue(exerciseIndex, setIndex, 'reps', event.target.value)}
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={setEntry.weight}
                          onChange={(event) => updateSetValue(exerciseIndex, setIndex, 'weight', event.target.value)}
                        />
                        <button className="ghost-button" type="button" onClick={() => removeSetRow(exerciseIndex, setIndex)}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <button className="primary-button" type="submit" disabled={!!busyLabel}>
              Save session
            </button>
          </form>
        </article>
      ) : (
        <article className="panel">
          <p className="empty-copy">No workout plan available yet.</p>
        </article>
      )}
    </section>
  );

  const historyView = (
    <section className="content-grid">
      <article className="panel hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">History</p>
          <h3>Every session, kept readable.</h3>
          <p>Use this as your logbook: clean summaries up front, exercise detail underneath.</p>
        </div>
      </article>

      <article className="panel">
        {recentSessions.length ? (
          <div className="history-stack">
            {[...sessions]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((session) => (
                <article key={`${session.date}-${session.workout_label}`} className="history-card">
                  <div className="history-topline">
                    <div>
                      <p className="eyebrow">{session.day_name}</p>
                      <h3>{session.workout_label}</h3>
                    </div>
                    <div className="history-actions">
                      <div className="pill">{formatDateLabel(session.date)}</div>
                      <button className="ghost-button" type="button" onClick={() => void handleDeleteSession(session.date)}>
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="history-summary">
                    <span>{session.exercise_logs.length} exercises</span>
                    <span>{sumSessionSets(session)} sets</span>
                    <span>{Math.round(sumSessionVolume(session)).toLocaleString()} kg total volume</span>
                  </div>
                  <div className="history-details">
                    {session.exercise_logs.map((log) => (
                      <div key={`${session.date}-${log.exercise.name}`} className="history-detail-row">
                        <strong>{log.exercise.name}</strong>
                        <p>{log.sets.map((setEntry) => `${setEntry.weight} x ${setEntry.reps}`).join(' | ')}</p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
          </div>
        ) : (
          <p className="empty-copy">No sessions yet. Your workout archive will appear here.</p>
        )}
      </article>
    </section>
  );

  const analyticsView = (
    <section className="content-grid">
      <article className="panel hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Analytics</p>
          <h3>Patterns, not just raw logs.</h3>
          <p>Track volume accumulation, muscle-group emphasis, and the heaviest lifts in your archive.</p>
        </div>
        <div className="hero-stat-grid">
          <div className="stat-card">
            <span>Average volume</span>
            <strong>{Math.round(analytics.averageVolume).toLocaleString()} kg</strong>
          </div>
          <div className="stat-card stat-card-dark">
            <span>Exercises tracked</span>
            <strong>{analytics.uniqueExerciseCount}</strong>
          </div>
        </div>
      </article>

      <div className="analytics-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Volume map</p>
              <h3>Session by session</h3>
            </div>
          </div>
          {analytics.timeline.length ? (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={analytics.timeline}>
                  <CartesianGrid stroke="#d9cfbf" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="volume" radius={[10, 10, 0, 0]}>
                    {analytics.timeline.map((entry, index) => (
                      <Cell key={`${entry.date}-${index}`} fill={index === analytics.timeline.length - 1 ? '#205c47' : '#d95d39'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="empty-copy">Analytics will appear after your first logged workout.</p>
          )}
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Muscle emphasis</p>
              <h3>Where the work goes</h3>
            </div>
          </div>
          {analytics.muscleBreakdown.length ? (
            <div className="breakdown-list">
              {analytics.muscleBreakdown.map((item) => (
                <div key={item.name} className="breakdown-row">
                  <div className="breakdown-label">
                    <strong>{item.name}</strong>
                    <span>{item.totalSets} sets</span>
                  </div>
                  <div className="breakdown-bar">
                    <div style={{ width: `${(item.totalSets / analytics.muscleBreakdown[0].totalSets) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-copy">Muscle-group balance appears once you start logging sessions.</p>
          )}
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Personal records</p>
              <h3>Top loaded movements</h3>
            </div>
          </div>
          {analytics.topRecords.length ? (
            <div className="records-list">
              {analytics.topRecords.map((record) => (
                <div key={`${record.exercise}-${record.date}`} className="record-row">
                  <div>
                    <strong>{record.exercise}</strong>
                    <p>{formatDateLabel(record.date)}</p>
                  </div>
                  <div className="record-value">
                    <strong>{record.maxWeight} kg</strong>
                    <span>{record.reps} reps</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-copy">Your strongest sets will be listed here.</p>
          )}
        </article>
      </div>
    </section>
  );

  const exportView = (
    <section className="content-grid">
      <article className="panel hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Export</p>
          <h3>Keep clean backups of everything.</h3>
          <p>Download individual datasets or the full progress report generated by the backend.</p>
        </div>
      </article>

      <div className="preset-grid export-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Profile</p>
              <h3>User profile CSV</h3>
            </div>
          </div>
          <p className="support-copy">Name, body metrics, training background, and frequency targets.</p>
          <button
            className="primary-button"
            type="button"
            onClick={() => void handleExport(() => api.exportUserProfileCSV(), 'user_profile.csv', 'Exporting profile')}
          >
            Download profile
          </button>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Plan</p>
              <h3>Workout plan CSV</h3>
            </div>
          </div>
          <p className="support-copy">The active split with day names, workout labels, and exercise list.</p>
          <button className="primary-button" type="button" onClick={() => void handleExport(() => api.exportPlanCSV(), 'plan.csv', 'Exporting plan')}>
            Download plan
          </button>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Sessions</p>
              <h3>Workout log CSV</h3>
            </div>
          </div>
          <p className="support-copy">Every tracked session, ready for spreadsheets or long-term archiving.</p>
          <button
            className="primary-button"
            type="button"
            onClick={() => void handleExport(() => api.exportSessionsCSV(), 'sessions.csv', 'Exporting sessions')}
          >
            Download sessions
          </button>
        </article>

        <article className="panel panel-accent">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Report</p>
              <h3>Full progress report</h3>
            </div>
          </div>
          <p className="support-copy">Backend-generated text report covering profile, plan, and analytics.</p>
          <button
            className="primary-button"
            type="button"
            onClick={() => void handleExport(() => api.exportProgressReport(), 'progress_report.txt', 'Exporting report')}
          >
            Download report
          </button>
        </article>
      </div>
    </section>
  );

  const settingsView = (
    <section className="content-grid">
      <article className="panel hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Settings</p>
          <h3>Manage profile and reset training data carefully.</h3>
          <p>These actions are destructive, so they stay tucked away here instead of bleeding into the rest of the app.</p>
        </div>
      </article>

      <div className="three-up">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Profile</p>
              <h3>{activeUser.name}</h3>
            </div>
          </div>
          <div className="metric-list">
            <div>
              <span>Age</span>
              <strong>{activeUser.age}</strong>
            </div>
            <div>
              <span>Weight</span>
              <strong>{activeUser.weight} kg</strong>
            </div>
            <div>
              <span>Experience</span>
              <strong>{activeUser.training_experience_years} years</strong>
            </div>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Plan reset</p>
              <h3>{plan ? plan.plan_name : 'No active plan'}</h3>
            </div>
          </div>
          <p className="support-copy">Delete the current split and build a new one from Plan Studio.</p>
          <button className="danger-button" type="button" onClick={() => void handleDeletePlan()} disabled={!plan}>
            Delete plan
          </button>
        </article>

        <article className="panel panel-danger">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Profile reset</p>
              <h3>Start over</h3>
            </div>
          </div>
          <p className="support-copy">Deletes the current profile from the backend and clears this workspace.</p>
          <button className="danger-button" type="button" onClick={() => void handleDeleteProfile()}>
            Delete profile
          </button>
        </article>
      </div>
    </section>
  );

  const content = {
    dashboard: dashboardView,
    plan: planView,
    log: logView,
    history: historyView,
    analytics: analyticsView,
    export: exportView,
    settings: settingsView,
  }[activePage];

  return (
    <div className="shell">
      <div className="background-orbit orbit-one" />
      <div className="background-orbit orbit-two" />

      <aside className="sidebar">
        <div className="brand-block">
          <p className="eyebrow">Progress Tracking</p>
          <h1>Iron Ledger</h1>
          <p className="sidebar-copy">A training space that feels deliberate: your split, your sessions, your numbers.</p>
        </div>

        <nav className="nav-stack">
          {pages.map((page) => (
            <button
              key={page.id}
              type="button"
              className={`nav-card ${activePage === page.id ? 'nav-card-active' : ''}`}
              onClick={() => setActivePage(page.id)}
              disabled={false}
            >
              <span>{page.eyebrow}</span>
              <strong>{page.label}</strong>
            </button>
          ))}
        </nav>

        <div className="status-panel">
          <p className="eyebrow">Current Mode</p>
          <strong>Training in progress</strong>
          <p>{`${sessions.length} session${sessions.length === 1 ? '' : 's'} tracked so far.`}</p>
        </div>
      </aside>

      <main className="main-stage">
        <header className="topbar">
          <div>
            <p className="eyebrow">Strength system</p>
            <h2>Welcome back, {activeUser.name}.</h2>
          </div>
          <div className="topbar-meta">
            <div className="meta-chip">
              <span>Today</span>
              <strong>{formatDateLabel(todayIso)}</strong>
            </div>
            {busyLabel && (
              <div className="meta-chip meta-chip-highlight">
                <span>Working</span>
                <strong>{busyLabel}</strong>
              </div>
            )}
          </div>
        </header>

        {notice && <div className={`notice notice-${notice.kind}`}>{notice.message}</div>}
        {content}
      </main>
    </div>
  );
}
