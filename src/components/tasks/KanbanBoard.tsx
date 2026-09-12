import { useApp } from '../../context/AppContext';
import TaskCard from './TaskCard';
import type { TaskStatus } from '../../types';
import './KanbanBoard.css';

export default function KanbanBoard() {
  const { filteredTasks } = useApp();

  const columns: { status: TaskStatus; label: string; className: string }[] = [
    { status: 'todo', label: 'To Do', className: 'col-todo' },
    { status: 'in-progress', label: 'In Progress', className: 'col-in-progress' },
    { status: 'done', label: 'Done', className: 'col-done' },
  ];

  return (
    <div className="kanban-board">
      {columns.map(col => {
        const tasksInColumn = filteredTasks.filter(t => t.status === col.status);

        return (
          <div key={col.status} className={`kanban-column ${col.className}`}>
            <div className="kanban-column-header">
              <div className="kanban-column-title-wrap">
                <span className="kanban-column-dot" />
                <span className="kanban-column-title">{col.label}</span>
              </div>
              <span className="kanban-column-count">{tasksInColumn.length}</span>
            </div>

            <div className="kanban-column-body">
              {tasksInColumn.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
              {tasksInColumn.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', padding: 'var(--space-6) 0' }}>
                  No tasks in this stage
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
