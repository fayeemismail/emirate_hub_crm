import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  iconBorderColor?: string;
  cardBgColor?: string;
  cardBorderColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon: Icon,
  iconColor = '#E02126',
  iconBgColor = '#FEE2E2',
  iconBorderColor = '#FECACA',
  cardBgColor = 'var(--crm-card-bg, #FFFFFF)',
  cardBorderColor = 'var(--crm-card-border, #E7E5E4)',
}) => {
  return (
    <div 
      className="rounded-2xl p-5 border transition-all duration-200 hover:-translate-y-0.5"
      style={{
        backgroundColor: cardBgColor,
        borderColor: cardBorderColor,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--crm-text-secondary, #78716C)' }}>
          {label}
        </span>
        <div 
          className="p-2 rounded-xl border"
          style={{
            backgroundColor: iconBgColor,
            borderColor: iconBorderColor,
            color: iconColor,
          }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
      </div>
      <span className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--crm-text-primary, #1C1917)' }}>
        {value}
      </span>
    </div>
  );
};
