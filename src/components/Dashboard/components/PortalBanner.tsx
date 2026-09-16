import React from 'react';
import { Briefcase, ArrowUpRight } from 'lucide-react';

interface PortalBannerProps {
  onOpenSimulateModal: () => void;
}

export const PortalBanner: React.FC<PortalBannerProps> = ({ onOpenSimulateModal }) => {
  return (
    <div 
      className="rounded-2xl p-5 border shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md"
      style={{
        background: 'linear-gradient(90deg, #0d2e59 0%, #0f3568 50%, #092244 100%)',
        borderColor: '#93c5fd4d',
        boxShadow: '0 10px 30px #040f1eb3',
      }}
    >
      <div className="flex items-center gap-3.5">
        <div 
          className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0 border"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #38bdf8 100%)',
            borderColor: '#93c5fd4d',
            boxShadow: '0 4px 14px #1e3a8a80',
          }}
        >
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold tracking-tight" style={{ color: '#ffffff' }}>
            Emirate Hub Consultancy Website Portal
          </h2>
          <p className="text-xs mt-0.5 font-normal" style={{ color: '#e0f2fee6' }}>
            Incoming business inquiry messages are routed directly to this management panel in real time.
          </p>
        </div>
      </div>

      <button
        onClick={onOpenSimulateModal}
        className="px-4 py-2 rounded-xl text-white text-xs font-semibold whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5 transition-all shadow-md cursor-pointer border"
        style={{
          backgroundColor: '#2563eb',
          borderColor: '#93c5fd66',
          boxShadow: '0 4px 12px #02061780',
        }}
      >
        <span>Simulate Website Form</span>
        <ArrowUpRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
