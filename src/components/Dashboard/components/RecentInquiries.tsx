import React from 'react';
import { ServiceRequest } from '../../../types';
import { ArrowRight } from 'lucide-react';
import { EmptyState } from '../../ui/EmptyState';
import { ACTIVE_INQUIRIES_EMPTY } from '../../../lib/archiveCopy';

interface RecentInquiriesProps {
  recentRequests: ServiceRequest[];
  onNavigateToRequests: () => void;
  onSelectRequest: (req: ServiceRequest) => void;
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function displayName(req: ServiceRequest) {
  return req.name || `${req.firstName || ''} ${req.lastName || ''}`.trim() || 'Client';
}

function initialFor(name: string) {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export const RecentInquiries: React.FC<RecentInquiriesProps> = ({
  recentRequests,
  onNavigateToRequests,
  onSelectRequest,
}) => {
  return (
    <div
      className="crm-enter lg:col-span-2 rounded-2xl border px-5 py-5"
      style={{
        backgroundColor: 'var(--crm-card-bg, #FFFFFF)',
        borderColor: 'var(--crm-card-border, #E7E5E4)',
      }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3
          className="text-base font-semibold tracking-tight"
          style={{ color: 'var(--crm-text-primary, #1C1917)' }}
        >
          Recent inquiries
        </h3>
        <button
          type="button"
          onClick={onNavigateToRequests}
          className="inline-flex items-center gap-1 text-sm font-medium cursor-pointer hover:opacity-80"
          style={{ color: 'var(--crm-accent-primary, #E02126)' }}
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {recentRequests.length === 0 ? (
        <EmptyState
          compact
          icon="inbox"
          title="No inquiries yet"
          description={ACTIVE_INQUIRIES_EMPTY}
        />
      ) : (
        <ul>
          {recentRequests.map((req, index) => {
            const name = displayName(req);
            const message = req.message?.trim() || 'No message';

            return (
              <li
                key={req.id}
                onClick={() => onSelectRequest(req)}
                className="crm-interactive flex cursor-pointer items-start gap-3 py-3.5 hover:bg-[#FAF9F6] -mx-2 px-2 rounded-xl"
                style={{
                  borderTop: index === 0 ? undefined : '1px solid #F5F5F4',
                }}
              >
                <div
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: 'var(--crm-accent-primary, #E02126)' }}
                  aria-hidden
                >
                  {initialFor(name)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p
                      className="truncate text-sm font-medium"
                      style={{ color: 'var(--crm-text-primary, #1C1917)' }}
                    >
                      {name}
                    </p>
                    <time
                      className="shrink-0 text-xs tabular-nums"
                      style={{ color: '#A8A29E' }}
                      dateTime={req.createdAt}
                    >
                      {formatWhen(req.createdAt)}
                    </time>
                  </div>
                  <p
                    className="mt-0.5 truncate text-sm"
                    style={{ color: '#78716C' }}
                  >
                    {message}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
