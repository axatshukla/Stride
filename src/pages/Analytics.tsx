import { useApp } from '../context/AppContext';
import Avatar from '../components/ui/Avatar';
import './Analytics.css';

export default function Analytics() {
  const { tasks, users } = useApp();

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Workload per user
  const workload = users.map(user => {
    const userTasks = tasks.filter(t => t.assignee?.id === user.id);
    const userDone = userTasks.filter(t => t.status === 'done').length;
    const userProgress = userTasks.filter(t => t.status === 'in-progress').length;
    const userTodo = userTasks.filter(t => t.status === 'todo').length;
    return {
      user,
      total: userTasks.length,
      done: userDone,
      progress: userProgress,
      todo: userTodo,
    };
  });

  const maxUserTasks = Math.max(...workload.map(w => w.total), 1);

  // Velocity data based on current workspace tasks
  const sprintData = [
    { name: 'Sprint 1', planned: totalTasks, completed: doneTasks },
  ];

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>Analytics & Performance</h1>
        <p>Real-time insights into sprint velocity, cycle times, and team capacity.</p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="analytics-stats-row">
        <div className="analytics-stat-item">
          <span style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)' }}>
            {totalTasks > 0 ? `${totalTasks} pts` : '—'}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Sprint Scope
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            {totalTasks} total deliverables
          </span>
        </div>

        <div className="analytics-stat-item">
          <span style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)' }}>
            {inProgressTasks}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Active in Progress
          </span>
          <span style={{ fontSize: 12, color: 'var(--warning)', fontWeight: 500 }}>
            {todoTasks} in backlog
          </span>
        </div>

        <div className="analytics-stat-item">
          <span style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)' }}>
            {completionRate}%
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Sprint Delivery
          </span>
          <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 500 }}>
            {doneTasks} of {totalTasks} closed
          </span>
        </div>

        <div className="analytics-stat-item">
          <span style={{ fontSize: 28, fontWeight: 600, color: 'var(--text-primary)' }}>
            {users.length}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Active Collaborators
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            Workspace team
          </span>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="analytics-grid-2col">
        {/* Sprint Velocity Chart */}
        <div className="analytics-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="analytics-card-title">Sprint Velocity</span>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-tertiary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, background: '#E0E7FF', borderRadius: 2 }} /> Planned
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: 2 }} /> Completed
              </span>
            </div>
          </div>

          <div className="velocity-chart">
            {sprintData.map(s => {
              const maxScale = Math.max(s.planned, 10);
              const plannedHeight = s.planned > 0 ? (s.planned / maxScale) * 100 : 8;
              const completedHeight = s.completed > 0 ? (s.completed / maxScale) * 100 : 4;
              return (
                <div key={s.name} className="velocity-col">
                  <div className="velocity-bars-wrap">
                    <div className="velocity-bar-planned" style={{ height: `${plannedHeight}%` }} title={`Planned: ${s.planned}`} />
                    <div className="velocity-bar-completed" style={{ height: `${completedHeight}%` }} title={`Completed: ${s.completed}`} />
                  </div>
                  <span className="velocity-label">{s.name}</span>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>
            {totalTasks > 0
              ? `Live tracking active across ${totalTasks} sprint tasks.`
              : 'Create tasks to begin velocity and delivery forecasting.'}
          </p>
        </div>

        {/* Team Workload Distribution */}
        <div className="analytics-card">
          <span className="analytics-card-title">Team Workload Distribution</span>
          <div className="workload-list">
            {workload.map(w => {
              const totalPct = (w.total / maxUserTasks) * 100;
              const doneShare = w.total > 0 ? (w.done / w.total) * totalPct : 0;
              const progShare = w.total > 0 ? (w.progress / w.total) * totalPct : 0;
              const todoShare = w.total > 0 ? (w.todo / w.total) * totalPct : 0;

              return (
                <div key={w.user.id} className="workload-row">
                  <div className="workload-row-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar user={w.user} size="sm" />
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{w.user.name}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                      <strong>{w.total}</strong> task{w.total !== 1 ? 's' : ''} ({w.done} done)
                    </span>
                  </div>

                  <div className="workload-bar-track">
                    <div className="workload-bar-segment" style={{ width: `${doneShare}%`, background: 'var(--status-done)' }} title={`${w.done} done`} />
                    <div className="workload-bar-segment" style={{ width: `${progShare}%`, background: 'var(--status-progress)' }} title={`${w.progress} in progress`} />
                    <div className="workload-bar-segment" style={{ width: `${todoShare}%`, background: 'var(--status-todo)' }} title={`${w.todo} to do`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
