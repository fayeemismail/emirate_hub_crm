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
    <div className="lg:col-span-2 office-blue-card rounded-2xl p-5 border border-blue-400/25">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-blue-400/20">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Recent Business Inquiries</h3>
          <p className="text-xs text-sky-200/80">Latest user messages from website visitors</p>
        </div>
        <button
          onClick={onNavigateToRequests}
          className="text-xs font-bold text-sky-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {recentRequests.length === 0 ? (
        <div className="py-10 text-center space-y-2 border border-dashed border-blue-400/25 rounded-xl bg-blue-950/30">
          <p className="text-xs font-medium text-sky-200">No client inquiries yet</p>
          <p className="text-[11px] text-sky-300/70">Live inquiries submitted from the website form will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {recentRequests.map((req) => (
            <div
              key={req.id}
              onClick={() => onSelectRequest(req)}
              className="p-3.5 rounded-xl office-blue-inner-card transition-all cursor-pointer flex items-start justify-between gap-3 group"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                    {req.name || `${req.firstName} ${req.lastName}`.trim() || 'Client'}
                  </span>
                  <span className="text-[11px] text-sky-200/75">({req.email})</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/25 text-sky-100 border border-blue-400/35">
                    {req.service}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                    req.priority === 'High' ? 'bg-rose-500/20 text-rose-200 border-rose-400/40' :
                    req.priority === 'Medium' ? 'bg-amber-500/20 text-amber-200 border-amber-400/40' :
                    'bg-blue-500/20 text-sky-200 border-blue-400/35'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      req.priority === 'High' ? 'bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.9)]' :
                      req.priority === 'Medium' ? 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.9)]' :
                      'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.9)]'
                    }`} />
                    {req.priority}
                  </span>
                </div>
                <p className="text-xs text-sky-100/90 line-clamp-1 italic font-normal">
                  {req.message ? `"${req.message}"` : <span className="italic text-sky-300/50">No message provided</span>}
                </p>
              </div>

              <div className="flex flex-col items-end shrink-0 text-right">
                <RequestStatusBadge status={req.status} />
                <span className="text-[10px] text-sky-200/75 mt-1 font-medium">
                  {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
