import { getPriorityLabel } from '../../utils/helpers';
import type { TaskPriority } from '../../types';
import './UI.css';

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={`priority-badge priority-${priority}`}>
      {getPriorityLabel(priority)}
    </span>
  );
}
