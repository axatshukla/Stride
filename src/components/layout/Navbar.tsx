// ============================================================
// Navbar Component — Minimal, Editorial & Interactive Profile
// ============================================================

import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import './Navbar.css';

const searchIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export default function Navbar() {
  const { currentUser, filters, setFilters, setCurrentPage, logout, addToast } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleNav = (page: 'settings' | 'team') => {
    setCurrentPage(page);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    addToast('info', 'Logged out successfully.');
  };

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
        {/* Profile Menu Container */}
        <div className="navbar-profile-container" ref={dropdownRef}>
          <button
            type="button"
            className={`navbar-avatar ${isMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title={currentUser?.name || 'User Profile'}
            aria-label="User Profile Menu"
            aria-expanded={isMenuOpen}
          >
            {currentUser?.initials || 'U'}
          </button>

          {isMenuOpen && (
            <div className="navbar-profile-dropdown" role="menu">
              <div className="dropdown-user-header">
                <div className="dropdown-user-avatar">
                  {currentUser?.initials || 'U'}
                </div>
                <div className="dropdown-user-details">
                  <span className="dropdown-user-name">{currentUser?.name || 'Workspace User'}</span>
                  <span className="dropdown-user-email">{currentUser?.email || ''}</span>
                </div>
              </div>

              <div className="dropdown-divider" />

              <button
                type="button"
                className="dropdown-item"
                onClick={() => handleNav('settings')}
                role="menuitem"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span>Profile & Settings</span>
              </button>

              <button
                type="button"
                className="dropdown-item"
                onClick={() => handleNav('team')}
                role="menuitem"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>Team & Collaborators</span>
              </button>

              <div className="dropdown-divider" />

              <button
                type="button"
                className="dropdown-item dropdown-logout"
                onClick={handleLogout}
                role="menuitem"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15 }}>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
