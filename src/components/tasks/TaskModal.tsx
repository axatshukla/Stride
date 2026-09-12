import { useState, useEffect, type FormEvent } from 'react';
import { useApp } from '../../context/AppContext';
import Button from '../ui/Button';
import type { TaskPriority, TaskStatus } from '../../types';
import './TaskModal.css';

export default function TaskModal() {
  const {
    isCreateModalOpen,
    setCreateModalOpen,
    editingTask,
    setEditingTask,
    createTask,
    updateTask,
    deleteTask,
    users,
    addToast,
  } = useApp();

  const isOpen = isCreateModalOpen || Boolean(editingTask);
  const isEditing = Boolean(editingTask);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setStatus(editingTask.status);
      setPriority(editingTask.priority);
      setAssigneeId(editingTask.assignee?.id || '');
      setDueDate(editingTask.dueDate ? editingTask.dueDate.substring(0, 10) : '');
      setTags(editingTask.tags || []);
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setAssigneeId('');
      setDueDate('');
      setTags([]);
    }
  }, [editingTask, isCreateModalOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setCreateModalOpen(false);
    setEditingTask(null);
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const cleanTag = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (!tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('error', 'Task title is required');
      return;
    }

    const assignedUser = users.find(u => u.id === assigneeId) || null;
    const formattedDueDate = dueDate ? new Date(dueDate).toISOString() : null;

    if (isEditing && editingTask) {
      updateTask(editingTask.id, {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assignee: assignedUser,
        dueDate: formattedDueDate,
        tags,
      });
      addToast('success', `Updated task ${editingTask.key}`);
    } else {
      createTask({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assignee: assignedUser,
        dueDate: formattedDueDate,
        tags,
      });
      addToast('success', 'Task created successfully');
    }

    handleClose();
  };

  const handleDelete = () => {
    if (!editingTask) return;
    if (window.confirm(`Are you sure you want to delete ${editingTask.key}?`)) {
      deleteTask(editingTask.id);
      addToast('info', `Deleted task ${editingTask.key}`);
      handleClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span style={{ color: 'var(--accent)' }}>
              {isEditing ? (editingTask?.key || 'Edit Task') : 'New Task'}
            </span>
            {isEditing && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>• Edit details</span>}
          </div>
          <button className="modal-close-btn" onClick={handleClose} aria-label="Close modal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">Task Title *</label>
              <input
                id="task-title"
                className="form-input"
                type="text"
                placeholder="e.g., Implement OAuth2 integration with GitHub"
                value={title}
                onChange={e => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-desc">Description</label>
              <textarea
                id="task-desc"
                className="form-textarea"
                placeholder="Provide context, acceptance criteria, or relevant links..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="task-status">Status</label>
                <select
                  id="task-status"
                  className="form-select"
                  value={status}
                  onChange={e => setStatus(e.target.value as TaskStatus)}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-priority">Priority</label>
                <select
                  id="task-priority"
                  className="form-select"
                  value={priority}
                  onChange={e => setPriority(e.target.value as TaskPriority)}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="task-assignee">Assignee</label>
                <select
                  id="task-assignee"
                  className="form-select"
                  value={assigneeId}
                  onChange={e => setAssigneeId(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="task-due">Due Date</label>
                <input
                  id="task-due"
                  className="form-input"
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tags</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Add a tag and press Enter"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="tag-chips">
                  {tags.map(tag => (
                    <span key={tag} className="tag-chip">
                      #{tag}
                      <span
                        className="tag-chip-remove"
                        onClick={() => handleRemoveTag(tag)}
                        title="Remove tag"
                      >
                        ×
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            {isEditing ? (
              <Button type="button" variant="danger" size="sm" onClick={handleDelete}>
                Delete Task
              </Button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {isEditing ? 'Save Changes' : 'Create Task'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
