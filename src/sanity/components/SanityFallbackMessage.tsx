'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface SanityFallbackMessageProps {
  entityName: string;
  message?: string;
  className?: string;
}

/**
 * Standard fallback message component shown when Sanity data is not found.
 * Never displays fake mock/dummy content; informs the user that no data exists in Sanity.
 */
export const SanityFallbackMessage: React.FC<SanityFallbackMessageProps> = ({
  entityName,
  message,
  className = '',
}) => {
  return (
    <div
      role="status"
      className={`rounded-xl p-3.5 border flex items-center gap-3 text-xs ${className}`}
      style={{
        backgroundColor: '#f59e0b14',
        borderColor: '#f59e0b33',
        color: '#fcd34d',
      }}
    >
      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
      <div>
        <span className="font-semibold text-amber-300">No data found: </span>
        <span>
          {message || `${entityName} is not configured or contains no published records in Sanity CMS.`}
        </span>
      </div>
    </div>
  );
};
