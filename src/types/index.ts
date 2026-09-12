// ============================================================
// Task Tracker — Core Type Definitions
// ============================================================

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
  color: string;
}

export interface Task {
  id: string;
  key: string;           // e.g. "TSK-27"
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: User | null;
  createdBy: User;
  createdAt: string;     // ISO date string
  updatedAt: string;
  dueDate: string | null;
  tags: string[];
}

export interface TaskFilters {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  sortBy: 'newest' | 'oldest' | 'priority' | 'due-date' | 'title';
}

export type ViewMode = 'list' | 'board';
export type Page = 'dashboard' | 'tasks' | 'board' | 'calendar' | 'analytics' | 'team' | 'tags' | 'settings';

export interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  tasks: Task[];
  filters: TaskFilters;
  viewMode: ViewMode;
  currentPage: Page;
  selectedTaskIds: string[];
  editingTask: Task | null;
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  toasts: ToastMessage[];
  isLoading: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
