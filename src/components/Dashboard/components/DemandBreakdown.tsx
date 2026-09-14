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
    <div className="flex justify-between text-slate-300 font-medium mb-1">
      <span className="truncate pr-2">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] text-slate-400">{inquiries} reqs</span>
        <span className={`${textColor} font-bold font-mono`}>{percentage}%</span>
      </div>
    </div>
    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
      <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${Math.max(percentage, 2)}%` }} />
    </div>
  </div>
);

const COLOR_PALETTES = [
  { textColor: 'text-sky-400', barColor: 'bg-sky-500' },
  { textColor: 'text-indigo-400', barColor: 'bg-indigo-500' },
  { textColor: 'text-emerald-400', barColor: 'bg-emerald-500' },
  { textColor: 'text-amber-400', barColor: 'bg-amber-500' },
  { textColor: 'text-rose-400', barColor: 'bg-rose-500' },
  { textColor: 'text-cyan-400', barColor: 'bg-cyan-500' },
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
    <div className="formal-card rounded-2xl p-5 border border-white/10 relative overflow-hidden">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-white">Consultancy Demand</h3>
        </div>
        <span className="text-[10px] text-slate-400 font-medium bg-white/5 px-2 py-0.5 rounded border border-white/10">
          Distribution
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3 py-4">
          <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-white/5 rounded animate-pulse w-5/6" />
          <div className="h-4 bg-white/5 rounded animate-pulse w-2/3" />
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
        <div className="p-6 text-center text-xs text-slate-400 bg-white/2 rounded-xl">
          No service demand data logged yet.
        </div>
      )}
    </div>
  );
};
