import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number | string;
  badgeText: string;
  badgeStyle: string;
  icon: LucideIcon;
  iconContainerStyle: string;
  subtext: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  badgeText,
  badgeStyle,
  icon: Icon,
  iconContainerStyle,
  subtext,
}) => {
  return (
    <div className="formal-card formal-card-hover rounded-2xl p-5 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-xl ${iconContainerStyle}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-white tracking-tight">{value}</span>
        <span className={`text-xs font-bold ${badgeStyle}`}>{badgeText}</span>
      </div>
      <p className="text-[11px] text-slate-400 mt-1">{subtext}</p>
    </div>
  );
};
