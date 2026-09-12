// ============================================================
// Sidebar Component — Clean, Calm, Human-Designed
// ============================================================

import { useApp } from '../../context/AppContext';
import type { Page } from '../../types';
import './Sidebar.css';

const icons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  ),
  tasks: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4"></polyline>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </svg>
  ),
  board: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  analytics: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  ),
  team: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  tags: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
      <line x1="7" y1="7" x2="7.01" y2="7"></line>
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  ),
};

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { currentPage, setCurrentPage, currentUser, logout, tasks } = useApp();

  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;

  const handleNav = (page: Page) => {
    setCurrentPage(page);
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={onToggle}
        aria-label="Toggle navigation"
      >
        {icons.menu}
      </button>

      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onToggle}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`} role="navigation" aria-label="Main navigation">
        {/* Brand */}
        <div className="sidebar-brand">
          <img src="/logo.png" alt="Stride" className="sidebar-brand-img" />
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">Stride</span>
            <span className="sidebar-brand-tagline">Make progress, every day.</span>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="sidebar-nav">
          {/* Workspace */}
          <div className="sidebar-group">
            <div className="sidebar-group-label">Workspace</div>
            
            <button
              className={`sidebar-item ${currentPage === 'dashboard' ? 'active' : ''}`}
              onClick={() => handleNav('dashboard')}
            >
              <span className="sidebar-item-icon">{icons.dashboard}</span>
              <span>Dashboard</span>
            </button>

            <button
              className={`sidebar-item ${currentPage === 'tasks' ? 'active' : ''}`}
              onClick={() => handleNav('tasks')}
            >
              <span className="sidebar-item-icon">{icons.tasks}</span>
              <span>Tasks</span>
              {inProgressCount > 0 && (
                <span className="sidebar-item-badge">{inProgressCount}</span>
              )}
            </button>

            <button
              className={`sidebar-item ${currentPage === 'board' ? 'active' : ''}`}
              onClick={() => handleNav('board')}
            >
              <span className="sidebar-item-icon">{icons.board}</span>
              <span>Board</span>
            </button>

            <button
              className={`sidebar-item ${currentPage === 'calendar' ? 'active' : ''}`}
              onClick={() => handleNav('calendar')}
            >
              <span className="sidebar-item-icon">{icons.calendar}</span>
              <span>Calendar</span>
            </button>

            <button
              className={`sidebar-item ${currentPage === 'analytics' ? 'active' : ''}`}
              onClick={() => handleNav('analytics')}
            >
              <span className="sidebar-item-icon">{icons.analytics}</span>
              <span>Analytics</span>
            </button>
          </div>

          {/* Manage / Private */}
          <div className="sidebar-group">
            <div className="sidebar-group-label">Manage</div>

            <button
              className={`sidebar-item ${currentPage === 'team' ? 'active' : ''}`}
              onClick={() => handleNav('team')}
            >
              <span className="sidebar-item-icon">{icons.team}</span>
              <span>Team</span>
            </button>

            <button
              className={`sidebar-item ${currentPage === 'tags' ? 'active' : ''}`}
              onClick={() => handleNav('tags')}
            >
              <span className="sidebar-item-icon">{icons.tags}</span>
              <span>Tags</span>
            </button>

            <button
              className={`sidebar-item ${currentPage === 'settings' ? 'active' : ''}`}
              onClick={() => handleNav('settings')}
            >
              <span className="sidebar-item-icon">{icons.settings}</span>
              <span>Settings</span>
            </button>
          </div>
        </nav>

        {/* Footer User Profile */}
        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={logout} title="Click to log out">
            <div className="sidebar-user-avatar">
              {currentUser?.initials || 'U'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{currentUser?.name || 'User'}</div>
              <div className="sidebar-user-email">{currentUser?.email || ''}</div>
            </div>
            <span style={{ color: 'var(--text-muted)' }}>
              {icons.logout}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
