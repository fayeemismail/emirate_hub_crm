'use client';

import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  Plus,
  Archive,
  Settings,
} from 'lucide-react';
import type { DashboardTab } from '../hooks/useActiveTab';

interface MobileBottomNavProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  pendingCount: number;
  onCreateLead: () => void;
  onOpenMenu?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  onCreateLead,
}) => {
  const isDashboard = activeTab === 'dashboard';
  const isRequests = activeTab === 'requests';
  const isArchives = activeTab === 'archives';
  const isSettings = activeTab === 'settings';

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed inset-x-0 bottom-0 z-40 backdrop-blur-xl lg:hidden"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        boxShadow: '0 -4px 20px rgba(28, 25, 23, 0.08)',
      }}
    >
      <div className="mx-auto flex max-w-md items-center justify-between px-2 pt-2">
        {/* Dashboard */}
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="group flex flex-1 flex-col items-center justify-center gap-1 py-1 text-center touch-manipulation cursor-pointer active:scale-95 transition-transform"
          style={{
            color: isDashboard ? 'var(--crm-accent-primary, #E02126)' : '#78716C',
          }}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
              isDashboard ? 'bg-red-50 text-red-600' : 'text-stone-600'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <span
            className={`text-[11.5px] font-semibold tracking-tight ${
              isDashboard ? 'text-red-600' : 'text-stone-600'
            }`}
          >
            Home
          </span>
        </button>

        {/* Service Inquiries */}
        <button
          type="button"
          onClick={() => setActiveTab('requests')}
          className="group relative flex flex-1 flex-col items-center justify-center gap-1 py-1 text-center touch-manipulation cursor-pointer active:scale-95 transition-transform"
          style={{
            color: isRequests ? 'var(--crm-accent-primary, #E02126)' : '#78716C',
          }}
        >
          <div
            className={`relative flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
              isRequests ? 'bg-red-50 text-red-600' : 'text-stone-600'
            }`}
          >
            <Inbox className="h-5 w-5" />
            {pendingCount > 0 && (
              <span
                className="absolute -top-1 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-xs"
                style={{ backgroundColor: 'var(--crm-accent-primary, #E02126)' }}
              >
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
          </div>
          <span
            className={`text-[11.5px] font-semibold tracking-tight ${
              isRequests ? 'text-red-600' : 'text-stone-600'
            }`}
          >
            Inquiries
          </span>
        </button>

        {/* Center Quick Action: Create Lead */}
        <div className="flex flex-1 items-center justify-center px-1">
          <button
            type="button"
            onClick={onCreateLead}
            className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg active:scale-90 transition-transform touch-manipulation cursor-pointer"
            style={{
              backgroundColor: 'var(--crm-accent-primary, #E02126)',
              boxShadow: '0 4px 14px rgba(224, 33, 38, 0.4)',
            }}
            title="Create new lead"
            aria-label="Create new lead"
          >
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Archives */}
        <button
          type="button"
          onClick={() => setActiveTab('archives')}
          className="group flex flex-1 flex-col items-center justify-center gap-1 py-1 text-center touch-manipulation cursor-pointer active:scale-95 transition-transform"
          style={{
            color: isArchives ? 'var(--crm-accent-primary, #E02126)' : '#78716C',
          }}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
              isArchives ? 'bg-red-50 text-red-600' : 'text-stone-600'
            }`}
          >
            <Archive className="h-5 w-5" />
          </div>
          <span
            className={`text-[11.5px] font-semibold tracking-tight ${
              isArchives ? 'text-red-600' : 'text-stone-600'
            }`}
          >
            Archives
          </span>
        </button>

        {/* Settings (Last navlink) */}
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className="group flex flex-1 flex-col items-center justify-center gap-1 py-1 text-center touch-manipulation cursor-pointer active:scale-95 transition-transform"
          style={{
            color: isSettings ? 'var(--crm-accent-primary, #E02126)' : '#78716C',
          }}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
              isSettings ? 'bg-red-50 text-red-600' : 'text-stone-600'
            }`}
          >
            <Settings className="h-5 w-5" />
          </div>
          <span
            className={`text-[11.5px] font-semibold tracking-tight ${
              isSettings ? 'text-red-600' : 'text-stone-600'
            }`}
          >
            Settings
          </span>
        </button>
      </div>
    </nav>
  );
};
