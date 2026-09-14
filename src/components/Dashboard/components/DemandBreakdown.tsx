import React from 'react';
import { Layers } from 'lucide-react';

interface DemandItemProps {
  label: string;
  percentage: number;
  textColor: string;
  barColor: string;
}

const DemandItem: React.FC<DemandItemProps> = ({
  label,
  percentage,
  textColor,
  barColor,
}) => (
  <div>
    <div className="flex justify-between text-slate-300 font-medium mb-1">
      <span>{label}</span>
      <span className={`${textColor} font-bold`}>{percentage}%</span>
    </div>
    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
      <div className={`h-full ${barColor} rounded-full`} style={{ width: `${percentage}%` }} />
    </div>
  </div>
);

export const DemandBreakdown: React.FC = () => {
  const demandData = [
    { label: 'Enterprise Strategy', percentage: 38, textColor: 'text-sky-400', barColor: 'bg-sky-500' },
    { label: 'AI & Automation', percentage: 32, textColor: 'text-indigo-400', barColor: 'bg-indigo-500' },
    { label: 'Cloud Infrastructure', percentage: 18, textColor: 'text-blue-400', barColor: 'bg-blue-500' },
    { label: 'Digital Transformation', percentage: 12, textColor: 'text-emerald-400', barColor: 'bg-emerald-500' },
  ];

  return (
    <div className="formal-card rounded-2xl p-5 border border-white/10">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
        <Layers className="w-4 h-4 text-sky-400" />
        <h3 className="text-sm font-bold text-white">Consultancy Demand</h3>
      </div>

      <div className="space-y-3.5 text-xs">
        {demandData.map((item) => (
          <DemandItem key={item.label} {...item} />
        ))}
      </div>
    </div>
  );
};
