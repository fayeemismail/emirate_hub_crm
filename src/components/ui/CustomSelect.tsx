'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value) ?? options[0];
  const isField = size === 'field';

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
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

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        className={`inline-flex items-center gap-2 border text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          isField
            ? 'w-full rounded-xl px-3 py-2.5'
            : 'rounded-lg px-3 py-1.5'
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
          className={`h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: '#A8A29E' }}
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className={`absolute z-50 mt-1.5 max-h-56 overflow-auto rounded-xl border py-1 shadow-lg ${
            isField ? 'w-full left-0' : align === 'right' ? 'right-0' : 'left-0'
          }`}
          style={{
            minWidth: Math.max(minWidth, 160),
            backgroundColor: 'var(--crm-card-bg, #FFFFFF)',
            borderColor: 'var(--crm-card-border, #E7E5E4)',
            boxShadow: '0 12px 28px rgba(28, 25, 23, 0.12)',
          }}
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    if (option.value !== value) onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors cursor-pointer"
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
                    e.currentTarget.style.backgroundColor = active ? '#FEE2E2' : 'transparent';
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
        </ul>
      )}
    </div>
  );
}
