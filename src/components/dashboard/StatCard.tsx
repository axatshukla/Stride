import type { ReactNode } from 'react';
import './Dashboard.css';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  isPositive?: boolean;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  trend,
  isPositive,
  icon,
  iconBg,
  iconColor,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <div className="stat-card-icon" style={{ background: iconBg, color: iconColor }}>
          {icon}
        </div>
      </div>

      <div className="stat-card-value-wrap">
        <span className="stat-card-value">{value}</span>
        {trend && (
          <span className={`stat-card-trend ${isPositive ? 'positive' : 'neutral'}`}>
            {isPositive ? '↑ ' : ''}{trend}
          </span>
        )}
      </div>

      {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
    </div>
  );
}
