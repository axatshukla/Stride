import { useApp } from '../../context/AppContext';
import Button from '../ui/Button';
import type { TaskPriority, TaskStatus } from '../../types';
import './FilterBar.css';

export default function FilterBar() {
  const {
    filters,
    setFilters,
    currentPage,
    setCurrentPage,
    setCreateModalOpen,
  } = useApp();

  const statusTabs: { id: TaskStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'todo', label: 'To Do' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'done', label: 'Done' },
  ];

  return (
    <div className="filter-bar">
      <div className="filter-left">
        <div className="filter-tabs">
          {statusTabs.map(tab => (
            <button
              key={tab.id}
              className={`filter-tab ${filters.status === tab.id ? 'active' : ''}`}
              onClick={() => setFilters({ status: tab.id })}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <select
          className="filter-select"
          value={filters.priority}
          onChange={e => setFilters({ priority: e.target.value as TaskPriority | 'all' })}
          aria-label="Filter by priority"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        <select
          className="filter-select"
          value={filters.sortBy}
          onChange={e => setFilters({ sortBy: e.target.value as any })}
          aria-label="Sort tasks"
        >
          <option value="newest">Sort: Newest First</option>
          <option value="oldest">Sort: Oldest First</option>
          <option value="priority">Sort: Priority</option>
          <option value="due-date">Sort: Due Date</option>
          <option value="title">Sort: Title (A-Z)</option>
        </select>
      </div>

      <div className="filter-right">
        {/* View Toggle */}
        <div className="view-toggle">
          <button
            className={`view-toggle-btn ${currentPage === 'tasks' ? 'active' : ''}`}
            onClick={() => setCurrentPage('tasks')}
            title="List View"
            aria-label="List view"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
          <button
            className={`view-toggle-btn ${currentPage === 'board' ? 'active' : ''}`}
            onClick={() => setCurrentPage('board')}
            title="Board View"
            aria-label="Board view"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="5" height="18" rx="1" />
              <rect x="10" y="3" width="5" height="12" rx="1" />
              <rect x="17" y="3" width="5" height="15" rx="1" />
            </svg>
          </button>
        </div>

        <Button
          variant="primary"
          onClick={() => setCreateModalOpen(true)}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          New Task
        </Button>
      </div>
    </div>
  );
}
