import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';
import './Settings.css';

export default function Settings() {
  const { currentUser, addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'notifications' | 'security'>('profile');

  // Profile form state
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [title, setTitle] = useState('Workspace Member');

  // Workspace form state
  const [workspaceName, setWorkspaceName] = useState('Stride Workspace');
  const [sprintCadence, setSprintCadence] = useState('2-weeks');
  const [defaultView, setDefaultView] = useState('dashboard');

  // Notification toggles
  const [emailDigest, setEmailDigest] = useState(true);
  const [taskAssigned, setTaskAssigned] = useState(true);
  const [overdueAlerts, setOverdueAlerts] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    addToast('success', 'Settings updated successfully');
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings & Preferences</h1>
        <p>Configure user profile, sprint cadences, and workspace notifications.</p>
      </div>

      <div className="settings-tabs">
        <button
          className={`settings-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`settings-tab-btn ${activeTab === 'workspace' ? 'active' : ''}`}
          onClick={() => setActiveTab('workspace')}
        >
          Workspace
        </button>
        <button
          className={`settings-tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
      </div>

      <form onSubmit={handleSave}>
        {activeTab === 'profile' && (
          <div className="settings-card">
            <div>
              <h2 className="settings-section-title">Personal Profile</h2>
              <p className="settings-section-desc">Manage your public information and workspace identity.</p>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Job Title / Role</label>
              <input
                className="form-input"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <Button type="submit" variant="primary">Save Changes</Button>
            </div>
          </div>
        )}

        {activeTab === 'workspace' && (
          <div className="settings-card">
            <div>
              <h2 className="settings-section-title">Workspace Configuration</h2>
              <p className="settings-section-desc">Manage project settings, sprint cycles, and default views.</p>
            </div>

            <div className="form-group">
              <label className="form-label">Workspace Name</label>
              <input
                className="form-input"
                type="text"
                value={workspaceName}
                onChange={e => setWorkspaceName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sprint Cycle Duration</label>
              <select
                className="form-select"
                value={sprintCadence}
                onChange={e => setSprintCadence(e.target.value)}
              >
                <option value="1-week">1 Week Sprints</option>
                <option value="2-weeks">2 Weeks Sprints (Recommended)</option>
                <option value="1-month">Monthly Milestones</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Default Landing View</label>
              <select
                className="form-select"
                value={defaultView}
                onChange={e => setDefaultView(e.target.value)}
              >
                <option value="dashboard">Dashboard Overview</option>
                <option value="tasks">Task List</option>
                <option value="board">Sprint Kanban Board</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <Button type="submit" variant="primary">Save Workspace</Button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="settings-card">
            <div>
              <h2 className="settings-section-title">Notification Preferences</h2>
              <p className="settings-section-desc">Control how and when you receive task updates.</p>
            </div>

            <div className="setting-toggle-row">
              <div className="setting-toggle-info">
                <span className="setting-toggle-label">Daily Sprint Digest</span>
                <span className="setting-toggle-sub">Receive a morning summary of pending tasks and sprint goals.</span>
              </div>
              <div
                className={`toggle-switch ${emailDigest ? 'on' : ''}`}
                onClick={() => setEmailDigest(!emailDigest)}
              >
                <div className="toggle-knob" />
              </div>
            </div>

            <div className="setting-toggle-row">
              <div className="setting-toggle-info">
                <span className="setting-toggle-label">Task Assignments</span>
                <span className="setting-toggle-sub">Get notified immediately when a task is assigned to you.</span>
              </div>
              <div
                className={`toggle-switch ${taskAssigned ? 'on' : ''}`}
                onClick={() => setTaskAssigned(!taskAssigned)}
              >
                <div className="toggle-knob" />
              </div>
            </div>

            <div className="setting-toggle-row">
              <div className="setting-toggle-info">
                <span className="setting-toggle-label">Overdue Alerts</span>
                <span className="setting-toggle-sub">Receive alerts for tasks that pass their scheduled due date.</span>
              </div>
              <div
                className={`toggle-switch ${overdueAlerts ? 'on' : ''}`}
                onClick={() => setOverdueAlerts(!overdueAlerts)}
              >
                <div className="toggle-knob" />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
              <Button type="submit" variant="primary">Update Preferences</Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
