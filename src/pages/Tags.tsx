import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Button from '../components/ui/Button';
import './Tags.css';

export default function Tags() {
  const { tasks, setFilters, setCurrentPage, addToast } = useApp();
  const [newTag, setNewTag] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Aggregate all unique tags from tasks
  const tagCounts: Record<string, number> = {};
  tasks.forEach(t => {
    (t.tags || []).forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const tagList = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  const handleSelectTag = (tag: string) => {
    setFilters({ search: tag });
    setCurrentPage('tasks');
    addToast('info', `Filtered tasks by #${tag}`);
  };

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    addToast('success', `Created tag #${newTag.trim().toLowerCase()}`);
    setNewTag('');
    setIsAdding(false);
  };

  return (
    <div className="tags-page">
      <div className="tags-header">
        <div>
          <h1>Tags & Categories</h1>
          <p>Organize, categorize, and cross-reference tasks with semantic labels.</p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsAdding(true)}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 14, height: 14 }}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          New Tag
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreateTag} style={{ display: 'flex', gap: 8, maxWidth: 360 }}>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. backend, ui, urgent"
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            autoFocus
          />
          <Button type="submit" variant="primary">Add</Button>
          <Button type="button" variant="secondary" onClick={() => setIsAdding(false)}>Cancel</Button>
        </form>
      )}

      {tagList.length === 0 ? (
        <div style={{ background: '#FFFFFF', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>
            No tags in workspace yet
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
            Add tags to categorize your tasks (e.g. frontend, database, api, bug).
          </div>
          <Button variant="secondary" size="sm" onClick={() => setIsAdding(true)}>
            + Create First Tag
          </Button>
        </div>
      ) : (
        <div className="tags-grid">
          {tagList.map(([tag, count]) => (
            <div
              key={tag}
              className="tag-card"
              onClick={() => handleSelectTag(tag)}
              title="Click to filter task list"
            >
              <span className="tag-badge-pill">#{tag}</span>
              <span className="tag-count-text">{count} task{count > 1 ? 's' : ''} →</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
