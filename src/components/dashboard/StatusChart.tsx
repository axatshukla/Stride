import './Dashboard.css';

interface StatusChartProps {
  todo: number;
  inProgress: number;
  done: number;
  total: number;
}

export default function StatusChart({ todo, inProgress, done, total }: StatusChartProps) {
  // Compute SVG circle stroke dashes for donut
  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  const todoPercent = total > 0 ? (todo / total) * 100 : 0;
  const progressPercent = total > 0 ? (inProgress / total) * 100 : 0;
  const donePercent = total > 0 ? (done / total) * 100 : 0;

  const doneDash = (donePercent / 100) * circumference;
  const progressDash = (progressPercent / 100) * circumference;
  const todoDash = (todoPercent / 100) * circumference;

  const doneOffset = 0;
  const progressOffset = -doneDash;
  const todoOffset = -(doneDash + progressDash);

  return (
    <div className="donut-chart-wrap">
      <div className="donut-svg-container">
        <svg width="130" height="130" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background Track */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke="var(--bg-primary)"
            strokeWidth="12"
          />
          {/* Done Segment */}
          {done > 0 && (
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              stroke="var(--status-done)"
              strokeWidth="12"
              strokeDasharray={`${doneDash} ${circumference}`}
              strokeDashoffset={doneOffset}
              strokeLinecap="round"
            />
          )}
          {/* In Progress Segment */}
          {inProgress > 0 && (
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              stroke="var(--status-progress)"
              strokeWidth="12"
              strokeDasharray={`${progressDash} ${circumference}`}
              strokeDashoffset={progressOffset}
              strokeLinecap="round"
            />
          )}
          {/* Todo Segment */}
          {todo > 0 && (
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              stroke="var(--status-todo)"
              strokeWidth="12"
              strokeDasharray={`${todoDash} ${circumference}`}
              strokeDashoffset={todoOffset}
              strokeLinecap="round"
            />
          )}
        </svg>

        <div className="donut-center-text">
          <span className="donut-center-val">{total}</span>
          <span className="donut-center-lbl">Tasks</span>
        </div>
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--status-done)' }} />
          <span>Done</span>
          <span className="legend-val">{done} ({Math.round(donePercent)}%)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--status-progress)' }} />
          <span>In Progress</span>
          <span className="legend-val">{inProgress} ({Math.round(progressPercent)}%)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--status-todo)' }} />
          <span>To Do</span>
          <span className="legend-val">{todo} ({Math.round(todoPercent)}%)</span>
        </div>
      </div>
    </div>
  );
}
