import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number | string;
  badgeText: string;
  badgeTextColor?: string;
  badgeBgColor?: string;
  badgeBorderColor?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  iconBorderColor?: string;
  subtext: string;
  cardBgColor?: string;
  cardBorderColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  badgeText,
  badgeTextColor = '#7dd3fc',
  badgeBgColor = '#0284c726',
  badgeBorderColor = '#38bdf84d',
  icon: Icon,
  iconColor = '#38bdf8',
  iconBgColor = '#3b82f633',
  iconBorderColor = '#60a5fa4d',
  subtext,
  cardBgColor = '#0d284ce6',
  cardBorderColor = '#93c5fd38',
}) => {
  return (
    <div 
      className="rounded-2xl p-5 border relative overflow-hidden backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5"
      style={{
        backgroundColor: cardBgColor,
        borderColor: cardBorderColor,
        boxShadow: '0 10px 30px #040f1eb3',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#bae6fd' }}>
          {label}
        </span>
        <div 
          className="p-2 rounded-xl border shadow-sm"
          style={{
            backgroundColor: iconBgColor,
            borderColor: iconBorderColor,
            color: iconColor,
          }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
      </div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-3xl font-extrabold tracking-tight" style={{ color: '#ffffff' }}>
          {value}
        </span>
        <span 
          className="text-xs font-bold px-2 py-0.5 rounded-full border"
          style={{
            color: badgeTextColor,
            backgroundColor: badgeBgColor,
            borderColor: badgeBorderColor,
          }}
        >
          {badgeText}
        </span>
      </div>
      <p className="text-[11px] mt-1 font-medium" style={{ color: '#bae6fdbf' }}>
        {subtext}
      </p>
    </div>
  );
};
