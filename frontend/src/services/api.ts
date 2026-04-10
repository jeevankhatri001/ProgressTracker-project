import axios, { AxiosInstance } from 'axios';
import * as Types from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // User endpoints
  async createUser(userData: Partial<Types.UserProfile>): Promise<Types.UserProfile> {
    const response = await this.client.post('/user', userData);
    return response.data;
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
    await this.client.delete('/user');
  }

  // Plan endpoints
  async createPlan(planData: Types.WorkoutPlan): Promise<Types.WorkoutPlan> {
    const response = await this.client.post('/plan', planData);
    return response.data;
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
    await this.client.delete('/plan');
  }

  // Session endpoints
  async createSession(sessionData: Types.WorkoutSession): Promise<Types.WorkoutSession> {
    const response = await this.client.post('/sessions', sessionData);
    return response.data;
  }

  async getSessions(filters?: { date?: string; label?: string }): Promise<Types.WorkoutSession[]> {
    const response = await this.client.get('/sessions', { params: filters });
    return response.data;
  }

  async deleteSession(date: string): Promise<void> {
    await this.client.delete(`/sessions/${date}`);
  }

  // Analytics endpoints
  async getPersonalRecords(): Promise<any> {
    const response = await this.client.get('/analytics/personal-records');
    return response.data;
  }

  async getProgression(exercise: string): Promise<any> {
    const response = await this.client.get('/analytics/progression', { params: { exercise } });
    return response.data;
  }

  async getMuscleGroupStats(): Promise<any> {
    const response = await this.client.get('/analytics/muscle-groups');
    return response.data;
  }

  async getExerciseFrequency(): Promise<any> {
    const response = await this.client.get('/analytics/exercise-frequency');
    return response.data;
  }

  async getSessionFrequency(): Promise<any> {
    const response = await this.client.get('/analytics/session-frequency');
    return response.data;
  }

  async getVolumeSummary(): Promise<Types.VolumeSummary> {
    const response = await this.client.get('/analytics/volume-summary');
    return response.data;
  }

  async getAverageWeight(exercise: string): Promise<any> {
    const response = await this.client.get('/analytics/average-weight', { params: { exercise } });
    return response.data;
  }

  async getStrengthProgress(): Promise<any> {
    const response = await this.client.get('/analytics/strength-progress');
    return response.data;
  }

  // Export endpoints
  async exportSessionsCSV(): Promise<Blob> {
    const response = await this.client.get('/export/sessions/csv', { responseType: 'blob' });
    return response.data;
  }

  async exportUserProfileCSV(): Promise<Blob> {
    const response = await this.client.get('/export/user-profile/csv', { responseType: 'blob' });
    return response.data;
  }

  async exportPlanCSV(): Promise<Blob> {
    const response = await this.client.get('/export/plan/csv', { responseType: 'blob' });
    return response.data;
  }

  async exportProgressReport(): Promise<Blob> {
    const response = await this.client.get('/export/progress-report', { responseType: 'blob' });
    return response.data;
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
