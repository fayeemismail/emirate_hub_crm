import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  iconColor?: string;
  iconBgColor?: string;
  iconBorderColor?: string;
  cardBgColor?: string;
  cardBorderColor?: string;
  valueColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon: Icon,
  hint,
  iconColor = '#E02126',
  iconBgColor = '#FEE2E2',
  iconBorderColor = '#FECACA',
  cardBgColor = 'var(--crm-card-bg, #FFFFFF)',
  cardBorderColor = 'var(--crm-card-border, #E7E5E4)',
  valueColor = 'var(--crm-text-primary, #1C1917)',
}) => {
  return (
    <div 
      className="crm-lift rounded-2xl p-5 border"
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
      <span className="text-3xl font-extrabold tracking-tight tabular-nums" style={{ color: valueColor }}>
        {value}
      </span>
      {hint ? (
        <p className="mt-2 text-xs leading-snug" style={{ color: '#A8A29E' }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
};
