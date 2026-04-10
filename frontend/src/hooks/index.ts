import { useState, useCallback, useEffect } from 'react';
import * as Types from '../types';
import api from '../services/api';

export const useUser = () => {
  const [user, setUser] = useState<Types.UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUser();
      setUser(data);
    } catch (err) {
      setError(`Failed to fetch user: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData: Partial<Types.UserProfile>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.createUser(userData);
      setUser(data);
      return data;
    } catch (err) {
      setError(`Failed to create user: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteUser();
      setUser(null);
    } catch (err) {
      setError(`Failed to delete user: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, createUser, deleteUser, fetchUser };
};

export const usePlan = () => {
  const [plan, setPlan] = useState<Types.WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPlan();
      setPlan(data);
    } catch (err) {
      setError(`Failed to fetch plan: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setPlan(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPlan = useCallback(async (planData: Types.WorkoutPlan) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.createPlan(planData);
      setPlan(data);
      return data;
    } catch (err) {
      setError(`Failed to create plan: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await api.deletePlan();
      setPlan(null);
    } catch (err) {
      setError(`Failed to delete plan: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  return { plan, loading, error, createPlan, deletePlan, fetchPlan };
};

export const useSessions = () => {
  const [sessions, setSessions] = useState<Types.WorkoutSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async (filters?: { date?: string; label?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSessions(filters);
      setSessions(data || []);
    } catch (err) {
      setError(`Failed to fetch sessions: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSession = useCallback(async (sessionData: Types.WorkoutSession) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.createSession(sessionData);
      setSessions([...sessions, data]);
      return data;
    } catch (err) {
      setError(`Failed to create session: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessions]);

  const deleteSession = useCallback(async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.deleteSession(date);
      setSessions(sessions.filter(s => s.date !== date));
    } catch (err) {
      setError(`Failed to delete session: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessions]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, loading, error, createSession, deleteSession, fetchSessions };
};

export const useAnalytics = () => {
  const [personalRecords, setPersonalRecords] = useState<any>(null);
  const [muscleGroups, setMuscleGroups] = useState<any>(null);
  const [volumeSummary, setVolumeSummary] = useState<Types.VolumeSummary | null>(null);
  const [strengthProgress, setStrengthProgress] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [records, groups, volume, progress] = await Promise.all([
        api.getPersonalRecords().catch(() => null),
        api.getMuscleGroupStats().catch(() => null),
        api.getVolumeSummary().catch(() => null),
        api.getStrengthProgress().catch(() => null),
      ]);
      setPersonalRecords(records);
      setMuscleGroups(groups);
      setVolumeSummary(volume);
      setStrengthProgress(progress);
    } catch (err) {
      setError(`Failed to fetch analytics: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    personalRecords,
    muscleGroups,
    volumeSummary,
    strengthProgress,
    loading,
    error,
    fetchAnalytics,
  };
};
