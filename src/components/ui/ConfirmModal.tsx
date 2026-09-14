'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, ArrowUpDown, Clock, X } from 'lucide-react';

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
          iconBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]',
          btnBg: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-950/50',
          accentBorder: 'border-rose-500/30',
        };
      case 'info':
        return {
          icon: Clock,
          iconBg: 'bg-sky-500/15 text-sky-400 border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.2)]',
          btnBg: 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-950/50',
          accentBorder: 'border-sky-500/30',
        };
      case 'warning':
      default:
        return {
          icon: ArrowUpDown,
          iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
          btnBg: 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-950/50',
          accentBorder: 'border-amber-500/30',
        };
    }
  };

  const config = getVariantStyles();
  const Icon = config.icon;

  return (
    <div 
      className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className={`
          formal-card rounded-2xl w-full max-w-md border ${config.accentBorder} shadow-2xl shadow-black/80
          overflow-hidden animate-in zoom-in-95 duration-150 my-auto bg-[#0f172a] text-left
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${config.iconBg}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Confirmation Required
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                {title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close alert"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 text-xs text-slate-300 leading-relaxed font-sans">
          {message}
        </div>

        {/* Modal Actions */}
        <div className="p-3.5 sm:p-4 border-t border-white/10 bg-slate-900/60 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${config.btnBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
