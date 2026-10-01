'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Inbox, 
  ChevronRight, 
  X, 
  Briefcase, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SanitySiteSettings } from '../sanity';
import { ConfirmModal } from './ui/ConfirmModal';

interface SidebarProps {
  activeTab: 'dashboard' | 'requests';
  setActiveTab: (tab: 'dashboard' | 'requests') => void;
  pendingCount: number;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  siteSettings?: SanitySiteSettings | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  isOpenMobile,
  setIsOpenMobile,
  siteSettings,
}) => {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const userInitials = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'E';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'requests',
      label: 'Service Inquiries',
      icon: Inbox,
      badge: pendingCount > 0 ? pendingCount : null,
    },
  ] as const;

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
          backgroundColor: 'var(--sanity-sidebar-start, #FFFFFF)',
          borderColor: 'var(--sanity-sidebar-border, #E7E5E4)',
        }}
      >
        {/* Top Brand Section */}
        <div>
          <div 
            className="h-16 px-6 flex items-center justify-between border-b"
            style={{ 
              backgroundColor: 'var(--sanity-header-bg, #FFFFFF)',
              borderColor: 'var(--sanity-sidebar-border, #E7E5E4)',
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white border"
                style={{
                  backgroundColor: 'var(--sanity-accent-primary, #E02126)',
                  borderColor: 'var(--sanity-card-border, #E7E5E4)',
                }}
              >
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span 
                className="font-extrabold text-base tracking-tight uppercase font-mono"
                style={{ color: 'var(--sanity-text-primary, #1C1917)' }}
              >
                {siteSettings?.companyName || 'emirate hub'}
              </span>
            </div>
            
            <button 
              className="lg:hidden p-1 rounded-lg transition-colors cursor-pointer"
              style={{ color: 'var(--sanity-text-secondary, #A8A29E)' }}
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
              style={{ color: 'var(--sanity-text-muted, #78716C)' }}
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
                    setActiveTab(item.id as any);
                    setIsOpenMobile(false);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 group cursor-pointer border"
                  style={
                    isActive
                      ? {
                          backgroundColor: 'var(--sanity-sidebar-active-start, #E02126)',
                          color: 'var(--sanity-btn-primary-txt, #FFFFFF)',
                          borderColor: 'transparent',
                          fontWeight: 600,
                        }
                      : {
                          backgroundColor: 'transparent',
                          color: 'var(--sanity-text-secondary, #A8A29E)',
                          borderColor: 'transparent',
                        }
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon 
                      className="w-4 h-4 transition-colors" 
                      style={{ color: isActive ? 'var(--sanity-btn-primary-txt, #FFFFFF)' : 'var(--sanity-text-muted, #78716C)' }}
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
                                color: 'var(--sanity-accent-primary, #E02126)',
                                borderColor: '#FFFFFF',
                              }
                            : {
                                backgroundColor: 'var(--sanity-pill-bg, #E021261A)',
                                color: 'var(--sanity-pill-txt, #F0A8A8)',
                                borderColor: 'var(--sanity-pill-border, #E0212640)',
                              }
                        }
                      >
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight 
                      className="w-3.5 h-3.5 transition-opacity" 
                      style={{ color: isActive ? '#FFFFFF' : 'var(--sanity-text-muted, #78716C)' }}
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
            backgroundColor: 'var(--sanity-header-bg, #FFFFFF)',
            borderColor: 'var(--sanity-sidebar-border, #E7E5E4)',
          }}
        >
          {/* Business Admin Profile & Logout */}
          <div 
            className="flex items-center gap-2.5 p-2.5 rounded-xl border"
            style={{
              backgroundColor: 'var(--sanity-inner-card-bg, #FAF9F6)',
              borderColor: 'var(--sanity-card-border, #E7E5E4)',
            }}
          >
            <div 
              className="w-8 h-8 rounded-lg text-white flex items-center justify-center text-xs font-bold shrink-0 border"
              style={{
                backgroundColor: 'var(--sanity-accent-primary, #E02126)',
                borderColor: 'var(--sanity-card-border, #E7E5E4)',
              }}
            >
              {userInitials}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span 
                className="text-xs font-bold truncate"
                style={{ color: 'var(--sanity-text-primary, #1C1917)' }}
              >
                {user?.name || 'Emirate Hub Admin'}
              </span>
              <span 
                className="text-[10px] truncate"
                style={{ color: 'var(--sanity-text-secondary, #A8A29E)' }}
              >
                {user?.email || 'admin@emirate.com'}
              </span>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer hover:bg-[#E0212633]"
              style={{ color: 'var(--sanity-text-secondary, #A8A29E)' }}
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
