import React from 'react';
import { ServiceRequest } from '../../../types';
import { ArrowRight } from 'lucide-react';
import { RequestStatusBadge } from '../../ui/RequestStatusBadge';

interface RecentInquiriesProps {
  recentRequests: ServiceRequest[];
  onNavigateToRequests: () => void;
  onSelectRequest: (req: ServiceRequest) => void;
}

export const RecentInquiries: React.FC<RecentInquiriesProps> = ({
  recentRequests,
  onNavigateToRequests,
  onSelectRequest,
}) => {
  return (
    <div 
      className="lg:col-span-2 rounded-2xl p-5 border backdrop-blur-md"
      style={{
        backgroundColor: 'var(--sanity-card-bg, #0d284ce6)',
        borderColor: 'var(--sanity-card-border, #93c5fd40)',
        boxShadow: '0 10px 30px #040f1eb3',
      }}
    >
      <div 
        className="flex items-center justify-between mb-4 pb-3 border-b"
        style={{ borderColor: 'var(--sanity-card-border, #93c5fd33)' }}
      >
        <div>
          <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--sanity-text-primary, #ffffff)' }}>
            Recent Business Inquiries
          </h3>
          <p className="text-xs" style={{ color: 'var(--sanity-text-secondary, #bae6fdcc)' }}>
            Latest user messages from website visitors
          </p>
        </div>
        <button
          onClick={onNavigateToRequests}
          className="text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer hover:text-white"
          style={{ color: 'var(--sanity-accent-sky, #7dd3fc)' }}
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {recentRequests.length === 0 ? (
        <div 
          className="py-10 text-center space-y-2 border border-dashed rounded-xl"
          style={{
            backgroundColor: 'var(--sanity-inner-card-bg, #081d394d)',
            borderColor: 'var(--sanity-card-border, #93c5fd40)',
          }}
        >
          <p className="text-xs font-medium" style={{ color: 'var(--sanity-text-secondary, #bae6fd)' }}>No client inquiries yet</p>
          <p className="text-[11px]" style={{ color: 'var(--sanity-text-muted, #93c5fdb3)' }}>Live inquiries submitted from the website form will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {recentRequests.map((req) => {
            const isHigh = req.priority === 'High';
            const isMed = req.priority === 'Medium';
            const priorityBg = isHigh ? 'var(--sanity-priority-high-bg, #f43f5e33)' : isMed ? 'var(--sanity-priority-med-bg, #f59e0b33)' : 'var(--sanity-priority-low-bg, #0284c733)';
            const priorityTxt = isHigh ? 'var(--sanity-priority-high-color, #fca5a5)' : isMed ? 'var(--sanity-priority-med-color, #fcd34d)' : 'var(--sanity-priority-low-color, #bae6fd)';
            const priorityBorder = isHigh ? '#fb718566' : isMed ? '#fbbf2466' : '#38bdf859';
            const dotBg = isHigh ? 'var(--sanity-danger, #f43f5e)' : isMed ? 'var(--sanity-warning, #f59e0b)' : 'var(--sanity-accent-sky, #38bdf8)';

            return (
              <div
                key={req.id}
                onClick={() => onSelectRequest(req)}
                className="p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 group"
                style={{
                  backgroundColor: 'var(--sanity-inner-card-bg, #07162dbf)',
                  borderColor: 'var(--sanity-card-border, #93c5fd29)',
                }}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span 
                      className="text-xs font-bold transition-colors group-hover:text-[#38bdf8]"
                      style={{ color: '#ffffff' }}
                    >
                      {req.name || `${req.firstName} ${req.lastName}`.trim() || 'Client'}
                    </span>
                    <span className="text-[11px]" style={{ color: '#bae6fdbf' }}>
                      ({req.email})
                    </span>
                    <span 
                      className="px-2 py-0.5 rounded text-[10px] font-semibold border"
                      style={{
                        backgroundColor: '#0284c733',
                        color: '#bae6fd',
                        borderColor: '#38bdf84d',
                      }}
                    >
                      {req.service}
                    </span>
                    <span 
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1"
                      style={{
                        backgroundColor: priorityBg,
                        color: priorityTxt,
                        borderColor: priorityBorder,
                      }}
                    >
                      <span 
                        className="w-1.5 h-1.5 rounded-full" 
                        style={{ backgroundColor: dotBg, boxShadow: `0 0 6px ${dotBg}` }}
                      />
                      {req.priority}
                    </span>
                  </div>
                  <p className="text-xs line-clamp-1 italic font-normal" style={{ color: '#e0f2fee6' }}>
                    {req.message ? `"${req.message}"` : <span className="italic" style={{ color: '#93c5fd80' }}>No message provided</span>}
                  </p>
                </div>

                <div className="flex flex-col items-end shrink-0 text-right">
                  <RequestStatusBadge status={req.status} />
                  <span className="text-[10px] mt-1 font-medium" style={{ color: '#bae6fdbf' }}>
                    {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
