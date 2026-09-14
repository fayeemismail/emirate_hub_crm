'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Inbox, 
  Layers, 
  Settings, 
  ChevronRight, 
  Plus, 
  X, 
  Briefcase,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: 'dashboard' | 'requests' | 'services' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'requests' | 'services' | 'settings') => void;
  pendingCount: number;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  onOpenSimulateModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  pendingCount,
  isOpenMobile,
  setIsOpenMobile,
  onOpenSimulateModal,
}) => {
  const { user, logout } = useAuth();
  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'FX';

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
    {
      id: 'services',
      label: 'Consultancy Services',
      icon: Layers,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ] as const;

  return (
    <>
      {/* Mobile backdrop with smooth fade */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0f172a] border-r border-white/10 flex flex-col justify-between
        transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Top Brand Section */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl formal-gradient-bg flex items-center justify-center text-white shadow-md shadow-sky-900/30">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5 uppercase font-mono">
                  foundex
                </span>
                <span className="text-[9px] font-semibold tracking-wider text-sky-400 uppercase">
                  Business Consultancy
                </span>
              </div>
            </div>
            
            <button 
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setIsOpenMobile(false)}
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                  className={`
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 group
                    ${isActive 
                      ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-inner' 
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.badge !== null && (
                      <span className={`
                        px-2 py-0.5 text-[10px] font-bold rounded-full
                        ${isActive 
                          ? 'bg-sky-500 text-white' 
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                        }
                      `}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={`w-3.5 h-3.5 transition-opacity ${isActive ? 'text-sky-400 opacity-100' : 'opacity-0 group-hover:opacity-100 text-slate-500'}`} />
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions & Profile */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {/* Quick Simulate Button */}
          <button
            onClick={() => {
              onOpenSimulateModal();
              setIsOpenMobile(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-semibold tracking-wide transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simulate Form Request</span>
          </button>

          {/* Business Admin Profile & Logout */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-white/10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0">
              {userInitials}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-200 truncate">
                {user?.name || 'FoundX Admin'}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {user?.email || 'admin@foundx.com'}
              </span>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
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
