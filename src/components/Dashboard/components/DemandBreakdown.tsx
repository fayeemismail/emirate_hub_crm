'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import { ServicePerformanceItem } from '../../../types';

interface DemandItemProps {
  label: string;
  percentage: number;
  inquiries: number;
  textColor: string;
  barGradient: string;
}

const DemandItem: React.FC<DemandItemProps> = ({
  label,
  percentage,
  inquiries,
  textColor,
  barGradient,
}) => (
  <div>
    <div className="flex justify-between font-medium mb-1.5 text-xs" style={{ color: '#ffffff' }}>
      <span className="truncate pr-2">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] font-medium" style={{ color: '#bae6fdcc' }}>{inquiries} reqs</span>
        <span className="font-bold font-mono" style={{ color: textColor }}>{percentage}%</span>
      </div>
    </div>
    <div 
      className="w-full h-2 rounded-full border overflow-hidden shadow-inner"
      style={{
        backgroundColor: '#061730',
        borderColor: '#93c5fd33',
      }}
    >
      <div 
        className="h-full rounded-full transition-all duration-500 shadow-sm" 
        style={{ 
          width: `${Math.max(percentage, 2)}%`,
          background: barGradient,
        }} 
      />
    </div>
  </div>
);

const HEX_COLOR_PALETTES = [
  { textColor: '#38bdf8', barGradient: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)' },
  { textColor: '#818cf8', barGradient: 'linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)' },
  { textColor: '#34d399', barGradient: 'linear-gradient(90deg, #059669 0%, #34d399 100%)' },
  { textColor: '#fbbf24', barGradient: 'linear-gradient(90deg, #d97706 0%, #fbbf24 100%)' },
  { textColor: '#fb7185', barGradient: 'linear-gradient(90deg, #e11d48 0%, #fb7185 100%)' },
  { textColor: '#22d3ee', barGradient: 'linear-gradient(90deg, #0891b2 0%, #22d3ee 100%)' },
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
    <div 
      className="rounded-2xl p-5 border relative overflow-hidden backdrop-blur-md"
      style={{
        backgroundColor: '#0d284ce6',
        borderColor: '#93c5fd40',
        boxShadow: '0 10px 30px #040f1eb3',
      }}
    >
      <div 
        className="flex items-center justify-between gap-2 mb-4 pb-3 border-b"
        style={{ borderColor: '#93c5fd33' }}
      >
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4" style={{ color: '#38bdf8' }} />
          <h3 className="text-sm font-bold tracking-tight" style={{ color: '#ffffff' }}>
            Consultancy Demand
          </h3>
        </div>
        <span 
          className="text-[10px] font-semibold px-2 py-0.5 rounded border"
          style={{
            backgroundColor: '#0284c733',
            borderColor: '#38bdf84d',
            color: '#bae6fd',
          }}
        >
          Distribution
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3 py-4">
          <div className="h-4 rounded animate-pulse w-3/4 border" style={{ backgroundColor: '#0b254866', borderColor: '#93c5fd1a' }} />
          <div className="h-4 rounded animate-pulse w-5/6 border" style={{ backgroundColor: '#0b254866', borderColor: '#93c5fd1a' }} />
          <div className="h-4 rounded animate-pulse w-2/3 border" style={{ backgroundColor: '#0b254866', borderColor: '#93c5fd1a' }} />
        </div>
      ) : services.length > 0 ? (
        <div className="space-y-3.5 text-xs">
          {services.map((item, idx) => {
            const palette = HEX_COLOR_PALETTES[idx % HEX_COLOR_PALETTES.length];
            return (
              <DemandItem
                key={item.service}
                label={item.service}
                percentage={item.sharePercentage}
                inquiries={item.totalInquiries}
                textColor={palette.textColor}
                barGradient={palette.barGradient}
              />
            );
          })}
        </div>
      ) : (
        <div 
          className="p-6 text-center text-xs rounded-xl border"
          style={{
            backgroundColor: '#07162d99',
            borderColor: '#93c5fd26',
            color: '#bae6fdb3',
          }}
        >
          No service demand data logged yet.
        </div>
      )}
    </div>
  );
};
