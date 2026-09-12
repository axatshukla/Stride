import FilterBar from '../components/tasks/FilterBar';
import KanbanBoard from '../components/tasks/KanbanBoard';

export default function Board() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Sprint Board
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Visualize and transition tasks through active development workflows.
        </p>
      </div>

      <FilterBar />
      <KanbanBoard />
    </div>
  );
}
