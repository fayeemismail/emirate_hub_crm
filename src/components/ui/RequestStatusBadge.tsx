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
          backgroundColor: '#FEF3C7',
          color: '#92400E',
          borderColor: '#FDE68A',
        };
      case 'In Progress':
        return {
          backgroundColor: '#FEE2E2',
          color: '#B91C1C',
          borderColor: '#FECACA',
        };
      case 'Resolved':
        return {
          backgroundColor: '#DCFCE7',
          color: '#166534',
          borderColor: '#BBF7D0',
        };
      case 'Archived':
      default:
        return {
          backgroundColor: '#F5F5F4',
          color: '#57534E',
          borderColor: '#E7E5E4',
        };
    }
  };

  return (
    <span
      className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${className}`}
      style={getColors()}
    >
      {status}
    </span>
  );
};
