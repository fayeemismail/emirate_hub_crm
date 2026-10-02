'use client';

import React from 'react';
import { Menu, Plus } from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onCreateLead: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onCreateLead,
}) => {
  return (
    <header 
      className="h-16 px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-all border-b"
      style={{
        backgroundColor: 'var(--crm-header-bg, #FFFFFF)',
        borderColor: 'var(--crm-sidebar-border, #E7E5E4)',
      }}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open Mobile Menu"
          className="lg:hidden p-2 rounded-xl transition-colors shrink-0 cursor-pointer"
          style={{ color: 'var(--crm-text-secondary, #A8A29E)' }}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
        <button
          type="button"
          onClick={onCreateLead}
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors cursor-pointer shrink-0"
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
          title="Create lead"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Create lead</span>
        </button>
      </div>
    </header>
  );
};
