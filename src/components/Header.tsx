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
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  searchTerm,
  setSearchTerm,
  onOpenMobileMenu,
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
    <header 
      className="h-16 px-3 sm:px-6 lg:px-8 backdrop-blur-md flex items-center justify-between sticky top-0 z-30 transition-all border-b shadow-sm"
      style={{
        backgroundColor: '#081e3af2',
        borderColor: '#93c5fd33',
        boxShadow: '0 4px 20px #02061733',
      }}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open Mobile Menu"
          className="lg:hidden p-2 rounded-xl transition-colors shrink-0 cursor-pointer"
          style={{ color: '#bae6fd' }}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 
            className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2 truncate"
            style={{ color: '#ffffff' }}
          >
            <Briefcase className="w-4 h-4 shrink-0 hidden xs:inline-block" style={{ color: '#7dd3fc' }} />
            <span className="truncate">{title}</span>
          </h1>
          {subtitle && (
            <p 
              className="text-[11px] hidden md:block truncate"
              style={{ color: '#bae6fdcc' }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search Input - Fluid width on mobile */}
        <div className="relative w-32 xs:w-40 sm:w-56 md:w-64">
          <Search 
            className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" 
            style={{ color: '#7dd3fc' }}
          />
          <input
            type="text"
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 rounded-xl text-xs transition-all focus:outline-none border"
            style={{
              backgroundColor: '#061834',
              borderColor: '#93c5fd4d',
              color: '#ffffff',
            }}
          />
        </div>

        {/* User Avatar with Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-md border hover:ring-2 transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
              borderColor: '#93c5fd4d',
              boxShadow: '0 4px 14px #1e3a8a80',
            }}
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
              <div 
                className="absolute right-0 mt-2 w-56 p-2 rounded-2xl backdrop-blur-xl border shadow-2xl z-50 text-xs"
                style={{
                  backgroundColor: '#081e3afa',
                  borderColor: '#93c5fd40',
                  boxShadow: '0 20px 40px #020617cc',
                }}
              >
                <div 
                  className="px-3 py-2 border-b mb-1"
                  style={{ borderColor: '#93c5fd33' }}
                >
                  <div className="font-bold truncate" style={{ color: '#ffffff' }}>
                    {user?.name || 'Emirate Hub Admin'}
                  </div>
                  <div className="text-[10px] truncate" style={{ color: '#bae6fdcc' }}>
                    {user?.email || 'admin@emirate.com'}
                  </div>
                  <span 
                    className="inline-block mt-1 px-2 py-0.5 rounded border text-[9px] font-semibold"
                    style={{
                      backgroundColor: '#3b82f633',
                      borderColor: '#60a5fa4d',
                      color: '#bae6fd',
                    }}
                  >
                    {user?.role || 'ADMIN'}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left cursor-pointer font-medium hover:bg-[#f43f5e33]"
                  style={{ color: '#fca5a5' }}
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
