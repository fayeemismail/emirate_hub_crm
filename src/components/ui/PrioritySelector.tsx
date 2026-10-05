'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
    dotColor: '#E02126',
    activeBg: '#FEE2E2',
    activeText: '#78716C',
    activeBorder: '#FECACA',
  },
];

type MenuPos = {
  top: number;
  left: number;
  openUp: boolean;
};

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({
  priority,
  onChange,
  size = 'sm',
  align = 'left',
  className = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeConfig = PRIORITIES.find((p) => p.id === priority) || PRIORITIES[1];

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const menuWidth = 160;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < 200 && rect.top > spaceBelow;
    let left = align === 'right' ? rect.right - menuWidth : rect.left;
    left = Math.min(Math.max(8, left), window.innerWidth - menuWidth - 8);
    setMenuPos({
      top: openUp ? rect.top - 6 : rect.bottom + 6,
      left,
      openUp,
    });
  };

  useLayoutEffect(() => {
    if (!isOpen) {
      setMenuPos(null);
      return;
    }
    updatePosition();
    const onReposition = () => updatePosition();
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, align]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (containerRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
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
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (e: React.MouseEvent, pId: RequestPriority) => {
    e.stopPropagation();
    if (pId !== priority) onChange(pId);
    setIsOpen(false);
  };

  const sizeClasses =
    size === 'sm' ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs';

  const menu =
    mounted &&
    isOpen &&
    menuPos &&
    createPortal(
      <div
        ref={menuRef}
        role="menu"
        onClick={(e) => e.stopPropagation()}
        className={`crm-popover-enter crm-popover-menu fixed z-[100] min-w-[160px] p-1.5 rounded-xl border shadow-2xl backdrop-blur-xl ${
          menuPos.openUp ? 'crm-popover-up' : ''
        }`}
        style={{
          top: menuPos.openUp ? undefined : menuPos.top,
          bottom: menuPos.openUp
            ? window.innerHeight - menuPos.top
            : undefined,
          left: menuPos.left,
          backgroundColor: '#FFFFFFF5',
          borderColor: '#E7E5E4',
          boxShadow: '0 20px 40px #1C191733',
        }}
      >
        <div
          className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider border-b mb-1"
          style={{
            borderColor: '#E7E5E4',
            color: '#A8A29E',
          }}
        >
          Set Priority
        </div>

        <div className="space-y-0.5">
          {PRIORITIES.map((item, index) => {
            const isSelected = item.id === priority;
            return (
              <div
                key={item.id}
                className="crm-popover-item"
                style={{ ['--crm-item-i' as string]: index } as React.CSSProperties}
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={(e) => handleSelect(e, item.id)}
                  className="crm-interactive w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between gap-2.5 cursor-pointer text-left border"
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
                          color: '#78716C',
                          borderColor: 'transparent',
                        }
                  }
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: item.dotColor,
                        boxShadow: `0 0 4px ${item.dotColor}`,
                      }}
                    />
                    <span>{item.label}</span>
                  </div>

                  {isSelected && (
                    <Check
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: item.activeText }}
                    />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>,
      document.body
    );

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        aria-label={`Change priority from ${priority}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`
          inline-flex items-center gap-1.5 rounded-full font-semibold border crm-interactive cursor-pointer
          focus:outline-none
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
          style={{
            backgroundColor: activeConfig.dotColor,
            boxShadow: `0 0 6px ${activeConfig.dotColor}`,
          }}
        />
        <span>{priority}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 opacity-70 ${
            isOpen ? 'rotate-180 opacity-100' : ''
          }`}
        />
      </button>
      {menu}
    </div>
  );
};
