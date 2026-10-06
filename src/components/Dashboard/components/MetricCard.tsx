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
  compactHorizontalOnMobile?: boolean;
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
  compactHorizontalOnMobile = false,
}) => {
  if (compactHorizontalOnMobile) {
    return (
      <div
        className={`crm-lift rounded-2xl border p-3 sm:p-5 ${className}`}
        style={{
          backgroundColor: cardBgColor,
          borderColor: cardBorderColor,
        }}
      >
        {/* Mobile: Sleek horizontal summary row */}
        <div className="flex items-center justify-between gap-3 sm:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="rounded-lg border p-1.5 shrink-0"
              style={{
                backgroundColor: iconBgColor,
                borderColor: iconBorderColor,
                color: iconColor,
              }}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: iconColor }} />
            </div>
            <div className="min-w-0">
              <span
                className="block text-[11px] font-semibold uppercase tracking-wider truncate"
                style={{ color: 'var(--crm-text-secondary, #78716C)' }}
              >
                {label}
              </span>
              {hint ? (
                <p className="text-[11px] leading-tight truncate" style={{ color: '#A8A29E' }}>
                  {hint}
                </p>
              ) : null}
            </div>
          </div>
          <span
            className="text-xl font-extrabold tracking-tight tabular-nums shrink-0"
            style={{ color: valueColor }}
          >
            {value}
          </span>
        </div>

        {/* Desktop: Exactly standard card layout */}
        <div className="hidden sm:block">
          <div className="mb-3 flex items-center justify-between">
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--crm-text-secondary, #78716C)' }}
            >
              {label}
            </span>
            <div
              className="rounded-xl border p-2"
              style={{
                backgroundColor: iconBgColor,
                borderColor: iconBorderColor,
                color: iconColor,
              }}
            >
              <Icon className="h-4 w-4" style={{ color: iconColor }} />
            </div>
          </div>
          <span
            className="text-3xl font-extrabold tracking-tight tabular-nums"
            style={{ color: valueColor }}
          >
            {value}
          </span>
          {hint ? (
            <p className="mt-2 text-xs leading-snug" style={{ color: '#A8A29E' }}>
              {hint}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`crm-lift rounded-2xl border p-3 sm:p-5 ${className}`}
      style={{
        backgroundColor: cardBgColor,
        borderColor: cardBorderColor,
      }}
    >
      <div className="mb-1.5 flex items-center justify-between sm:mb-3">
        <span
          className="text-[10px] font-semibold uppercase tracking-wider sm:text-xs truncate"
          style={{ color: 'var(--crm-text-secondary, #78716C)' }}
        >
          {label}
        </span>
        <div
          className="rounded-lg border p-1 sm:rounded-xl sm:p-2 shrink-0"
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
        className="text-xl font-extrabold tracking-tight tabular-nums sm:text-3xl"
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
