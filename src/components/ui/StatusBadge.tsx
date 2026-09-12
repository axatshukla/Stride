import { getStatusLabel } from '../../utils/helpers';
import type { TaskStatus } from '../../types';
import './UI.css';

interface StatusBadgeProps {
  status: TaskStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-${status}`}>
      {getStatusLabel(status)}
    </span>
  );
}
