import type { User } from '../../types';
import './UI.css';

interface AvatarProps {
  user: User | null;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export default function Avatar({ user, size = 'md', showName = false }: AvatarProps) {
  if (!user) {
    return (
      <div className={`user-avatar size-${size}`} style={{ background: '#9CA3AF' }} title="Unassigned">
        ?
      </div>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <div
        className={`user-avatar size-${size}`}
        style={{ backgroundColor: user.color || '#4F46E5' }}
        title={`${user.name} (${user.email})`}
      >
        {user.initials}
      </div>
      {showName && <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>{user.name}</span>}
    </div>
  );
}
