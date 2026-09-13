// ============================================================
// TaskFlow / Stride — Application Context & Live API Integration
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, taskApi, teamApi, setAuthToken, getAuthToken, setActiveTeamIdHeader, getActiveTeamIdHeader } from '../services/api';
import { generateId } from '../utils/helpers';
import type { Task, User, Team, TeamMember, TeamInvitation, TaskFilters, Page, ToastMessage, TaskStatus, TaskPriority } from '../types';

interface AppContextType {
  // Auth
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Multi-Tenant Teams / Workspaces
  teams: Team[];
  activeTeam: Team | null;
  teamMembers: TeamMember[];
  pendingInvitations: TeamInvitation[];
  switchTeam: (team: Team) => Promise<void>;
  createTeam: (name: string) => Promise<{ success: boolean; team?: Team; error?: string }>;
  inviteMember: (email: string, role?: string) => Promise<{ success: boolean; inviteUrl?: string; simulated?: boolean; error?: string }>;
  removeMember: (userId: string) => Promise<{ success: boolean; error?: string }>;
  refreshTeamData: () => Promise<void>;
  acceptInviteToken: (token: string) => Promise<{ success: boolean; team?: Team; error?: string }>;
  pendingInviteToken: string | null;
  clearPendingInviteToken: () => void;

  // Tasks
  tasks: Task[];
  createTask: (data: Omit<Task, 'id' | 'key' | 'createdAt' | 'updatedAt' | 'createdBy' | 'teamId'>) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  deleteTasks: (ids: string[]) => Promise<void>;
  moveTask: (id: string, status: TaskStatus) => Promise<void>;
  refreshTasks: () => Promise<void>;

  // Filters
  filters: TaskFilters;
  setFilters: (f: Partial<TaskFilters>) => void;
  filteredTasks: Task[];

  // Selection
  selectedTaskIds: string[];
  toggleTaskSelection: (id: string) => void;
  selectAllTasks: () => void;
  clearSelection: () => void;

  // Navigation
  currentPage: Page;
  setCurrentPage: (page: Page) => void;

  // Modals
  isCreateModalOpen: boolean;
  setCreateModalOpen: (open: boolean) => void;
  isCreateTeamModalOpen: boolean;
  setCreateTeamModalOpen: (open: boolean) => void;
  isInviteModalOpen: boolean;
  setInviteModalOpen: (open: boolean) => void;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // -- Auth State --
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // -- Multi-Tenant Teams State --
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<TeamInvitation[]>([]);
  const [pendingInviteToken, setPendingInviteToken] = useState<string | null>(() => {
    // Check URL parameters for ?token=... or ?invite=...
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token') || urlParams.get('invite');
    if (tokenFromUrl) {
      localStorage.setItem('stride_pending_invite_token', tokenFromUrl);
      return tokenFromUrl;
    }
    return localStorage.getItem('stride_pending_invite_token');
  });

  // -- Task State --
  const [tasks, setTasks] = useState<Task[]>([]);

