'use client';

import React, { useEffect } from 'react';
import { Trash2, ArrowUpDown, Clock, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
}) => {
  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: Trash2,
          iconBg: '#f43f5e26',
          iconColor: '#fca5a5',
          iconBorder: '#fb71854d',
          btnBg: '#e11d48',
          btnText: '#ffffff',
          accentBorder: '#fb718566',
        };
      case 'info':
        return {
          icon: Clock,
          iconBg: '#0284c726',
          iconColor: '#38bdf8',
          iconBorder: '#38bdf84d',
          btnBg: '#0284c7',
          btnText: '#ffffff',
          accentBorder: '#38bdf866',
        };
      case 'warning':
      default:
        return {
          icon: ArrowUpDown,
          iconBg: '#f59e0b26',
          iconColor: '#fcd34d',
          iconBorder: '#fbbf244d',
          btnBg: '#d97706',
          btnText: '#ffffff',
          accentBorder: '#fbbf2466',
        };
    }
  };

  const config = getVariantStyles();
  const Icon = config.icon;

  return (
    <div 
      className="fixed inset-0 z-[70] backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      style={{ backgroundColor: '#020617cc' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl w-full max-w-md border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-auto text-left backdrop-blur-xl"
        style={{
          backgroundColor: '#0d284cf5',
          borderColor: config.accentBorder,
          boxShadow: '0 25px 50px #020617cc',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div 
          className="p-4 sm:p-5 border-b flex items-start justify-between gap-3"
          style={{
            borderColor: '#93c5fd33',
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-sm"
              style={{
                backgroundColor: config.iconBg,
                color: config.iconColor,
                borderColor: config.iconBorder,
              }}
            >
              <Icon className="w-5 h-5" style={{ color: config.iconColor }} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: '#7dd3fc' }}>
                Confirmation Required
              </span>
              <h3 className="text-sm sm:text-base font-bold tracking-tight" style={{ color: '#ffffff' }}>
                {title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close alert"
            className="p-1 rounded-lg transition-colors shrink-0 cursor-pointer hover:bg-[#38bdf833]"
            style={{ color: '#bae6fd' }}
          >
            <X className="w-4 h-4 hover:text-white" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 text-xs leading-relaxed font-sans" style={{ color: '#bae6fde6' }}>
          {message}
        </div>

        {/* Modal Actions */}
        <div 
          className="p-3.5 sm:p-4 border-t flex items-center justify-end gap-2.5"
          style={{
            borderColor: '#93c5fd33',
            backgroundColor: '#081e3a80',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border hover:bg-[#38bdf826]"
            style={{
              backgroundColor: '#081d3980',
              borderColor: '#93c5fd33',
              color: '#bae6fd',
            }}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
            style={{
              backgroundColor: config.btnBg,
              color: config.btnText,
              boxShadow: '0 4px 12px #02061780',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
