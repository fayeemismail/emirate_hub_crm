import React from 'react';
import { PipelineStatus, RequestStatus } from '../../types';
import { findPipelineStatus } from '../../lib/adapters';

interface RequestStatusBadgeProps {
  status: RequestStatus;
  pipelineStatuses?: PipelineStatus[];
  className?: string;
}

function withAlpha(hex: string, alphaHex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length === 6) return `#${clean}${alphaHex}`;
  return hex;
}

export const RequestStatusBadge: React.FC<RequestStatusBadgeProps> = ({
  status,
  pipelineStatuses = [],
  className = '',
}) => {
  const meta = findPipelineStatus(pipelineStatuses, status);
  const isUnknown = pipelineStatuses.length > 0 && !meta;
  const accent = isUnknown ? '#B45309' : meta?.color || '#78716C';
  const label = meta?.title || (isUnknown ? `Unknown · ${status}` : status);

  return (
    <span
      className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${className}`}
      style={{
        backgroundColor: withAlpha(accent, '26'),
        color: accent,
        borderColor: withAlpha(accent, '4D'),
      }}
      title={isUnknown ? `Status "${status}" is not in the active CMS pipeline` : undefined}
    >
      {label}
    </span>
  );
};
