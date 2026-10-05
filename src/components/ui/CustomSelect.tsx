'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';

export interface CustomSelectOption<T extends string = string> {
  value: T;
  label: string;
}

interface CustomSelectProps<T extends string = string> {
  value: T;
  options: CustomSelectOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
  align?: 'left' | 'right';
  minWidth?: number;
  /** `field` matches form inputs (taller, full-width friendly). */
  size?: 'sm' | 'field';
}

type MenuPos = {
  top: number;
  left: number;
  width: number;
  openUp: boolean;
};

export function CustomSelect<T extends string = string>({
  value,
  options,
  onChange,
  ariaLabel,
  disabled = false,
  className = '',
  align = 'right',
  minWidth = 140,
  size = 'sm',
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value) ?? options[0];
  const isField = size === 'field';

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const menuWidth = Math.max(rect.width, minWidth, 160);
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < 220 && rect.top > spaceBelow;
    let left =
      align === 'right' ? rect.right - menuWidth : rect.left;
    left = Math.min(Math.max(8, left), window.innerWidth - menuWidth - 8);
    setMenuPos({
      top: openUp ? rect.top - 6 : rect.bottom + 6,
      left,
      width: menuWidth,
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
  }, [isOpen, align, minWidth]);

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

  const menu =
    mounted &&
    isOpen &&
    menuPos &&
    createPortal(
      <ul
        ref={menuRef}
        role="listbox"
        aria-label={ariaLabel}
        className={`crm-popover-enter crm-popover-menu fixed z-[100] max-h-56 overflow-auto rounded-xl border py-1 shadow-lg ${
          menuPos.openUp ? 'crm-popover-up' : ''
        }`}
        style={{
          top: menuPos.openUp ? undefined : menuPos.top,
          bottom: menuPos.openUp
            ? window.innerHeight - menuPos.top
            : undefined,
          left: menuPos.left,
          width: menuPos.width,
          backgroundColor: 'var(--crm-card-bg, #FFFFFF)',
          borderColor: 'var(--crm-card-border, #E7E5E4)',
          boxShadow: '0 12px 28px rgba(28, 25, 23, 0.12)',
        }}
      >
        {options.map((option, index) => {
          const active = option.value === value;
          return (
            <li
              key={option.value}
              role="option"
              aria-selected={active}
              className="crm-popover-item"
              style={{ ['--crm-item-i' as string]: index } as React.CSSProperties}
            >
              <button
                type="button"
                onClick={() => {
                  if (option.value !== value) onChange(option.value);
                  setIsOpen(false);
                }}
                className="crm-interactive flex w-full items-center gap-2 px-3 py-2 text-left text-sm cursor-pointer"
                style={{
                  color: active
                    ? 'var(--crm-accent-primary, #E02126)'
                    : 'var(--crm-text-primary, #1C1917)',
                  backgroundColor: active ? '#FEE2E2' : 'transparent',
                  fontWeight: active ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.backgroundColor = '#F5F5F4';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = active
                    ? '#FEE2E2'
                    : 'transparent';
                }}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {active && (
                  <Check
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: 'var(--crm-accent-primary, #E02126)' }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>,
      document.body
    );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        className={`inline-flex items-center gap-2 border text-sm font-medium crm-interactive cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          isField ? 'w-full rounded-xl px-3 py-2.5' : 'rounded-lg px-3 py-1.5'
        }`}
        style={{
          minWidth,
          borderColor: isOpen
            ? 'var(--crm-accent-primary, #E02126)'
            : 'var(--crm-card-border, #E7E5E4)',
          color: 'var(--crm-text-primary, #1C1917)',
          backgroundColor: isField ? '#FAF9F6' : 'var(--crm-card-bg, #FFFFFF)',
        }}
      >
        <span className="truncate flex-1 text-left">{selected?.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          style={{ color: '#A8A29E' }}
        />
      </button>
      {menu}
    </div>
  );
}
