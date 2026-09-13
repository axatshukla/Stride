// ============================================================
// Stride — Frontend API Client & Service Layer
// ============================================================

import type { Task, User, Team, TeamMember, TeamInvitation, TaskStatus, TaskPriority } from '../types';

const API_BASE_URL = '/api';

/** Stores active JWT in memory & localStorage */
let authToken: string | null = localStorage.getItem('taskflow_token');
let activeTeamId: string | null = localStorage.getItem('stride_active_team_id');

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

export function setActiveTeamIdHeader(teamId: string | null): void {
  activeTeamId = teamId;
  if (teamId) {
    localStorage.setItem('stride_active_team_id', teamId);
  } else {
    localStorage.removeItem('stride_active_team_id');
  }
}

export function getActiveTeamIdHeader(): string | null {
  return activeTeamId;
}

/** Core HTTP request wrapper with Bearer token & Team-ID injection */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  headers.set('Content-Type', 'application/json');

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  if (activeTeamId) {
    headers.set('x-team-id', activeTeamId);
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
  async login(email: string, password: string): Promise<{ user: User; teams: Team[]; token: string }> {
    const res = await request<{ success: boolean; user: User; teams: Team[]; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.token);
    return res;
  },

  async signup(name: string, email: string, password: string, inviteToken?: string): Promise<{ user: User; teams: Team[]; token: string }> {
    const res = await request<{ success: boolean; user: User; teams: Team[]; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, inviteToken }),
    });
    setAuthToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User; teams: Team[] }> {
    return request<{ success: boolean; user: User; teams: Team[] }>('/auth/me');
  },

  async getUsers(): Promise<{ users: User[] }> {
    return request<{ success: boolean; users: User[] }>('/auth/users');
  },
};

// -- Team & Multi-Tenant Workspace Service Endpoints --
export const teamApi = {
  async getTeams(): Promise<{ teams: Team[] }> {
    return request<{ success: boolean; teams: Team[] }>('/teams');
  },

  async createTeam(name: string): Promise<{ team: Team }> {
    return request<{ success: boolean; team: Team }>('/teams', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  async getTeamMembers(teamId: string): Promise<{ members: TeamMember[] }> {
    return request<{ success: boolean; members: TeamMember[] }>(`/teams/${teamId}/members`);
  },

  async inviteMember(teamId: string, email: string, role = 'member'): Promise<{
    success: boolean;
    emailSent?: boolean;
    emailError?: string;
    message: string;
    inviteUrl: string;
    simulated: boolean;
  }> {
    return request<{
      success: boolean;
      emailSent?: boolean;
      emailError?: string;
      message: string;
      inviteUrl: string;
      simulated: boolean;
    }>(`/teams/${teamId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },

  async getPendingInvitations(teamId: string): Promise<{ invitations: TeamInvitation[] }> {
    return request<{ success: boolean; invitations: TeamInvitation[] }>(`/teams/${teamId}/invitations`);
  },

  async getInvitationByToken(token: string): Promise<{ invitation: TeamInvitation }> {
    return request<{ success: boolean; invitation: TeamInvitation }>(`/teams/invite/${token}`);
  },

  async acceptInvitation(token: string): Promise<{ team: Team }> {
    return request<{ success: boolean; team: Team }>(`/teams/invite/${token}/accept`, {
      method: 'POST',
    });
  },

  async removeMember(teamId: string, userId: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/teams/${teamId}/members/${userId}`, {
      method: 'DELETE',
    });
  },
};

// -- Task Service Endpoints --
export const taskApi = {
  async getTasks(params: { status?: string; priority?: string; search?: string; sortBy?: string; teamId?: string } = {}): Promise<{ tasks: Task[]; count: number }> {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.priority && params.priority !== 'all') query.set('priority', params.priority);
    if (params.search) query.set('search', params.search);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.teamId) query.set('teamId', params.teamId);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<{ success: boolean; tasks: Task[]; count: number }>(`/tasks${queryString}`);
  },

  async getTaskStats(teamId?: string): Promise<{ stats: any }> {
    const query = teamId ? `?teamId=${teamId}` : '';
    return request<{ success: boolean; stats: any }>(`/tasks/stats${query}`);
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
    teamId?: string | null;
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
      teamId: string | null;
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
