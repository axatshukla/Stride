// ============================================================
// TaskFlow — Application Context & Live API Integration
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, taskApi, setAuthToken, getAuthToken } from '../services/api';
import { generateId } from '../utils/helpers';
import type { Task, User, TaskFilters, Page, ToastMessage, TaskStatus, TaskPriority } from '../types';

interface AppContextType {
  // Auth
  currentUser: User;
  users: User[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Tasks
  tasks: Task[];
  createTask: (data: Omit<Task, 'id' | 'key' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
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
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;
}

const fallbackUser: User = {
  id: 'u1',
  name: 'Akshat Shukla',
  email: 'akshat@taskflow.dev',
  initials: 'AS',
  color: '#4F46E5',
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  // -- Auth State --
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(getAuthToken()));
  const [user, setUser] = useState<User>(fallbackUser);
  const [users, setUsers] = useState<User[]>([fallbackUser]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  // -- Data Fetching Helpers --
  const refreshTasks = useCallback(async () => {
    try {
      const res = await taskApi.getTasks();
      setTasks(res.tasks);
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (token) {
        const [meRes, usersRes, tasksRes] = await Promise.all([
          authApi.getMe(),
          authApi.getUsers(),
          taskApi.getTasks(),
        ]);
        setUser(meRes.user);
        setUsers(usersRes.users);
        setTasks(tasksRes.tasks);
        setIsAuthenticated(true);
      } else {
        // Auto-login demo user for immediate instant usability
        const loginRes = await authApi.login('akshat@taskflow.dev', 'password123');
        setUser(loginRes.user);
        setIsAuthenticated(true);
        const [usersRes, tasksRes] = await Promise.all([
          authApi.getUsers(),
          taskApi.getTasks(),
        ]);
        setUsers(usersRes.users);
        setTasks(tasksRes.tasks);
      }
    } catch (err: any) {
      console.error('Initial data load error:', err);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // -- Auth Actions --
  const login = useCallback(async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await authApi.login(email, pass);
      setUser(res.user);
      setIsAuthenticated(true);
      const [usersRes, tasksRes] = await Promise.all([
        authApi.getUsers(),
        taskApi.getTasks(),
      ]);
      setUsers(usersRes.users);
      setTasks(tasksRes.tasks);
      return true;
    } catch (err: any) {
      addToast('error', err.message || 'Login failed');
      return false;
    }
  }, [addToast]);

  const signup = useCallback(async (name: string, email: string, pass: string): Promise<boolean> => {
    try {
      const res = await authApi.signup(name, email, pass);
      setUser(res.user);
      setIsAuthenticated(true);
      const [usersRes, tasksRes] = await Promise.all([
        authApi.getUsers(),
        taskApi.getTasks(),
      ]);
      setUsers(usersRes.users);
      setTasks(tasksRes.tasks);
      return true;
    } catch (err: any) {
      addToast('error', err.message || 'Registration failed');
      return false;
    }
  }, [addToast]);

  const logout = useCallback(() => {
    setAuthToken(null);
    setIsAuthenticated(false);
    setTasks([]);
  }, []);

  // -- Task Actions (Calling Live API with State Synchronization) --
  const createTask = useCallback(async (data: Omit<Task, 'id' | 'key' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
    try {
      const res = await taskApi.createTask({
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assignee_id: data.assignee?.id || null,
        dueDate: data.dueDate,
        tags: data.tags,
      });
      setTasks(prev => [res.task, ...prev]);
    } catch (err: any) {
      addToast('error', `Failed to create task: ${err.message}`);
    }
  }, [addToast]);

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
    } catch (err: any) {
      addToast('error', `Failed to delete task: ${err.message}`);
    }
  }, [addToast]);

  const deleteTasks = useCallback(async (ids: string[]) => {
    try {
      await taskApi.bulkDelete(ids);
      setTasks(prev => prev.filter(t => !ids.includes(t.id)));
      setSelectedTaskIds([]);
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
