import React from 'react';
import { LucideIcon, Inbox, Layers, Search, BarChart3, Tag } from 'lucide-react';

export type EmptyStateIcon = 'inbox' | 'pipeline' | 'search' | 'chart' | 'status';

interface EmptyStateProps {
  icon?: EmptyStateIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

const ICONS: Record<EmptyStateIcon, LucideIcon> = {
  inbox: Inbox,
  pipeline: Layers,
  search: Search,
  chart: BarChart3,
  status: Tag,
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  action,
  compact = false,
  className = '',
}) => {
  const Icon = ICONS[icon];

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? 'py-8 px-4' : 'py-16 px-6'
      } ${className}`}
      role="status"
    >
      <div
        className={`flex items-center justify-center rounded-2xl border ${
          compact ? 'h-10 w-10' : 'h-12 w-12'
        }`}
        style={{
          backgroundColor: '#FAF9F6',
          borderColor: '#E7E5E4',
          color: '#A8A29E',
        }}
      >
        <Icon className={compact ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden />
      </div>

      <p
        className={`font-medium ${compact ? 'mt-3 text-sm' : 'mt-4 text-sm'}`}
        style={{ color: '#1C1917' }}
      >
        {title}
      </p>

      {description ? (
        <p
          className={`max-w-sm ${compact ? 'mt-1 text-xs' : 'mt-1.5 text-sm'}`}
          style={{ color: '#78716C' }}
        >
          {description}
        </p>
      ) : null}

      {action ? <div className={compact ? 'mt-3' : 'mt-5'}>{action}</div> : null}
    </div>
  );
};
