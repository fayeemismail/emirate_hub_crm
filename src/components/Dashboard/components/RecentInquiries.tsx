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
    <div className="lg:col-span-2 formal-card rounded-2xl p-5 border border-white/10">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
        <div>
          <h3 className="text-sm font-bold text-white">Recent Business Inquiries</h3>
          <p className="text-xs text-slate-400">Latest user messages from website visitors</p>
        </div>
        <button
          onClick={onNavigateToRequests}
          className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2.5">
        {recentRequests.map((req) => (
          <div
            key={req.id}
            onClick={() => onSelectRequest(req)}
            className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-sky-500/30 transition-all cursor-pointer flex items-start justify-between gap-3 group"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                  {req.firstName} {req.lastName}
                </span>
                <span className="text-[11px] text-slate-400">({req.email})</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                  {req.service}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1 italic">
                "{req.message}"
              </p>
            </div>

            <div className="flex flex-col items-end shrink-0 text-right">
              <RequestStatusBadge status={req.status} />
              <span className="text-[10px] text-slate-400 mt-1">
                {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
