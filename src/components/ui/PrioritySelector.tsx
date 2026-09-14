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
  ringColor: string;
  activeBg: string;
  activeText: string;
  activeBorder: string;
}[] = [
  {
    id: 'High',
    label: 'High Priority',
    dotColor: 'bg-rose-500',
    ringColor: 'ring-rose-500/30',
    activeBg: 'bg-rose-500/15',
    activeText: 'text-rose-300',
    activeBorder: 'border-rose-500/30',
  },
  {
    id: 'Medium',
    label: 'Medium Priority',
    dotColor: 'bg-amber-500',
    ringColor: 'ring-amber-500/30',
    activeBg: 'bg-amber-500/15',
    activeText: 'text-amber-300',
    activeBorder: 'border-amber-500/30',
  },
  {
    id: 'Low',
    label: 'Low Priority',
    dotColor: 'bg-sky-500',
    ringColor: 'ring-sky-500/30',
    activeBg: 'bg-sky-500/15',
    activeText: 'text-sky-300',
    activeBorder: 'border-sky-500/30',
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
          ${activeConfig.activeBg} ${activeConfig.activeText} ${activeConfig.activeBorder}
          hover:brightness-125 focus:outline-none focus:ring-2 focus:ring-sky-500/30 active:scale-95
          ${sizeClasses}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${activeConfig.dotColor} shadow-[0_0_6px_currentColor] shrink-0`} />
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
            absolute top-full mt-1.5 z-50 min-w-[155px] p-1.5 rounded-xl
            bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/80
            animate-in fade-in zoom-in-95 duration-150 origin-top
            ${align === 'right' ? 'right-0' : 'left-0'}
          `}
        >
          <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5 mb-1">
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
                  className={`
                    w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between gap-2.5 transition-all cursor-pointer text-left
                    ${isSelected 
                      ? `${item.activeBg} ${item.activeText} font-semibold shadow-inner` 
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.dotColor} ring-2 ${item.ringColor}`} />
                    <span>{item.label}</span>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-current shrink-0" />
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
