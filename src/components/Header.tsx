'use client';

import React, { useState } from 'react';
import { Search, Bell, Menu, PlusCircle, Briefcase, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onOpenMobileMenu: () => void;
  onOpenSimulateModal: () => void;
  unreadCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  searchTerm,
  setSearchTerm,
  onOpenMobileMenu,
  onOpenSimulateModal,
  unreadCount,
}) => {
  const { user, logout } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'FX';

  return (
    <header className="h-16 px-3 sm:px-6 lg:px-8 bg-[#0f172a]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between sticky top-0 z-30 transition-all">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open Mobile Menu"
          className="lg:hidden text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2 truncate">
            <Briefcase className="w-4 h-4 text-sky-400 shrink-0 hidden xs:inline-block" />
            <span className="truncate">{title}</span>
          </h1>
          {subtitle && (
            <p className="text-[11px] text-slate-400 hidden md:block truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search Input - Fluid width on mobile */}
        <div className="relative w-32 xs:w-40 sm:w-56 md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 bg-slate-800/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500/50 transition-all"
          />
        </div>

        {/* Simulate Request Button - Responsive icon on small mobile */}
        <button
          onClick={onOpenSimulateModal}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl formal-gradient-bg text-white text-xs font-semibold shadow-md shadow-sky-900/30 hover:opacity-95 transition-all shrink-0"
          title="Simulate Website Form Request"
        >
          <PlusCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Simulate Request</span>
          <span className="sm:hidden text-[11px]">New</span>
        </button>

        {/* Notifications Icon */}
        <div className="relative shrink-0">
          <button 
            aria-label="View Notifications"
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 border border-white/10 hover:border-white/20 transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sky-400 ring-2 ring-[#0f172a]" />
            )}
          </button>
        </div>

        {/* User Avatar with Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm border border-white/10 hover:ring-2 hover:ring-sky-400/50 transition-all"
            title={user?.email || 'Admin Profile'}
          >
            {userInitials}
          </button>

          {showUserDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserDropdown(false)} 
              />
              <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl z-50 text-xs">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <div className="font-bold text-white truncate">{user?.name || 'FoundX Admin'}</div>
                  <div className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@foundx.com'}</div>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[9px] font-semibold">
                    {user?.role || 'ADMIN'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
