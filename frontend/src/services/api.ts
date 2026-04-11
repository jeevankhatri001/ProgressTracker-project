import axios, { AxiosError, AxiosInstance } from 'axios';
import * as Types from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const AUTH_STORAGE_KEY = 'progress-tracker-auth';

function toApiError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ detail?: string; message?: string }>;

    if (!axiosError.response) {
      return new Error('Cannot reach the backend API. Start the FastAPI server on http://localhost:8000 and try again.');
    }

    const rawDetail = axiosError.response.data?.detail || axiosError.response.data?.message;
    const detail = Array.isArray(rawDetail)
      ? rawDetail
          .map((item) => {
            if (item && typeof item === 'object' && 'loc' in item && 'msg' in item) {
              const loc = Array.isArray(item.loc) ? item.loc.join('.') : item.loc;
              return `${loc}: ${item.msg}`;
            }
            return JSON.stringify(item);
          })
          .join(' | ')
      : rawDetail || axiosError.message || 'Request failed.';

    return new Error(detail);
  }

  return error instanceof Error ? error : new Error('Unexpected API error.');
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const session = this.getStoredSession();
    if (session) {
      this.setActiveSession(session);
    }
  }

  getStoredSession(): Types.AuthSession | null {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as Types.AuthSession;
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  }

  setActiveSession(session: Types.AuthSession): void {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    this.client.defaults.headers.common['X-User-Id'] = session.user_id;
    if (session.email) {
      this.client.defaults.headers.common['X-User-Email'] = session.email;
    } else {
      delete this.client.defaults.headers.common['X-User-Email'];
    }
  }

  logout(): void {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    delete this.client.defaults.headers.common['X-User-Id'];
    delete this.client.defaults.headers.common['X-User-Email'];
  }

  async login(username: string): Promise<Types.AuthSession> {
    try {
      const response = await this.client.post('/auth/login', { username });
      const session = response.data as Types.AuthSession;
      this.setActiveSession(session);
      return session;
    } catch (error) {
      throw toApiError(error);
    }
  }

  switchToUser(account: Types.AdminAccount): Types.AuthSession {
    const session: Types.AuthSession = {
      user_id: account.user_id,
      username: account.display_name,
      has_profile: account.has_profile,
      provider: 'local',
    };
    this.setActiveSession(session);
    return session;
  }

  async loginWithGoogle(credential: string): Promise<Types.AuthSession> {
    try {
      const response = await this.client.post('/auth/google', { credential });
      const session = response.data as Types.AuthSession;
      this.setActiveSession(session);
      return session;
    } catch (error) {
      throw toApiError(error);
    }
  }

  async getAdminUsers(): Promise<Types.AdminAccount[]> {
    try {
      const response = await this.client.get('/admin/users');
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  }

  async deleteAdminUser(userId: string): Promise<void> {
    try {
      await this.client.delete(`/admin/users/${encodeURIComponent(userId)}`);
    } catch (error) {
      throw toApiError(error);
    }
  }

  // User endpoints
  async createUser(userData: Partial<Types.UserProfile>): Promise<Types.UserProfile> {
    try {
      const response = await this.client.post('/user', userData);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  }

  async getUser(): Promise<Types.UserProfile | null> {
    try {
      const response = await this.client.get('/user');
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async deleteUser(): Promise<void> {
    try {
      await this.client.delete('/user');
    } catch (error) {
      throw toApiError(error);
    }
  }

  // Plan endpoints
  async createPlan(planData: Types.WorkoutPlan): Promise<Types.WorkoutPlan> {
    try {
      const response = await this.client.post('/plan', planData);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  }

  async getPlan(): Promise<Types.WorkoutPlan | null> {
    try {
      const response = await this.client.get('/plan');
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async deletePlan(): Promise<void> {
    try {
      await this.client.delete('/plan');
    } catch (error) {
      throw toApiError(error);
    }
  }

  // Session endpoints
  async createSession(sessionData: Types.WorkoutSession): Promise<Types.WorkoutSession> {
    try {
      const response = await this.client.post('/sessions', sessionData);
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  }

  async getSessions(filters?: { date?: string; label?: string }): Promise<Types.WorkoutSession[]> {
    try {
      const response = await this.client.get('/sessions', { params: filters });
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  }

  async deleteSession(date: string): Promise<void> {
    try {
      await this.client.delete(`/sessions/${date}`);
    } catch (error) {
      throw toApiError(error);
    }
  }

  // Analytics endpoints
  async getPersonalRecords(): Promise<any> {
    try {
      const response = await this.client.get('/analytics/personal-records');
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  }

  async getProgression(exercise: string): Promise<any> {
    try {
      const response = await this.client.get('/analytics/progression', { params: { exercise } });
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  }

  async getMuscleGroupStats(): Promise<any> {
    try {
      const response = await this.client.get('/analytics/muscle-groups');
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  }

  async getExerciseFrequency(): Promise<any> {
    try {
      const response = await this.client.get('/analytics/exercise-frequency');
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  }

  async getSessionFrequency(): Promise<any> {
    try {
      const response = await this.client.get('/analytics/session-frequency');
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  }

  async getVolumeSummary(): Promise<Types.VolumeSummary> {
    try {
      const response = await this.client.get('/analytics/volume-summary');
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  }

  async getAverageWeight(exercise: string): Promise<any> {
    try {
      const response = await this.client.get('/analytics/average-weight', { params: { exercise } });
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  }

  async getStrengthProgress(): Promise<any> {
    try {
      const response = await this.client.get('/analytics/strength-progress');
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  }

  // Export endpoints
  async exportSessionsCSV(): Promise<Blob> {
    try {
      const response = await this.client.get('/export/sessions/csv', { responseType: 'blob' });
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  }

  async exportUserProfileCSV(): Promise<Blob> {
    try {
      const response = await this.client.get('/export/user-profile/csv', { responseType: 'blob' });
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  }

  async exportPlanCSV(): Promise<Blob> {
    try {
      const response = await this.client.get('/export/plan/csv', { responseType: 'blob' });
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  }

  async exportProgressReport(): Promise<Blob> {
    try {
      const response = await this.client.get('/export/progress-report', { responseType: 'blob' });
      return response.data;
    } catch (error) {
      throw toApiError(error);
    }
  }

  // Helper for downloading files
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export default new ApiClient();