  // -- Filter State --
  const [filters, setFiltersState] = useState<TaskFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    sortBy: 'newest',
  });

  // -- Selection State --
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // -- Navigation State --
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  // -- Modal State --
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isCreateTeamModalOpen, setCreateTeamModalOpen] = useState(false);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // -- Toast State --
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // -- Toast Helper --
  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = generateId();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearPendingInviteToken = useCallback(() => {
    setPendingInviteToken(null);
    localStorage.removeItem('stride_pending_invite_token');
  }, []);

  // -- Team & Task Fetching Helpers --
  const refreshTasks = useCallback(async () => {
    try {
      const res = await taskApi.getTasks();
      setTasks(res.tasks);
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
    }
  }, []);

  const refreshTeamData = useCallback(async () => {
    if (!activeTeam) return;
    try {
      const [membersRes, invitesRes, tasksRes] = await Promise.all([
        teamApi.getTeamMembers(activeTeam.id).catch(() => ({ members: [] })),
        teamApi.getPendingInvitations(activeTeam.id).catch(() => ({ invitations: [] })),
        taskApi.getTasks().catch(() => ({ tasks: [] })),
      ]);
      setTeamMembers(membersRes.members);
      setPendingInvitations(invitesRes.invitations);
      setTasks(tasksRes.tasks);
    } catch (err: any) {
      console.error('Failed to refresh team data:', err);
    }
  }, [activeTeam]);

  const switchTeam = useCallback(async (team: Team) => {
    setActiveTeam(team);
    setActiveTeamIdHeader(team.id);
    setSelectedTaskIds([]);
    try {
      const [membersRes, invitesRes, tasksRes] = await Promise.all([
        teamApi.getTeamMembers(team.id).catch(() => ({ members: [] })),
        teamApi.getPendingInvitations(team.id).catch(() => ({ invitations: [] })),
        taskApi.getTasks().catch(() => ({ tasks: [] })),
      ]);
      setTeamMembers(membersRes.members);
      setPendingInvitations(invitesRes.invitations);
      setTasks(tasksRes.tasks);
      addToast('success', `Switched to workspace "${team.name}"`);
    } catch (err: any) {
      console.error('Error switching team:', err);
    }
  }, [addToast]);

  const acceptInviteToken = useCallback(async (token: string): Promise<{ success: boolean; team?: Team; error?: string }> => {
    try {
      const res = await teamApi.acceptInvitation(token);
      clearPendingInviteToken();
      
      // Refresh teams list
      const teamsRes = await teamApi.getTeams();
      setTeams(teamsRes.teams);
      
      // Auto-switch to accepted team
      if (res.team) {
        await switchTeam(res.team);
      }
      
      addToast('success', `Joined team "${res.team.name}" successfully!`);
      return { success: true, team: res.team };
    } catch (err: any) {
      const msg = err.message || 'Failed to accept invitation token.';
      addToast('error', msg);
      return { success: false, error: msg };
    }
  }, [addToast, clearPendingInviteToken, switchTeam]);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (token) {
        const [meRes, usersRes] = await Promise.all([
          authApi.getMe(),
          authApi.getUsers().catch(() => ({ users: [] })),
        ]);
        setUser(meRes.user);
        setUsers(usersRes.users);
        setIsAuthenticated(true);

        const userTeams = meRes.teams || [];
        setTeams(userTeams);

        // Check if there's a pending invite token to auto-accept
        const storedInviteToken = localStorage.getItem('stride_pending_invite_token');
        if (storedInviteToken) {
          try {
            const accepted = await teamApi.acceptInvitation(storedInviteToken);
            localStorage.removeItem('stride_pending_invite_token');
            setPendingInviteToken(null);
            
            // Refetch teams after accepting
            const updatedTeamsRes = await teamApi.getTeams();
            const allTeams = updatedTeamsRes.teams;
            setTeams(allTeams);
            const joinedTeam = allTeams.find(t => t.id === accepted.team.id) || accepted.team;
            setActiveTeam(joinedTeam);
            setActiveTeamIdHeader(joinedTeam.id);

            const [mRes, iRes, tRes] = await Promise.all([
              teamApi.getTeamMembers(joinedTeam.id).catch(() => ({ members: [] })),
              teamApi.getPendingInvitations(joinedTeam.id).catch(() => ({ invitations: [] })),
              taskApi.getTasks().catch(() => ({ tasks: [] })),
            ]);
            setTeamMembers(mRes.members);
            setPendingInvitations(iRes.invitations);
            setTasks(tRes.tasks);
            addToast('success', `Joined team "${joinedTeam.name}"!`);
            setIsLoading(false);
            return;
          } catch (invErr: any) {
            console.error('Failed to auto-accept invite token on startup:', invErr);
          }
        }

        // Determine active team
        if (userTeams.length > 0) {
          const storedTeamId = getActiveTeamIdHeader();
          const targetTeam = userTeams.find(t => t.id === storedTeamId) || userTeams[0];
          setActiveTeam(targetTeam);
          setActiveTeamIdHeader(targetTeam.id);

          const [mRes, iRes, tRes] = await Promise.all([
            teamApi.getTeamMembers(targetTeam.id).catch(() => ({ members: [] })),
            teamApi.getPendingInvitations(targetTeam.id).catch(() => ({ invitations: [] })),
            taskApi.getTasks().catch(() => ({ tasks: [] })),
          ]);
          setTeamMembers(mRes.members);
          setPendingInvitations(iRes.invitations);
          setTasks(tRes.tasks);
        } else {
          setActiveTeam(null);
          setTeamMembers([]);
          setPendingInvitations([]);
          setTasks([]);
        }
      } else {
        // No active session — start cleanly on the login screen
        setIsAuthenticated(false);
        setUser(null);
        setTeams([]);
        setActiveTeam(null);
        setTeamMembers([]);
        setPendingInvitations([]);
        setTasks([]);
        setUsers([]);
      }
    } catch (err: any) {
      console.error('Initial data load error / session expired:', err);
      setAuthToken(null);
      setIsAuthenticated(false);
      setUser(null);
      setTeams([]);
      setActiveTeam(null);
      setTeamMembers([]);
      setPendingInvitations([]);
      setTasks([]);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // -- Auth Actions --
  const login = useCallback(async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await authApi.login(email, pass);
      setUser(res.user);
      setIsAuthenticated(true);
      const userTeams = res.teams || [];
      setTeams(userTeams);

      // Check if pending invite token exists
      const storedInvite = localStorage.getItem('stride_pending_invite_token');
      if (storedInvite) {
        try {
          await teamApi.acceptInvitation(storedInvite);
          localStorage.removeItem('stride_pending_invite_token');
          setPendingInviteToken(null);
          const updatedTeams = await teamApi.getTeams();
          setTeams(updatedTeams.teams);
          if (updatedTeams.teams.length > 0) {
            const firstTeam = updatedTeams.teams[0];
            setActiveTeam(firstTeam);
            setActiveTeamIdHeader(firstTeam.id);
            const [mRes, iRes, tRes] = await Promise.all([
              teamApi.getTeamMembers(firstTeam.id).catch(() => ({ members: [] })),
              teamApi.getPendingInvitations(firstTeam.id).catch(() => ({ invitations: [] })),
              taskApi.getTasks().catch(() => ({ tasks: [] })),
            ]);
            setTeamMembers(mRes.members);
            setPendingInvitations(iRes.invitations);
            setTasks(tRes.tasks);
            return { success: true };
          }
        } catch (invErr) {
          console.error('Failed to auto-join team after login:', invErr);
        }
      }

      if (userTeams.length > 0) {
        const firstTeam = userTeams[0];
        setActiveTeam(firstTeam);
        setActiveTeamIdHeader(firstTeam.id);

        const [mRes, iRes, tRes] = await Promise.all([
          teamApi.getTeamMembers(firstTeam.id).catch(() => ({ members: [] })),
          teamApi.getPendingInvitations(firstTeam.id).catch(() => ({ invitations: [] })),
          taskApi.getTasks().catch(() => ({ tasks: [] })),
        ]);
        setTeamMembers(mRes.members);
        setPendingInvitations(iRes.invitations);
        setTasks(tRes.tasks);
      }

      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Incorrect email or password.';
      addToast('error', msg);
      return { success: false, error: msg };
    }
  }, [addToast]);

  const signup = useCallback(async (name: string, email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const storedInvite = localStorage.getItem('stride_pending_invite_token') || undefined;
      const res = await authApi.signup(name, email, pass, storedInvite);
      setUser(res.user);
      setIsAuthenticated(true);
      if (storedInvite) {
        localStorage.removeItem('stride_pending_invite_token');
        setPendingInviteToken(null);
      }

      const userTeams = res.teams || [];
      setTeams(userTeams);

      if (userTeams.length > 0) {
        const firstTeam = userTeams[0];
        setActiveTeam(firstTeam);
        setActiveTeamIdHeader(firstTeam.id);

        const [mRes, iRes, tRes] = await Promise.all([
          teamApi.getTeamMembers(firstTeam.id).catch(() => ({ members: [] })),
          teamApi.getPendingInvitations(firstTeam.id).catch(() => ({ invitations: [] })),
          taskApi.getTasks().catch(() => ({ tasks: [] })),
        ]);
        setTeamMembers(mRes.members);
        setPendingInvitations(iRes.invitations);
        setTasks(tRes.tasks);
      }

      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Registration failed.';
      addToast('error', msg);
      return { success: false, error: msg };
    }
  }, [addToast]);

  const logout = useCallback(() => {
    setAuthToken(null);
    setActiveTeamIdHeader(null);
    setIsAuthenticated(false);
    setUser(null);
    setTeams([]);
    setActiveTeam(null);
    setTeamMembers([]);
    setPendingInvitations([]);
    setTasks([]);
    setUsers([]);
    setCurrentPage('dashboard');
  }, []);

  // -- Team Actions --
  const createTeam = useCallback(async (name: string): Promise<{ success: boolean; team?: Team; error?: string }> => {
    try {
      const res = await teamApi.createTeam(name);
      setTeams(prev => [res.team, ...prev]);
      await switchTeam(res.team);
      addToast('success', `Team workspace "${name}" created!`);
      return { success: true, team: res.team };
    } catch (err: any) {
      const msg = err.message || 'Failed to create team.';
      addToast('error', msg);
      return { success: false, error: msg };
    }
  }, [addToast, switchTeam]);

  const inviteMember = useCallback(async (email: string, role = 'member'): Promise<{
    success: boolean;
    inviteUrl?: string;
    simulated?: boolean;
    error?: string;
  }> => {
    if (!activeTeam) {
      addToast('error', 'No active team selected.');
      return { success: false, error: 'No active team selected.' };
    }
    try {
      const res = await teamApi.inviteMember(activeTeam.id, email, role);
      // Refresh pending invitations
      const invitesRes = await teamApi.getPendingInvitations(activeTeam.id);
      setPendingInvitations(invitesRes.invitations);
      addToast('success', `Invitation email sent to ${email}!`);
      return {
        success: true,
        inviteUrl: res.inviteUrl,
        simulated: res.simulated,
      };
    } catch (err: any) {
      const msg = err.message || 'Failed to invite team member.';
      addToast('error', msg);
      return { success: false, error: msg };
    }
  }, [activeTeam, addToast]);

  const removeMember = useCallback(async (userId: string): Promise<{ success: boolean; error?: string }> => {
    if (!activeTeam) return { success: false, error: 'No active team' };
    try {
      await teamApi.removeMember(activeTeam.id, userId);
      setTeamMembers(prev => prev.filter(m => m.id !== userId));
      addToast('success', 'Member removed from team.');
      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Failed to remove member.';
      addToast('error', msg);
      return { success: false, error: msg };
    }
  }, [activeTeam, addToast]);

  // -- Task Actions (Live API with active workspace partition) --
  const createTask = useCallback(async (data: Omit<Task, 'id' | 'key' | 'createdAt' | 'updatedAt' | 'createdBy' | 'teamId'>) => {
    try {
      const res = await taskApi.createTask({
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assignee_id: data.assignee?.id || null,
        dueDate: data.dueDate,
        tags: data.tags,
        teamId: activeTeam?.id,
      });
      setTasks(prev => [res.task, ...prev]);
      addToast('success', `Task ${res.task.key} created`);
    } catch (err: any) {
      addToast('error', `Failed to create task: ${err.message}`);
    }
  }, [activeTeam, addToast]);

  const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
    try {
      const res = await taskApi.updateTask(id, {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assignee_id: data.assignee ? data.assignee.id : (data.assignee === null ? null : undefined),
        dueDate: data.dueDate,
        tags: data.tags,
      });
      setTasks(prev => prev.map(t => (t.id === id ? res.task : t)));
    } catch (err: any) {
      addToast('error', `Failed to update task: ${err.message}`);
    }
  }, [addToast]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await taskApi.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      setSelectedTaskIds(prev => prev.filter(sid => sid !== id));
      addToast('info', 'Task deleted');
    } catch (err: any) {
      addToast('error', `Failed to delete task: ${err.message}`);
    }
  }, [addToast]);

  const deleteTasks = useCallback(async (ids: string[]) => {
    try {
      await taskApi.bulkDelete(ids);
      setTasks(prev => prev.filter(t => !ids.includes(t.id)));
      setSelectedTaskIds([]);
      addToast('info', `${ids.length} tasks deleted`);
    } catch (err: any) {
      addToast('error', `Failed to delete tasks: ${err.message}`);
    }
  }, [addToast]);

  const moveTask = useCallback(async (id: string, status: TaskStatus) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => (t.id === id ? { ...t, status } : t)));
      await taskApi.updateTask(id, { status });
    } catch (err: any) {
      addToast('error', `Failed to move task: ${err.message}`);
      refreshTasks();
    }
  }, [addToast, refreshTasks]);

  // -- Filter Actions --
  const setFilters = useCallback((partial: Partial<TaskFilters>) => {
    setFiltersState(prev => ({ ...prev, ...partial }));
  }, []);

  // -- Computed: Filtered Tasks --
  const filteredTasks = tasks.filter(task => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matches =
        task.title.toLowerCase().includes(q) ||
        task.key.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q) ||
        (task.assignee?.name.toLowerCase().includes(q) ?? false);
      if (!matches) return false;
    }
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'priority': {
        const pw: Record<TaskPriority, number> = { high: 3, medium: 2, low: 1 };
        return pw[b.priority] - pw[a.priority];
      }
      case 'due-date': {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  // -- Selection Actions --
  const toggleTaskSelection = useCallback((id: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  }, []);

  const selectAllTasks = useCallback(() => {
    setSelectedTaskIds(prev =>
      prev.length === filteredTasks.length ? [] : filteredTasks.map(t => t.id)
    );
  }, [filteredTasks]);

  const clearSelection = useCallback(() => {
    setSelectedTaskIds([]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser: user,
        users,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        teams,
        activeTeam,
        teamMembers,
        pendingInvitations,
        switchTeam,
        createTeam,
        inviteMember,
        removeMember,
        refreshTeamData,
        acceptInviteToken,
        pendingInviteToken,
        clearPendingInviteToken,
        tasks,
        createTask,
        updateTask,
        deleteTask,
        deleteTasks,
        moveTask,
        refreshTasks,
        filters,
        setFilters,
        filteredTasks,
        selectedTaskIds,
        toggleTaskSelection,
        selectAllTasks,
        clearSelection,
        currentPage,
        setCurrentPage,
        isCreateModalOpen,
        setCreateModalOpen,
        isCreateTeamModalOpen,
        setCreateTeamModalOpen,
        isInviteModalOpen,
        setInviteModalOpen,
        editingTask,
        setEditingTask,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}


