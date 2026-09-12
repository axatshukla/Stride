// ============================================================
// TaskFlow — Frontend API Client & Service Layer
// ============================================================

import type { Task, User, TaskStatus, TaskPriority } from '../types';

const API_BASE_URL = '/api';

/** Stores active JWT in memory & localStorage */
let authToken: string | null = localStorage.getItem('taskflow_token');

export function setAuthToken(token: string | null): void {
  authToken = token;
  if (token) {
    localStorage.setItem('taskflow_token', token);
  } else {
    localStorage.removeItem('taskflow_token');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

/** Core HTTP request wrapper with Bearer token injection and error handling */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  headers.set('Content-Type', 'application/json');

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP Error ${response.status}: ${response.statusText}`);
  }

  return data as T;
}

// -- Auth Service Endpoints --
export const authApi = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await request<{ success: boolean; user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.token);
    return res;
  },

  async signup(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await request<{ success: boolean; user: User; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setAuthToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ success: boolean; user: User }>('/auth/me');
  },

  async getUsers(): Promise<{ users: User[] }> {
    return request<{ success: boolean; users: User[] }>('/auth/users');
  },
};

// -- Task Service Endpoints --
export const taskApi = {
  async getTasks(params: { status?: string; priority?: string; search?: string; sortBy?: string } = {}): Promise<{ tasks: Task[]; count: number }> {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.priority && params.priority !== 'all') query.set('priority', params.priority);
    if (params.search) query.set('search', params.search);
    if (params.sortBy) query.set('sortBy', params.sortBy);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<{ success: boolean; tasks: Task[]; count: number }>(`/tasks${queryString}`);
  },

  async getTaskStats(): Promise<{ stats: any }> {
    return request<{ success: boolean; stats: any }>('/tasks/stats');
  },

  async getTaskById(id: string): Promise<{ task: Task }> {
    return request<{ success: boolean; task: Task }>(`/tasks/${id}`);
  },

  async createTask(data: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignee_id?: string | null;
    dueDate?: string | null;
    tags?: string[];
  }): Promise<{ task: Task }> {
    return request<{ success: boolean; task: Task }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTask(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      status: TaskStatus;
      priority: TaskPriority;
      assignee_id: string | null;
      dueDate: string | null;
      tags: string[];
    }>
  ): Promise<{ task: Task }> {
    return request<{ success: boolean; task: Task }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteTask(id: string): Promise<{ message: string; id: string }> {
    return request<{ success: boolean; message: string; id: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  async bulkDelete(ids: string[]): Promise<{ count: number; message: string }> {
    return request<{ success: boolean; count: number; message: string }>('/tasks/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },
};
