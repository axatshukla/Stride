import FilterBar from '../components/tasks/FilterBar';
import TaskTable from '../components/tasks/TaskTable';
import BulkActionBar from '../components/tasks/BulkActionBar';

export default function TaskList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Tasks
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '2px' }}>
          View, filter, sort, and manage all sprint backlog items and deliverables.
        </p>
      </div>

      <FilterBar />
      <TaskTable />
      <BulkActionBar />
    </div>
  );
}
