import React from 'react';
import { Briefcase, ArrowUpRight } from 'lucide-react';

interface PortalBannerProps {
  onOpenSimulateModal: () => void;
}

export const PortalBanner: React.FC<PortalBannerProps> = ({ onOpenSimulateModal }) => {
  return (
    <div className="office-blue-card rounded-2xl p-5 border border-blue-400/30 bg-gradient-to-r from-[#0d2e59] via-[#0f3568] to-[#092244] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-900/50 shrink-0 border border-blue-300/30">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">Emirate Hub Consultancy Website Portal</h2>
          <p className="text-xs text-sky-100/90 mt-0.5 font-normal">
            Incoming business inquiry messages are routed directly to this management panel in real time.
          </p>
        </div>
      </div>

      <button
        onClick={onOpenSimulateModal}
        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 border border-blue-300/40 text-white text-xs font-semibold whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5 transition-all shadow-md shadow-blue-950/50 hover:shadow-blue-500/30 cursor-pointer"
      >
        <span>Simulate Website Form</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
