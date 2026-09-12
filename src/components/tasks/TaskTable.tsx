import { useApp } from '../../context/AppContext';
import StatusBadge from '../ui/StatusBadge';
import PriorityBadge from '../ui/PriorityBadge';
import Avatar from '../ui/Avatar';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import { formatDate, isOverdue } from '../../utils/helpers';
import './TaskTable.css';

export default function TaskTable() {
  const {
    filteredTasks,
    selectedTaskIds,
    toggleTaskSelection,
    selectAllTasks,
    setEditingTask,
    setCreateModalOpen,
  } = useApp();

  const isAllSelected =
    filteredTasks.length > 0 && selectedTaskIds.length === filteredTasks.length;

  if (filteredTasks.length === 0) {
    return (
      <EmptyState
        title="No tasks found"
        description="No tasks match your current filter and search criteria. Try clearing some filters or create a new task."
        action={
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
            Create New Task
          </Button>
        }
      />
    );
  }

  return (
    <div className="task-table-container">
      <table className="task-table">
        <thead>
          <tr>
            <th style={{ width: 44 }}>
              <input
                type="checkbox"
                className="task-checkbox"
                checked={isAllSelected}
                onChange={selectAllTasks}
                aria-label="Select all tasks"
              />
            </th>
            <th style={{ width: 90 }}>Key</th>
            <th>Name & Details</th>
            <th style={{ width: 130 }}>Status</th>
            <th style={{ width: 140 }}>Assignee</th>
            <th style={{ width: 120 }}>Due Date</th>
            <th style={{ width: 110 }}>Priority</th>
            <th style={{ width: 60, textAlign: 'center' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map(task => {
            const isSelected = selectedTaskIds.includes(task.id);
            const overdue = isOverdue(task.dueDate, task.status);

            return (
              <tr
                key={task.id}
                className={isSelected ? 'selected' : ''}
                onClick={() => setEditingTask(task)}
              >
                <td onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={isSelected}
                    onChange={() => toggleTaskSelection(task.id)}
                    aria-label={`Select task ${task.key}`}
                  />
                </td>
                <td>
                  <span className="task-key">{task.key}</span>
                </td>
                <td>
                  <div className="task-title-cell">
                    <span className="task-title-text">{task.title}</span>
                    {task.description && (
                      <span className="task-desc-preview">{task.description}</span>
                    )}
                  </div>
                </td>
                <td>
                  <StatusBadge status={task.status} />
                </td>
                <td>
                  <Avatar user={task.assignee} size="sm" showName />
                </td>
                <td>
                  <span className={`task-due-date ${overdue ? 'overdue' : ''}`}>
                    {overdue && '⚠️ '}
                    {formatDate(task.dueDate)}
                  </span>
                </td>
                <td>
                  <PriorityBadge priority={task.priority} />
                </td>
                <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                  <button
                    className="table-action-btn"
                    onClick={() => setEditingTask(task)}
                    title="Edit task"
                    aria-label={`Edit task ${task.key}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
