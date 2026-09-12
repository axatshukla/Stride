import { useApp } from '../../context/AppContext';
import './BulkActionBar.css';

export default function BulkActionBar() {
  const {
    selectedTaskIds,
    clearSelection,
    deleteTasks,
    addToast,
    tasks,
    setEditingTask,
  } = useApp();

  if (selectedTaskIds.length === 0) return null;

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedTaskIds.length} selected tasks?`)) {
      const count = selectedTaskIds.length;
      deleteTasks(selectedTaskIds);
      addToast('info', `Deleted ${count} tasks`);
    }
  };

  const handleEditFirst = () => {
    const firstSelected = tasks.find(t => t.id === selectedTaskIds[0]);
    if (firstSelected) {
      setEditingTask(firstSelected);
    }
  };

  return (
    <div className="bulk-action-bar-wrapper">
      <div className="bulk-action-bar">
        <div className="bulk-count">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, color: 'var(--accent)' }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{selectedTaskIds.length} task{selectedTaskIds.length > 1 ? 's' : ''} selected</span>
        </div>

        {selectedTaskIds.length === 1 && (
          <button className="bulk-btn" onClick={handleEditFirst}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
            Edit
          </button>
        )}

        <button className="bulk-btn bulk-delete" onClick={handleDelete}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          Delete
        </button>

        <button className="bulk-btn" onClick={clearSelection} title="Clear selection">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}
