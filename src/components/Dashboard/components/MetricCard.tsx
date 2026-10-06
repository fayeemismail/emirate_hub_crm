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
  className?: string;
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
  className = '',
}) => {
  return (
    <div
      className={`crm-lift rounded-2xl border p-3.5 sm:p-5 ${className}`}
      style={{
        backgroundColor: cardBgColor,
        borderColor: cardBorderColor,
      }}
    >
      <div className="mb-2 flex items-center justify-between sm:mb-3">
        <span
          className="text-[10px] font-semibold uppercase tracking-wider sm:text-xs"
          style={{ color: 'var(--crm-text-secondary, #78716C)' }}
        >
          {label}
        </span>
        <div
          className="rounded-lg border p-1.5 sm:rounded-xl sm:p-2"
          style={{
            backgroundColor: iconBgColor,
            borderColor: iconBorderColor,
            color: iconColor,
          }}
        >
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: iconColor }} />
        </div>
      </div>
      <span
        className="text-2xl font-extrabold tracking-tight tabular-nums sm:text-3xl"
        style={{ color: valueColor }}
      >
        {value}
      </span>
      {hint ? (
        <p
          className="mt-1.5 hidden text-xs leading-snug sm:mt-2 sm:block"
          style={{ color: '#A8A29E' }}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
};
