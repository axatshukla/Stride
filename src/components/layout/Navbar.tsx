// ============================================================
// Navbar Component — Minimal & Quiet
// ============================================================

import { useApp } from '../../context/AppContext';
import './Navbar.css';

const searchIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const bellIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

export default function Navbar() {
  const { currentUser, filters, setFilters, addToast } = useApp();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-search">
          <span className="navbar-search-icon">{searchIcon}</span>
          <input
            className="navbar-search-input"
            type="text"
            placeholder="Search tasks, projects, or anything..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            aria-label="Search tasks"
          />
          <span className="navbar-search-kbd">Ctrl K</span>
        </div>
      </div>

      <div className="navbar-right">
        <button
          className="navbar-icon-btn"
          aria-label="Notifications"
          onClick={() => addToast('info', 'You have no unread notifications.')}
        >
          {bellIcon}
          <span className="badge-dot" />
        </button>

        <div className="navbar-avatar" title={currentUser?.name || 'User'}>
          {currentUser?.initials || 'U'}
        </div>
      </div>
    </header>
  );
}
