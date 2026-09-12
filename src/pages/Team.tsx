import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';
import './Team.css';

export default function Team() {
  const { users, tasks, addToast } = useApp();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('Frontend Engineer');

  const roles: Record<string, string> = {
    u1: 'Lead Full-Stack Engineer',
    u2: 'Senior UI/UX Designer',
    u3: 'Backend & Security Engineer',
    u4: 'DevOps & QA Engineer',
    u5: 'Full-Stack Developer',
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) {
      addToast('error', 'Please provide a name and email');
      return;
    }
    addToast('success', `Invitation sent to ${inviteEmail}`);
    setIsInviteOpen(false);
    setInviteEmail('');
    setInviteName('');
  };

  return (
    <div className="team-page">
      <div className="team-header">
        <div>
          <h1>Team & Collaborators</h1>
          <p>Manage workspace members, roles, permissions, and active capacity.</p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsInviteOpen(true)}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}>
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          }
        >
          Invite Member
        </Button>
      </div>

      {isInviteOpen && (
        <div className="modal-backdrop" onClick={() => setIsInviteOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <span className="modal-title">Invite Team Member</span>
              <button className="modal-close-btn" onClick={() => setIsInviteOpen(false)}>×</button>
            </div>
            <form onSubmit={handleInvite}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="e.g. Maya Chen"
                    value={inviteName}
                    onChange={e => setInviteName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="maya@taskflow.dev"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                  >
                    <option value="Frontend Engineer">Frontend Engineer</option>
                    <option value="Backend Engineer">Backend Engineer</option>
                    <option value="Product Designer">Product Designer</option>
                    <option value="QA Engineer">QA Engineer</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <Button type="button" variant="secondary" onClick={() => setIsInviteOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Send Invitation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="team-grid">
        {users.map(user => {
          const userTasks = tasks.filter(t => t.assignee?.id === user.id);
          const activeTasks = userTasks.filter(t => t.status === 'in-progress').length;
          const completedTasks = userTasks.filter(t => t.status === 'done').length;

          return (
            <div key={user.id} className="team-card">
              <div className="team-card-top">
                <div className="team-avatar-lg" style={{ background: user.color || 'var(--accent)' }}>
                  {user.initials}
                </div>
                <div className="team-card-info">
                  <span className="team-card-name">{user.name}</span>
                  <span className="team-card-role">{roles[user.id] || 'Software Engineer'}</span>
                </div>
              </div>

              <div className="team-card-email">{user.email}</div>

              <div className="team-card-metrics">
                <div className="team-card-stat">
                  <span className="team-card-stat-val">{userTasks.length}</span>
                  <span className="team-card-stat-lbl">Assigned</span>
                </div>
                <div className="team-card-stat">
                  <span className="team-card-stat-val" style={{ color: 'var(--status-progress)' }}>{activeTasks}</span>
                  <span className="team-card-stat-lbl">In Progress</span>
                </div>
                <div className="team-card-stat">
                  <span className="team-card-stat-val" style={{ color: 'var(--status-done)' }}>{completedTasks}</span>
                  <span className="team-card-stat-lbl">Completed</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
