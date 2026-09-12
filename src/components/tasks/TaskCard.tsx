import { useApp } from '../../context/AppContext';
import PriorityBadge from '../ui/PriorityBadge';
import Avatar from '../ui/Avatar';
import type { Task, TaskStatus } from '../../types';
import './KanbanBoard.css';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const { setEditingTask, moveTask, addToast } = useApp();

  const handleQuickMove = (e: React.MouseEvent, targetStatus: TaskStatus) => {
    e.stopPropagation();
    moveTask(task.id, targetStatus);
    addToast('info', `Moved ${task.key} to ${targetStatus === 'in-progress' ? 'In Progress' : targetStatus === 'todo' ? 'To Do' : 'Done'}`);
  };

  return (
    <div className="kanban-card" onClick={() => setEditingTask(task)}>
      <div className="kanban-card-top">
        <span className="kanban-card-key">{task.key}</span>
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="kanban-card-title">{task.title}</div>

      {task.description && (
        <div className="kanban-card-desc">{task.description}</div>
      )}

      {task.tags && task.tags.length > 0 && (
        <div className="kanban-card-tags">
          {task.tags.map(tag => (
            <span key={tag} className="kanban-card-tag">#{tag}</span>
          ))}
        </div>
      )}

      <div className="kanban-card-footer">
        <Avatar user={task.assignee} size="sm" />

        {/* Quick status transition buttons */}
        <div className="kanban-quick-actions">
          {task.status !== 'todo' && (
            <button
              className="kanban-quick-btn"
              onClick={e => handleQuickMove(e, 'todo')}
              title="Move to Todo"
            >
              ← Todo
            </button>
          )}
          {task.status !== 'in-progress' && (
            <button
              className="kanban-quick-btn"
              onClick={e => handleQuickMove(e, 'in-progress')}
              title="Move to In Progress"
            >
              {task.status === 'todo' ? 'Start →' : '← Active'}
            </button>
          )}
          {task.status !== 'done' && (
            <button
              className="kanban-quick-btn"
              onClick={e => handleQuickMove(e, 'done')}
              title="Move to Done"
            >
              Done ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
