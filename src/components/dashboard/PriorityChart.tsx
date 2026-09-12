import './Dashboard.css';

interface PriorityChartProps {
  high: number;
  medium: number;
  low: number;
  total: number;
}

export default function PriorityChart({ high, medium, low, total }: PriorityChartProps) {
  const highPct = total > 0 ? Math.round((high / total) * 100) : 0;
  const medPct = total > 0 ? Math.round((medium / total) * 100) : 0;
  const lowPct = total > 0 ? Math.round((low / total) * 100) : 0;

  return (
    <div className="priority-bars">
      <div className="priority-bar-row">
        <div className="priority-bar-header">
          <span style={{ fontWeight: 500, color: 'var(--priority-high)' }}>High Priority</span>
          <span style={{ color: 'var(--text-secondary)' }}>{high} tasks ({highPct}%)</span>
        </div>
        <div className="priority-bar-track">
          <div
            className="priority-bar-fill"
            style={{ width: `${highPct}%`, background: 'var(--priority-high)' }}
          />
        </div>
      </div>

      <div className="priority-bar-row">
        <div className="priority-bar-header">
          <span style={{ fontWeight: 500, color: 'var(--priority-medium)' }}>Medium Priority</span>
          <span style={{ color: 'var(--text-secondary)' }}>{medium} tasks ({medPct}%)</span>
        </div>
        <div className="priority-bar-track">
          <div
            className="priority-bar-fill"
            style={{ width: `${medPct}%`, background: 'var(--priority-medium)' }}
          />
        </div>
      </div>

      <div className="priority-bar-row">
        <div className="priority-bar-header">
          <span style={{ fontWeight: 500, color: 'var(--priority-low)' }}>Low Priority</span>
          <span style={{ color: 'var(--text-secondary)' }}>{low} tasks ({lowPct}%)</span>
        </div>
        <div className="priority-bar-track">
          <div
            className="priority-bar-fill"
            style={{ width: `${lowPct}%`, background: 'var(--priority-low)' }}
          />
        </div>
      </div>
    </div>
  );
}
