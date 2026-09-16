'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Inbox, 
  ChevronRight, 
  X, 
  Briefcase, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: 'dashboard' | 'requests';
  setActiveTab: (tab: 'dashboard' | 'requests') => void;
  pendingCount: number;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const { user, logout } = useAuth();
  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'EH';

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
          style={{ backgroundColor: '#020617cc' }}
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
          background: 'linear-gradient(180deg, #081d39 0%, #071830 50%, #051224 100%)',
          borderColor: '#93c5fd33',
        }}
      >
        {/* Top Brand Section */}
        <div>
          <div 
            className="h-16 px-6 flex items-center justify-between border-b backdrop-blur-md"
            style={{ 
              backgroundColor: '#081e3ab3',
              borderColor: '#93c5fd33',
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md border"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #38bdf8 100%)',
                  borderColor: '#93c5fd4d',
                  boxShadow: '0 4px 14px #1e3a8a80',
                }}
              >
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span 
                  className="font-extrabold text-base tracking-tight flex items-center gap-1.5 uppercase font-mono"
                  style={{ color: '#ffffff' }}
                >
                  emirate hub
                </span>
                <span 
                  className="text-[9px] font-bold tracking-wider uppercase"
                  style={{ color: '#7dd3fc' }}
                >
                  Business Consultancy
                </span>
              </div>
            </div>
            
            <button 
              className="lg:hidden p-1 rounded-lg transition-colors cursor-pointer"
              style={{ color: '#bae6fd' }}
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
              style={{ color: '#7dd3fccc' }}
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
                          background: 'linear-gradient(90deg, #2563eb 0%, #0284c7 100%)',
                          color: '#ffffff',
                          borderColor: '#60a5fa66',
                          boxShadow: '0 4px 12px #1e3a8a80',
                          fontWeight: 600,
                        }
                      : {
                          backgroundColor: 'transparent',
                          color: '#bae6fde6',
                          borderColor: 'transparent',
                        }
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon 
                      className="w-4 h-4 transition-colors" 
                      style={{ color: isActive ? '#ffffff' : '#7dd3fc' }}
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
                                backgroundColor: '#ffffff',
                                color: '#1e3a8a',
                                borderColor: '#ffffff',
                              }
                            : {
                                backgroundColor: '#3b82f633',
                                color: '#bae6fd',
                                borderColor: '#60a5fa4d',
                              }
                        }
                      >
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight 
                      className="w-3.5 h-3.5 transition-opacity" 
                      style={{ color: isActive ? '#ffffff' : '#38bdf8' }}
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
            backgroundColor: '#06142699',
            borderColor: '#93c5fd33',
          }}
        >
          {/* Business Admin Profile & Logout */}
          <div 
            className="flex items-center gap-2.5 p-2.5 rounded-xl border shadow-sm"
            style={{
              backgroundColor: '#081e3a',
              borderColor: '#93c5fd40',
            }}
          >
            <div 
              className="w-8 h-8 rounded-lg text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0 border"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
                borderColor: '#93c5fd4d',
              }}
            >
              {userInitials}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span 
                className="text-xs font-bold truncate"
                style={{ color: '#ffffff' }}
              >
                {user?.name || 'Emirate Hub Admin'}
              </span>
              <span 
                className="text-[10px] truncate"
                style={{ color: '#bae6fdcc' }}
              >
                {user?.email || 'admin@emirate.com'}
              </span>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer hover:bg-[#f43f5e33]"
              style={{ color: '#bae6fd' }}
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
