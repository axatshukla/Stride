// ============================================================
// DashboardGrid — Quiet, Editorial, Human-Designed Product UI
// ============================================================

import { useApp } from '../../context/AppContext';
import StatusBadge from '../ui/StatusBadge';
import PriorityBadge from '../ui/PriorityBadge';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { getTaskStats, formatDate } from '../../utils/helpers';
import './Dashboard.css';

export default function DashboardGrid() {
  const {
    currentUser,
    tasks,
    setCurrentPage,
    setEditingTask,
    setCreateModalOpen,
    toggleTaskSelection,
    selectedTaskIds,
  } = useApp();

  const stats = getTaskStats(tasks);

  // Recent 5 tasks sorted by update
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Upcoming 4 tasks with due dates
  const upcomingTasks = [...tasks]
    .filter(t => t.dueDate && t.status !== 'done')
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 4);

  const formatShortDate = (isoStr: string | null) => {
    if (!isoStr) return 'TBD';
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  };

  const highPct = stats.total > 0 ? Math.round((stats.highPriority / stats.total) * 100) : 0;
  const medPct = stats.total > 0 ? Math.round((stats.mediumPriority / stats.total) * 100) : 0;
  const lowPct = stats.total > 0 ? Math.round((stats.lowPriority / stats.total) * 100) : 0;

  // Dynamic greeting and formatted current date
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="dashboard-root">
      {/* 1. Page Header */}
      <div className="dashboard-header">
        <div className="dashboard-title-area">
          <h1 className="dashboard-main-heading">{greeting}, {currentUser?.name?.split(' ')[0] || 'there'}.</h1>
          <p className="dashboard-subtitle">
            {stats.total === 0
              ? 'Welcome to your workspace. Create your first task to start tracking deliverables.'
              : `Your sprint is moving steadily. ${stats.done} of ${stats.total} tasks are complete.`}
          </p>
        </div>

        <div className="dashboard-header-right">
          <div className="dashboard-date-quote">
            <span className="dashboard-date-text">{dateFormatted}</span>
            <span className="dashboard-quote-text">"Discipline turns goals into reality."</span>
          </div>

          <Button
            variant="primary"
            onClick={() => setCreateModalOpen(true)}
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            }
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* 2. Metrics Section — One Horizontal Strip with Vertical Dividers */}
      <div className="metrics-strip">
        <div className="metric-item">
          <span className="metric-value">{stats.total}</span>
          <span className="metric-label">Total tasks</span>
          <span className="metric-secondary neutral">
            Active workspace
          </span>
        </div>

        <div className="metric-item">
          <span className="metric-value">{stats.inProgress}</span>
          <span className="metric-label">In progress</span>
          <span className="metric-secondary warning">
            <span className="metric-dot" style={{ background: 'var(--warning)' }} />
            On track
          </span>
        </div>

        <div className="metric-item">
          <span className="metric-value">{stats.done}</span>
          <span className="metric-label">Completed</span>
          <span className="metric-secondary positive">
            <span className="metric-dot" style={{ background: 'var(--success)' }} />
            {stats.completionRate}% completion rate
          </span>
        </div>

        <div className="metric-item">
          <span className="metric-value">{stats.highPriority}</span>
          <span className="metric-label">High priority</span>
          <span className={`metric-secondary ${stats.overdue > 0 ? 'danger' : 'neutral'}`}>
            <span className="metric-dot" style={{ background: stats.overdue > 0 ? 'var(--error)' : '#94A3B8' }} />
            {stats.overdue > 0 ? `${stats.overdue} overdue` : '0 overdue'}
          </span>
        </div>
      </div>

      {/* 3. Main Content: 70% Left Workspace / 30% Right Rail */}
      <div className="dashboard-grid-layout">
        {/* Left Column (Primary Workspace) */}
        <div className="dashboard-left-col">
          {/* Recent Tasks (Hero Section) */}
          <div className="recent-tasks-section">
            <div className="dash-section-header">
              <span className="dash-section-title">Recent Tasks</span>
              {recentTasks.length > 0 && (
                <button
                  className="dash-section-link"
                  onClick={() => setCurrentPage('tasks')}
                >
                  View all →
                </button>
              )}
            </div>

            <div className="recent-tasks-container">
              {recentTasks.length === 0 ? (
                <div className="recent-empty-wrap">
                  <div className="recent-empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                      <path d="M9 12l2 2 4-4"></path>
                    </svg>
                  </div>
                  <div className="recent-empty-title">No tasks yet.</div>
                  <div className="recent-empty-sub">Create your first task to start organizing your work.</div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setCreateModalOpen(true)}
                    icon={
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    }
                  >
                    Create Task
                  </Button>
                </div>
              ) : (
                <table className="recent-table">
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}></th>
                      <th style={{ width: 80 }}>Task</th>
                      <th>Name</th>
                      <th style={{ width: 110 }}>Status</th>
                      <th style={{ width: 90 }}>Priority</th>
                      <th style={{ width: 70 }}>Assignee</th>
                      <th style={{ width: 110 }}>Due Date</th>
                      <th style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTasks.map(task => {
                      const isSelected = selectedTaskIds.includes(task.id);
                      return (
                        <tr
                          key={task.id}
                          onClick={() => setEditingTask(task)}
                        >
                          <td onClick={e => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleTaskSelection(task.id)}
                              style={{ cursor: 'pointer', accentColor: 'var(--accent)' }}
                              aria-label={`Select task ${task.key}`}
                            />
                          </td>
                          <td>
                            <span className="recent-key">{task.key}</span>
                          </td>
                          <td>
                            <div className="recent-title">{task.title}</div>
                          </td>
                          <td>
                            <StatusBadge status={task.status} />
                          </td>
                          <td>
                            <PriorityBadge priority={task.priority} />
                          </td>
                          <td>
                            <Avatar user={task.assignee} size="sm" />
                          </td>
                          <td>
                            <span className="recent-due">{formatDate(task.dueDate)}</span>
                          </td>
                          <td onClick={e => e.stopPropagation()}>
                            <button
                              className="recent-action-dots"
                              onClick={() => setEditingTask(task)}
                              aria-label="Edit task"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="19" cy="12" r="1"></circle>
                                <circle cx="5" cy="12" r="1"></circle>
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="priority-breakdown-section">
            <span className="dash-section-title">Priority Breakdown</span>
            <div className="priority-list">
              <div className="priority-row">
                <span className="priority-label high">High Priority</span>
                <div className="priority-bar-track">
                  <div
                    className="priority-bar-fill"
                    style={{ width: `${highPct}%`, background: 'var(--priority-high)' }}
                  />
                </div>
                <span className="priority-stat-text">{stats.highPriority} tasks ({highPct}%)</span>
              </div>

              <div className="priority-row">
                <span className="priority-label medium">Medium Priority</span>
                <div className="priority-bar-track">
                  <div
                    className="priority-bar-fill"
                    style={{ width: `${medPct}%`, background: 'var(--priority-medium)' }}
                  />
                </div>
                <span className="priority-stat-text">{stats.mediumPriority} tasks ({medPct}%)</span>
              </div>

              <div className="priority-row">
                <span className="priority-label low">Low Priority</span>
                <div className="priority-bar-track">
                  <div
                    className="priority-bar-fill"
                    style={{ width: `${lowPct}%`, background: 'var(--priority-low)' }}
                  />
                </div>
                <span className="priority-stat-text">{stats.lowPriority} tasks ({lowPct}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Rail (Secondary Modules) */}
        <div className="dashboard-right-col">
          {/* Sprint Progress */}
          <div className="dash-card">
            <div className="dash-card-header">
              <span className="dash-card-title">Sprint Progress</span>
              <span className="dash-card-badge-select">Active Sprint</span>
            </div>

            <div className="sprint-progress-stat">
              <span className="sprint-percent">{stats.completionRate}%</span>
              <span className="sprint-percent-lbl">completion</span>
            </div>

            <div className="sprint-bar-track">
              <div
                className="sprint-bar-fill"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>

            <div className="sprint-legend-row">
              <div className="sprint-legend-item">
                <span className="legend-dot-sm" style={{ background: 'var(--success)' }} />
                <span><strong>{stats.done}</strong> Completed</span>
              </div>
              <div className="sprint-legend-item">
                <span className="legend-dot-sm" style={{ background: 'var(--warning)' }} />
                <span><strong>{stats.inProgress}</strong> In Progress</span>
              </div>
              <div className="sprint-legend-item">
                <span className="legend-dot-sm" style={{ background: '#94A3B8' }} />
                <span><strong>{stats.todo}</strong> Remaining</span>
              </div>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="dash-card">
            <div className="dash-card-header">
              <span className="dash-card-title">Upcoming</span>
              {upcomingTasks.length > 0 && (
                <button
                  className="dash-section-link"
                  onClick={() => setCurrentPage('tasks')}
                >
                  View all →
                </button>
              )}
            </div>

            <div className="upcoming-list">
              {upcomingTasks.length === 0 ? (
                <div className="upcoming-empty-wrap">
                  <div className="upcoming-empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                  <div className="upcoming-empty-title">No upcoming deadlines scheduled.</div>
                  <div className="upcoming-empty-sub">Focus on your tasks and make progress!</div>
                </div>
              ) : (
                upcomingTasks.map(task => (
                  <div
                    key={task.id}
                    className="upcoming-item"
                    onClick={() => setEditingTask(task)}
                  >
                    <div className="upcoming-left">
                      <span className="upcoming-date">{formatShortDate(task.dueDate)}</span>
                      <span className="upcoming-task-title">{task.title}</span>
                    </div>
                    <PriorityBadge priority={task.priority} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
