'use client';

import React, { useState } from 'react';
import { Search, Menu, Briefcase, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onOpenMobileMenu: () => void;
  unreadCount?: number;
  isOfficeBlue?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  searchTerm,
  setSearchTerm,
  onOpenMobileMenu,
  isOfficeBlue = true,
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
    : 'EH';

  return (
    <header className="h-16 px-3 sm:px-6 lg:px-8 backdrop-blur-md flex items-center justify-between sticky top-0 z-30 transition-all bg-[#081e3a]/95 border-b border-blue-400/20 shadow-sm shadow-blue-950/20">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open Mobile Menu"
          className="lg:hidden text-sky-200 hover:text-white p-2 rounded-xl hover:bg-blue-800/30 transition-colors shrink-0 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2 truncate">
            <Briefcase className="w-4 h-4 shrink-0 hidden xs:inline-block text-sky-300" />
            <span className="truncate">{title}</span>
          </h1>
          {subtitle && (
            <p className="text-[11px] hidden md:block truncate text-sky-200/80">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search Input - Fluid width on mobile */}
        <div className="relative w-32 xs:w-40 sm:w-56 md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-sky-300" />
          <input
            type="text"
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 rounded-xl text-xs text-white transition-all focus:outline-none bg-[#061834] border border-blue-400/30 placeholder-sky-200/60 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/30"
          />
        </div>

        {/* User Avatar with Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-blue-900/50 border border-blue-300/30 hover:ring-2 hover:ring-sky-300/50 transition-all cursor-pointer"
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
              <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-[#081e3a]/98 backdrop-blur-xl border border-blue-400/25 shadow-2xl shadow-blue-950/80 z-50 text-xs">
                <div className="px-3 py-2 border-b border-blue-400/20 mb-1">
                  <div className="font-bold text-white truncate">{user?.name || 'Emirate Hub Admin'}</div>
                  <div className="text-[10px] text-sky-200/80 truncate">{user?.email || 'admin@emirate.com'}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-500/20 text-sky-200 border border-blue-400/30 text-[9px] font-semibold">
                    {user?.role || 'ADMIN'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-300 hover:bg-rose-500/20 transition-colors text-left cursor-pointer font-medium"
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
