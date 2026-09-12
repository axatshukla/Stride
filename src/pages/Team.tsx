import { useApp } from '../context/AppContext';
import './Team.css';

export default function Team() {
  const { users, tasks } = useApp();

  const roles: Record<string, string> = {
    u1: 'Lead Full-Stack Engineer',
    u2: 'Senior UI/UX Designer',
    u3: 'Backend & Security Engineer',
    u4: 'DevOps & QA Engineer',
    u5: 'Full-Stack Developer',
  };

  return (
    <div className="team-page">
      <div className="team-header">
        <div>
          <h1>Team & Collaborators</h1>
          <p>Workspace members, roles, and real-time deliverable capacity.</p>
        </div>
      </div>

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
                  <span className="team-card-role">{roles[user.id] || 'Workspace Member'}</span>
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
