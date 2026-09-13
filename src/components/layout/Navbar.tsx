// ============================================================
// Navbar Component — Minimal, Editorial & Workspace Switcher
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

const buildingIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" style={{ width: 14, height: 14 }}>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M8 10h.01" />
    <path d="M16 10h.01" />
    <path d="M8 14h.01" />
    <path d="M16 14h.01" />
  </svg>
);

const chevronIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" style={{ width: 13, height: 13 }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const checkIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" style={{ width: 14, height: 14, color: 'var(--accent)' }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const plusIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" style={{ width: 14, height: 14 }}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function Navbar() {
  const {
    currentUser,
    teams,
    activeTeam,
    switchTeam,
    createTeam,
    isCreateTeamModalOpen,
    setCreateTeamModalOpen,
    filters,
    setFilters,
    setCurrentPage,
    logout,
    addToast
  } = useApp();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const teamDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (teamDropdownRef.current && !teamDropdownRef.current.contains(event.target as Node)) {
        setIsTeamDropdownOpen(false);
      }
    }
    if (isMenuOpen || isTeamDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isTeamDropdownOpen]);

  const handleNav = (page: 'settings' | 'team') => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    setIsTeamDropdownOpen(false);
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    setIsTeamDropdownOpen(false);
    logout();
    addToast('info', 'Logged out successfully.');
  };

  const handleSelectTeam = async (team: typeof teams[0]) => {
    setIsTeamDropdownOpen(false);
    if (activeTeam?.id !== team.id) {
      await switchTeam(team);
    }
  };

  const handleCreateTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setIsCreatingTeam(true);
    const res = await createTeam(newTeamName.trim());
    setIsCreatingTeam(false);
    if (res.success) {
      setNewTeamName('');
      setCreateTeamModalOpen(false);
      setIsTeamDropdownOpen(false);
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-left">
          {/* Team / Workspace Switcher */}
          <div className="navbar-team-container" ref={teamDropdownRef}>
            <button
              type="button"
              className={`navbar-team-btn ${isTeamDropdownOpen ? 'active' : ''}`}
              onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
              title="Switch Workspace / Team"
              aria-label="Workspace Switcher"
              aria-expanded={isTeamDropdownOpen}
            >
              <span className="navbar-team-icon">{buildingIcon}</span>
              <span className="navbar-team-name">{activeTeam?.name || 'My Workspace'}</span>
              <span className={`navbar-team-chevron ${isTeamDropdownOpen ? 'open' : ''}`}>{chevronIcon}</span>
            </button>

            {isTeamDropdownOpen && (
              <div className="navbar-team-dropdown" role="menu">
                <div className="dropdown-section-title">Workspaces & Teams</div>
                <div className="dropdown-team-list">
                  {teams.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`dropdown-team-item ${activeTeam?.id === t.id ? 'active' : ''}`}
                      onClick={() => handleSelectTeam(t)}
                    >
                      <div className="dropdown-team-item-info">
                        <span className="dropdown-team-item-icon">{buildingIcon}</span>
                        <div className="dropdown-team-item-text">
                          <span className="dropdown-team-item-name">{t.name}</span>
                          <span className="dropdown-team-item-role">{t.role || 'Member'}</span>
                        </div>
                      </div>
                      {activeTeam?.id === t.id && <span className="dropdown-team-active-check">{checkIcon}</span>}
                    </button>
                  ))}
                </div>

                <div className="dropdown-divider" />

                <button
                  type="button"
                  className="dropdown-item dropdown-create-team-btn"
                  onClick={() => {
                    setIsTeamDropdownOpen(false);
                    setCreateTeamModalOpen(true);
                  }}
                >
                  {plusIcon}
                  <span>Create New Team</span>
                </button>
              </div>
            )}
          </div>

          {/* Search bar */}
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

      {/* Create Team Modal */}
      {isCreateTeamModalOpen && (
        <div className="modal-overlay" onClick={() => setCreateTeamModalOpen(false)}>
          <div className="modal-card create-team-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-icon">{buildingIcon}</div>
              <div>
                <h2 className="modal-title">Create New Team Workspace</h2>
                <p className="modal-subtitle">Collaborate with team members on dedicated projects and tasks.</p>
              </div>
            </div>

            <form onSubmit={handleCreateTeamSubmit} className="create-team-form">
              <div className="form-group">
                <label className="form-label" htmlFor="teamNameInput">Team Name</label>
                <input
                  id="teamNameInput"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Design Systems, Engineering Core, Alpha Launch"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCreateTeamModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isCreatingTeam || !newTeamName.trim()}
                >
                  {isCreatingTeam ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

