'use client';

import React, { useState, useRef, useEffect } from 'react';
import { RequestPriority } from '../../types';
import { ChevronDown, Check } from 'lucide-react';

interface PrioritySelectorProps {
  priority: RequestPriority;
  onChange: (newPriority: RequestPriority) => void;
  size?: 'sm' | 'md';
  align?: 'left' | 'right';
  className?: string;
  disabled?: boolean;
}

const PRIORITIES: {
  id: RequestPriority;
  label: string;
  dotColor: string;
  activeBg: string;
  activeText: string;
  activeBorder: string;
}[] = [
  {
    id: 'High',
    label: 'High Priority',
    dotColor: '#f43f5e',
    activeBg: '#f43f5e26',
    activeText: '#fca5a5',
    activeBorder: '#fb71854d',
  },
  {
    id: 'Medium',
    label: 'Medium Priority',
    dotColor: '#f59e0b',
    activeBg: '#f59e0b26',
    activeText: '#fcd34d',
    activeBorder: '#fbbf244d',
  },
  {
    id: 'Low',
    label: 'Low Priority',
    dotColor: '#38bdf8',
    activeBg: '#0284c726',
    activeText: '#bae6fd',
    activeBorder: '#38bdf84d',
  },
];

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  priority,
  onChange,
  size = 'sm',
  align = 'left',
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeConfig = PRIORITIES.find(p => p.id === priority) || PRIORITIES[1];

  // Close when clicked outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    setIsOpen(prev => !prev);
  };

  const handleSelect = (e: React.MouseEvent, pId: RequestPriority) => {
    e.stopPropagation();
    if (pId !== priority) {
      onChange(pId);
    }
    setIsOpen(false);
  };

  const sizeClasses = size === 'sm'
    ? 'px-2 py-1 text-[10px]'
    : 'px-3 py-1.5 text-xs';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      {/* Pill Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-label={`Change priority from ${priority}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`
          inline-flex items-center gap-1.5 rounded-full font-semibold border transition-all duration-150 cursor-pointer
          hover:brightness-125 focus:outline-none active:scale-95
          ${sizeClasses}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={{
          backgroundColor: activeConfig.activeBg,
          color: activeConfig.activeText,
          borderColor: activeConfig.activeBorder,
        }}
      >
        <span 
          className="w-1.5 h-1.5 rounded-full shrink-0" 
          style={{ backgroundColor: activeConfig.dotColor, boxShadow: `0 0 6px ${activeConfig.dotColor}` }} 
        />
        <span>{priority}</span>
        <ChevronDown 
          className={`w-3 h-3 transition-transform duration-200 opacity-70 ${isOpen ? 'rotate-180 opacity-100' : ''}`} 
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          onClick={(e) => e.stopPropagation()}
          className={`
            absolute top-full mt-1.5 z-50 min-w-[155px] p-1.5 rounded-xl border shadow-2xl
            animate-in fade-in zoom-in-95 duration-150 origin-top backdrop-blur-xl
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
          style={{
            backgroundColor: '#081e3af5',
            borderColor: '#93c5fd40',
            boxShadow: '0 20px 40px #020617cc',
          }}
        >
          <div 
            className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider border-b mb-1"
            style={{
              borderColor: '#93c5fd26',
              color: '#7dd3fc',
            }}
          >
            Set Priority
          </div>

          <div className="space-y-0.5">
            {PRIORITIES.map((item) => {
              const isSelected = item.id === priority;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  onClick={(e) => handleSelect(e, item.id)}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between gap-2.5 transition-all cursor-pointer text-left border"
                  style={
                    isSelected
                      ? {
                          backgroundColor: item.activeBg,
                          color: item.activeText,
                          borderColor: item.activeBorder,
                          fontWeight: 600,
                        }
                      : {
                          backgroundColor: 'transparent',
                          color: '#bae6fde6',
                          borderColor: 'transparent',
                        }
                  }
                >
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: item.dotColor, boxShadow: `0 0 4px ${item.dotColor}` }}
                    />
                    <span>{item.label}</span>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: item.activeText }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
