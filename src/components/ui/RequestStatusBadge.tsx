import React from 'react';
import { RequestStatus } from '../../types';

interface RequestStatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

export const RequestStatusBadge: React.FC<RequestStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'In Progress':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'Resolved':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <span
      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getStatusStyles()} ${className}`}
    >
      {status}
    </span>
  );
};
