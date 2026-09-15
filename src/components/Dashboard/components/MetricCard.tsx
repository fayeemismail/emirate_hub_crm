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
    <div className="office-blue-card office-blue-card-hover rounded-2xl p-5 border border-blue-400/25 relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-sky-200 uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-xl ${iconContainerStyle}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-3xl font-extrabold text-white tracking-tight">{value}</span>
        <span className={`text-xs font-bold ${badgeStyle}`}>{badgeText}</span>
      </div>
      <p className="text-[11px] text-sky-100/75 mt-1 font-medium">{subtext}</p>
    </div>
  );
};
