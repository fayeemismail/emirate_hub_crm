'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Inbox,
  AlertTriangle,
  Archive,
  Settings,
  ChevronRight, 
  X, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from './ui/ConfirmModal';
import { BrandMark } from './BrandMark';
import type { DashboardTab } from '../hooks/useActiveTab';

interface SidebarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  pendingCount: number;
  orphanCount: number;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  orphanCount,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const userInitials = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'E';

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null as number | null,
    },
    {
      id: 'requests' as const,
      label: 'Service Inquiries',
      icon: Inbox,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    ...(orphanCount > 0
      ? [
          {
            id: 'off-pipeline' as const,
            label: 'Off-pipeline',
            icon: AlertTriangle,
            badge: orphanCount as number | null,
          },
        ]
      : []),
    {
      id: 'archives' as const,
      label: 'Archives',
      icon: Archive,
      badge: null as number | null,
    },
    {
      id: 'settings' as const,
      label: 'Settings',
      icon: Settings,
      badge: null as number | null,
    },
  ];

  return (
    <>
      {/* Mobile backdrop with smooth fade */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          style={{ backgroundColor: '#1C191733' }}
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside 
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-64 border-r backdrop-blur-xl flex flex-col justify-between
          transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          backgroundColor: 'var(--crm-sidebar-start, #FFFFFF)',
          borderColor: 'var(--crm-sidebar-border, #E7E5E4)',
        }}
      >
        {/* Top Brand Section */}
        <div>
          <div 
            className="h-16 px-6 flex items-center justify-between border-b"
            style={{ 
              backgroundColor: 'var(--crm-header-bg, #FFFFFF)',
              borderColor: 'var(--crm-sidebar-border, #E7E5E4)',
            }}
          >
            <div className="flex items-center gap-3">
              <BrandMark size="sm" />
              <span 
                className="font-extrabold text-base tracking-tight uppercase font-mono"
                style={{ color: 'var(--crm-text-primary, #1C1917)' }}
              >
                emirate hub
              </span>
            </div>
            
            <button 
              className="lg:hidden p-1 rounded-lg transition-colors cursor-pointer"
              style={{ color: 'var(--crm-text-secondary, #A8A29E)' }}
              onClick={() => setIsOpenMobile(false)}
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1.5">
            <div 
              className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: 'var(--crm-text-muted, #78716C)' }}
            >
              Consultancy Portal
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpenMobile(false);
                  }}
                  className="crm-interactive w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs group cursor-pointer border"
                  style={
                    isActive
                      ? {
                          backgroundColor: 'var(--crm-sidebar-active-start, #E02126)',
                          color: 'var(--crm-btn-primary-txt, #FFFFFF)',
                          borderColor: 'transparent',
                          fontWeight: 600,
                        }
                      : {
                          backgroundColor: 'transparent',
                          color: 'var(--crm-text-secondary, #A8A29E)',
                          borderColor: 'transparent',
                        }
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon 
                      className="w-4 h-4 transition-colors" 
                      style={{ color: isActive ? 'var(--crm-btn-primary-txt, #FFFFFF)' : 'var(--crm-text-muted, #78716C)' }}
                    />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.badge !== null && (
                      <span 
                        className="px-2 py-0.5 text-[10px] font-bold rounded-full border"
                        style={
                          isActive
                            ? {
                                backgroundColor: '#FFFFFF',
                                color: 'var(--crm-accent-primary, #E02126)',
                                borderColor: '#FFFFFF',
                              }
                            : {
                                backgroundColor: 'var(--crm-pill-bg, #E021261A)',
                                color: 'var(--crm-pill-txt, #F0A8A8)',
                                borderColor: 'var(--crm-pill-border, #E0212640)',
                              }
                        }
                      >
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight 
                      className="w-3.5 h-3.5 transition-opacity" 
                      style={{ color: isActive ? '#FFFFFF' : 'var(--crm-text-muted, #78716C)' }}
                    />
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions & Profile */}
        <div 
          className="p-4 border-t space-y-3"
          style={{
            backgroundColor: 'var(--crm-header-bg, #FFFFFF)',
            borderColor: 'var(--crm-sidebar-border, #E7E5E4)',
          }}
        >
          {/* Business Admin Profile & Logout */}
          <div 
            className="flex items-center gap-2.5 p-2.5 rounded-xl border"
            style={{
              backgroundColor: 'var(--crm-inner-card-bg, #FAF9F6)',
              borderColor: 'var(--crm-card-border, #E7E5E4)',
            }}
          >
            <div 
              className="w-8 h-8 rounded-lg text-white flex items-center justify-center text-xs font-bold shrink-0 border"
              style={{
                backgroundColor: 'var(--crm-accent-primary, #E02126)',
                borderColor: 'var(--crm-card-border, #E7E5E4)',
              }}
            >
              {userInitials}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span 
                className="text-xs font-bold truncate"
                style={{ color: 'var(--crm-text-primary, #1C1917)' }}
              >
                {user?.name || 'Emirate Hub Admin'}
              </span>
              <span 
                className="text-[10px] truncate"
                style={{ color: 'var(--crm-text-secondary, #A8A29E)' }}
              >
                {user?.email || 'admin@emirate.com'}
              </span>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer hover:bg-[#E0212633]"
              style={{ color: 'var(--crm-text-secondary, #A8A29E)' }}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={async () => {
          setShowLogoutConfirm(false);
          await logout();
        }}
        title="Sign out?"
        message="You will need to sign in again to access the CRM."
        confirmText="Sign out"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};
