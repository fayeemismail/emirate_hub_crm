'use client';

import React, { useState } from 'react';
import { ServiceRequest } from '../../types';
import { COMPANY_SERVICES } from '../../data/mockData';
import { X, Send, CheckCircle2, Globe, ShieldCheck } from 'lucide-react';

interface SimulateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitNewRequest: (req: Omit<ServiceRequest, 'id' | 'createdAt' | 'status' | 'priority'>) => void;
}

export const SimulateFormModal: React.FC<SimulateFormModalProps> = ({
  isOpen,
  onClose,
  onSubmitNewRequest,
}) => {
  const [service, setService] = useState(COMPANY_SERVICES[0]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [requestText, setRequestText] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      return;
    }

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Client';
    const lastName = nameParts.slice(1).join(' ') || '';

    onSubmitNewRequest({
      firstName,
      lastName,
      email: email.trim(),
      phone: phone.trim() ? phone.trim() : undefined,
      service,
      message: requestText.trim() || 'Service request submitted',
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      // Reset form
      setService(COMPANY_SERVICES[0]);
      setName('');
      setEmail('');
      setPhone('');
      setRequestText('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div 
        className="formal-card rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-linear-to-r from-slate-900 via-[#1e293b] to-[#0f172a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg formal-gradient-bg flex items-center justify-center text-white shadow-md font-bold text-xs shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-sky-400 tracking-wider uppercase block">
                Foundex Website Form Simulator
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white">
                Submit Customer Service Request
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mx-auto border border-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Request Submitted Successfully!</h4>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Your inquiry has been routed to Foundex Admin Portal. The dashboard graph and Jira-style Kanban board have been updated in real time.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-sky-400" />
              <span>Simulates visitor filling out the contact form on website.</span>
            </div>

            {/* 1. Service */}
            <div>
              <label className="block text-slate-200 font-bold mb-1">
                Service <span className="text-sky-400">*</span>
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                {COMPANY_SERVICES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* 2. Name */}
            <div>
              <label className="block text-slate-200 font-bold mb-1">
                Name <span className="text-sky-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Full Name (e.g. Sarah Jenkins)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* 3. Email Address */}
            <div>
              <label className="block text-slate-200 font-bold mb-1">
                Email Address <span className="text-sky-400">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="sarah@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* 4. Phone (Optional) */}
            <div>
              <label className="text-slate-200 font-bold mb-1 flex items-center justify-between">
                <span>Phone</span>
                <span className="text-[10px] text-slate-400 font-normal italic">(Optional)</span>
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 019-2831"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* 5. Request (Optional) */}
            <div>
              <label className="text-slate-200 font-bold mb-1 flex items-center justify-between">
                <span>Request</span>
                <span className="text-[10px] text-slate-400 font-normal italic">(Optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Describe your request or leave notes (optional)..."
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 leading-relaxed"
              />
            </div>

            {/* Form Footer Buttons */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl formal-gradient-bg text-white font-bold shadow-md shadow-sky-900/30 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Form Request</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
