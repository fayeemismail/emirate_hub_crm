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
  const getColors = () => {
    switch (status) {
      case 'Pending':
        return {
          backgroundColor: '#f59e0b26',
          color: '#fbbf24',
          borderColor: '#f59e0b4d',
        };
      case 'In Progress':
        return {
          backgroundColor: '#0284c726',
          color: '#38bdf8',
          borderColor: '#0284c74d',
        };
      case 'Resolved':
        return {
          backgroundColor: '#10b98126',
          color: '#34d399',
          borderColor: '#10b9814d',
        };
      case 'Archived':
      default:
        return {
          backgroundColor: '#64748b26',
          color: '#94a3b8',
          borderColor: '#64748b4d',
        };
    }
  };

  const styleColors = getColors();

  return (
    <span
      className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${className}`}
      style={styleColors}
    >
      {status}
    </span>
  );
};
