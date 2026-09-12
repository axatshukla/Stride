import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import './Settings.css';

export default function Settings() {
  const { currentUser, logout, addToast } = useApp();

  // Profile form state synced with active user
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [roleTitle, setRoleTitle] = useState('Workspace Member');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      addToast('success', 'Profile preferences updated successfully');
    }, 400);
  };

  const handleLogout = () => {
    logout();
    addToast('info', 'You have been signed out');
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Account & Profile Settings</h1>
        <p>Manage your personal profile details, account credentials, and active session.</p>
      </div>

      <div className="settings-content">
        {/* Profile Card */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div>
              <h2 className="settings-section-title">Personal Profile</h2>
              <p className="settings-section-desc">Your public information across the workspace.</p>
            </div>
            {currentUser && (
              <div className="settings-avatar-preview">
                <Avatar user={currentUser} size="lg" />
              </div>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="settings-form">
            <div className="form-group">
              <label className="form-label" htmlFor="settings-name">Full Name</label>
              <input
                id="settings-name"
                className="form-input"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" htmlFor="settings-email">Email Address</label>
                <span className="badge-verified">Verified</span>
              </div>
              <input
                id="settings-email"
                className="form-input readonly"
                type="email"
                value={email}
                readOnly
                title="Account email is tied to your login credentials"
              />
              <span className="form-hint">Email is linked to your authentication credentials.</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="settings-role">Role / Title</label>
              <input
                id="settings-role"
                className="form-input"
                type="text"
                value={roleTitle}
                onChange={e => setRoleTitle(e.target.value)}
                placeholder="e.g. Lead Designer, Software Engineer"
              />
            </div>

            <div className="settings-form-actions">
              <Button type="submit" variant="primary" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>
        </div>

        {/* Account & Security Card */}
        <div className="settings-card">
          <div>
            <h2 className="settings-section-title">Account & Security</h2>
            <p className="settings-section-desc">Overview of your account session and authentication details.</p>
          </div>

          <div className="settings-info-grid">
            <div className="settings-info-item">
              <span className="settings-info-label">Account ID</span>
              <span className="settings-info-val monospace">{currentUser?.id || '—'}</span>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-label">Database Provider</span>
              <span className="settings-info-val">Neon Cloud Postgres</span>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-label">Session Status</span>
              <span className="settings-info-val status-active">
                <span className="status-dot" /> Active Session
              </span>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-label">Security Protocol</span>
              <span className="settings-info-val">JWT Bearer Token (24h)</span>
            </div>
          </div>

          <div className="settings-danger-zone">
            <div>
              <div className="danger-title">Sign Out of Workspace</div>
              <div className="danger-desc">End your active session on this device.</div>
            </div>
            <Button variant="secondary" onClick={handleLogout} style={{ color: '#EF4444', borderColor: '#FCA5A5' }}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
