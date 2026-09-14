import React from 'react';
import { Briefcase, ArrowUpRight } from 'lucide-react';

interface PortalBannerProps {
  onOpenSimulateModal: () => void;
}

export const PortalBanner: React.FC<PortalBannerProps> = ({ onOpenSimulateModal }) => {
  return (
    <div className="formal-card rounded-2xl p-5 border border-sky-500/20 bg-gradient-to-r from-sky-950/40 via-[#1e293b] to-[#0f172a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl formal-gradient-bg text-white flex items-center justify-center font-bold text-sm shadow-md shadow-sky-900/30 shrink-0">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Emirate Hub Consultancy Website Portal</h2>
          <p className="text-xs text-slate-400">
            Incoming business inquiry messages are routed directly to this management panel in real time.
          </p>
        </div>
      </div>

      <button
        onClick={onOpenSimulateModal}
        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5 transition-all cursor-pointer"
      >
        <span>Simulate Website Form</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
