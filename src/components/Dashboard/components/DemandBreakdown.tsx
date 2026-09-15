'use client';

import React from 'react';
import { Layers, Sparkles, TrendingUp } from 'lucide-react';
import { ServicePerformanceItem } from '../../../types';

interface DemandItemProps {
  label: string;
  percentage: number;
  inquiries: number;
  textColor: string;
  barColor: string;
}

const DemandItem: React.FC<DemandItemProps> = ({
  label,
  percentage,
  inquiries,
  textColor,
  barColor,
}) => (
  <div>
    <div className="flex justify-between text-white font-medium mb-1.5 text-xs">
      <span className="truncate pr-2">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] text-sky-200/80 font-medium">{inquiries} reqs</span>
        <span className={`${textColor} font-bold font-mono`}>{percentage}%</span>
      </div>
    </div>
    <div className="w-full h-2 rounded-full bg-[#061730] border border-blue-400/20 overflow-hidden shadow-inner">
      <div className={`h-full ${barColor} rounded-full transition-all duration-500 shadow-sm`} style={{ width: `${Math.max(percentage, 2)}%` }} />
    </div>
  </div>
);

const COLOR_PALETTES = [
  { textColor: 'text-sky-300', barColor: 'bg-gradient-to-r from-sky-500 to-sky-300' },
  { textColor: 'text-blue-300', barColor: 'bg-gradient-to-r from-blue-600 to-indigo-400' },
  { textColor: 'text-emerald-300', barColor: 'bg-gradient-to-r from-emerald-500 to-teal-300' },
  { textColor: 'text-amber-300', barColor: 'bg-gradient-to-r from-amber-500 to-yellow-300' },
  { textColor: 'text-rose-300', barColor: 'bg-gradient-to-r from-rose-500 to-pink-300' },
  { textColor: 'text-cyan-300', barColor: 'bg-gradient-to-r from-cyan-500 to-teal-300' },
];

interface DemandBreakdownProps {
  services?: ServicePerformanceItem[];
  isLoading?: boolean;
}

export const DemandBreakdown: React.FC<DemandBreakdownProps> = ({
  services = [],
  isLoading = false,
}) => {
  return (
    <div className="office-blue-card rounded-2xl p-5 border border-blue-400/25 relative overflow-hidden">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-blue-400/20">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-300" />
          <h3 className="text-sm font-bold text-white tracking-tight">Consultancy Demand</h3>
        </div>
        <span className="text-[10px] text-sky-200 font-semibold bg-blue-500/25 px-2 py-0.5 rounded border border-blue-400/35">
          Distribution
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3 py-4">
          <div className="h-4 bg-blue-950/40 rounded animate-pulse w-3/4 border border-blue-400/10" />
          <div className="h-4 bg-blue-950/40 rounded animate-pulse w-5/6 border border-blue-400/10" />
          <div className="h-4 bg-blue-950/40 rounded animate-pulse w-2/3 border border-blue-400/10" />
        </div>
      ) : services.length > 0 ? (
        <div className="space-y-3.5 text-xs">
          {services.map((item, idx) => {
            const palette = COLOR_PALETTES[idx % COLOR_PALETTES.length];
            return (
              <DemandItem
                key={item.service}
                label={item.service}
                percentage={item.sharePercentage}
                inquiries={item.totalInquiries}
                textColor={palette.textColor}
                barColor={palette.barColor}
              />
            );
          })}
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-sky-200/70 bg-blue-950/30 rounded-xl border border-blue-400/15">
          No service demand data logged yet.
        </div>
      )}
    </div>
  );
};
