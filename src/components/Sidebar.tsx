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
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#061730] border-r border-blue-400/20 flex flex-col justify-between
        transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Top Brand Section */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-blue-400/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-900/50 border border-blue-300/30">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5 uppercase font-mono">
                  emirate hub
                </span>
                <span className="text-[9px] font-bold tracking-wider text-sky-300 uppercase">
                  Business Consultancy
                </span>
              </div>
            </div>
            
            <button 
              className="lg:hidden text-sky-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => setIsOpenMobile(false)}
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-bold text-sky-300/70 uppercase tracking-wider">
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
                    w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 group cursor-pointer
                    ${isActive 
                      ? 'bg-blue-600 text-white border border-blue-400/40 shadow-md shadow-blue-900/50 font-semibold' 
                      : 'text-sky-100 hover:text-white hover:bg-blue-800/30 border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-sky-300 group-hover:text-white'}`} />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.badge !== null && (
                      <span className={`
                        px-2 py-0.5 text-[10px] font-bold rounded-full
                        ${isActive 
                          ? 'bg-white text-blue-900 shadow-sm' 
                          : 'bg-blue-500/30 text-sky-200 border border-blue-400/35'
                        }
                      `}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={`w-3.5 h-3.5 transition-opacity ${isActive ? 'text-white opacity-100' : 'opacity-0 group-hover:opacity-100 text-sky-400'}`} />
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions & Profile */}
        <div className="p-4 border-t border-blue-400/20 space-y-3">
          {/* Business Admin Profile & Logout */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#081f3e] border border-blue-400/25">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0 border border-blue-300/30">
              {userInitials}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-white truncate">
                {user?.name || 'Emirate Hub Admin'}
              </span>
              <span className="text-[10px] text-sky-200/80 truncate">
                {user?.email || 'admin@emirate.com'}
              </span>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-lg text-sky-200 hover:text-rose-300 hover:bg-rose-500/20 transition-colors shrink-0 cursor-pointer"
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
