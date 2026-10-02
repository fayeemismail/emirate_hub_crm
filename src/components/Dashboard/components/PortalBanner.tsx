import React from 'react';
import { Plus } from 'lucide-react';

interface PortalBannerProps {
  onOpenSimulateModal: () => void;
}

export const PortalBanner: React.FC<PortalBannerProps> = ({ onOpenSimulateModal }) => {
  return (
    <div
      className="flex flex-col gap-4 rounded-2xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6"
      style={{
        backgroundColor: 'var(--crm-card-bg, #FFFFFF)',
        borderColor: 'var(--crm-card-border, #E7E5E4)',
      }}
    >
      <div className="min-w-0">
        <h2
          className="text-base font-semibold tracking-tight"
          style={{ color: 'var(--crm-text-primary, #1C1917)' }}
        >
          Website inquiries
        </h2>
        <p
          className="mt-0.5 text-sm leading-snug"
          style={{ color: 'var(--crm-text-secondary, #78716C)' }}
        >
          Live form submissions from emiratehub.ae land here.
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenSimulateModal}
        className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition-colors cursor-pointer sm:self-auto"
        style={{
          color: 'var(--crm-accent-primary, #E02126)',
          borderColor: 'var(--crm-accent-primary, #E02126)',
          backgroundColor: '#FEE2E2',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#E02126';
          e.currentTarget.style.color = '#FFFFFF';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#FEE2E2';
          e.currentTarget.style.color = '#E02126';
        }}
      >
        <span>Create lead</span>
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
