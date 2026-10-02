'use client';

import React from 'react';

/** App footer. */
export const DashboardFooter: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-auto border-t"
      style={{
        backgroundColor: 'var(--crm-header-bg, #FFFFFF)',
        borderColor: 'var(--crm-sidebar-border, #E7E5E4)',
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p
            className="text-sm font-semibold tracking-tight"
            style={{ color: 'var(--crm-text-primary, #1C1917)' }}
          >
            Emirate Hub
          </p>
          <p className="mt-0.5 text-sm" style={{ color: '#78716C' }}>
            CRM for leads and client inquiries
          </p>
        </div>
        <p className="text-sm tabular-nums" style={{ color: '#A8A29E' }}>
          © {year} Emirate Hub
        </p>
      </div>
    </footer>
  );
};
