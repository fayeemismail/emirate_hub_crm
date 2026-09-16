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
      setService(COMPANY_SERVICES[0]);
      setName('');
      setEmail('');
      setPhone('');
      setRequestText('');
      onClose();
    }, 1800);
  };

  return (
    <div 
      className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      style={{ backgroundColor: '#020617cc' }}
    >
      <div 
        className="rounded-2xl w-full max-w-lg border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto"
        style={{
          backgroundColor: '#0d284ce6',
          borderColor: '#93c5fd4d',
          boxShadow: '0 25px 50px #020617cc',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div 
          className="p-4 sm:p-5 border-b flex items-center justify-between"
          style={{
            background: 'linear-gradient(90deg, #061834 0%, #09254c 50%, #0c3162 100%)',
            borderColor: '#93c5fd33',
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md font-bold text-xs shrink-0 border"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
                borderColor: '#93c5fd4d',
              }}
            >
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase block" style={{ color: '#38bdf8' }}>
                Emirate Hub Website Form Simulator
              </span>
              <h3 className="text-xs sm:text-sm font-bold" style={{ color: '#ffffff' }}>
                Submit Customer Service Request
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg transition-colors shrink-0 hover:bg-[#38bdf833]"
            style={{ color: '#bae6fd' }}
          >
            <X className="w-4 h-4 hover:text-white" />
          </button>
        </div>

        {/* Content Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center font-bold mx-auto border animate-bounce"
              style={{
                backgroundColor: '#10b98133',
                color: '#34d399',
                borderColor: '#34d39966',
              }}
            >
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold" style={{ color: '#ffffff' }}>Request Submitted Successfully!</h4>
            <p className="text-xs max-w-xs mx-auto" style={{ color: '#bae6fdcc' }}>
              Your inquiry has been routed to Emirate Hub Admin Portal. The dashboard graph and Jira-style Kanban board have been updated in real time.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 text-xs max-h-[80vh] overflow-y-auto">
            <div 
              className="p-3 rounded-xl border font-medium flex items-center gap-2"
              style={{
                backgroundColor: '#0284c726',
                borderColor: '#38bdf84d',
                color: '#7dd3fc',
              }}
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#38bdf8]" />
              <span>Simulates visitor filling out the contact form on website.</span>
            </div>

            {/* 1. Service */}
            <div>
              <label className="block font-bold mb-1" style={{ color: '#e0f2fe' }}>
                Service <span style={{ color: '#38bdf8' }}>*</span>
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:outline-none cursor-pointer"
                style={{
                  backgroundColor: '#061834',
                  borderColor: '#93c5fd4d',
                  color: '#ffffff',
                }}
              >
                {COMPANY_SERVICES.map((s) => (
                  <option key={s} value={s} style={{ backgroundColor: '#061834', color: '#ffffff' }}>{s}</option>
                ))}
              </select>
            </div>

            {/* 2. Name */}
            <div>
              <label className="block font-bold mb-1" style={{ color: '#e0f2fe' }}>
                Name <span style={{ color: '#38bdf8' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Full Name (e.g. Sarah Jenkins)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:outline-none"
                style={{
                  backgroundColor: '#061834',
                  borderColor: '#93c5fd4d',
                  color: '#ffffff',
                }}
              />
            </div>

            {/* 3. Email Address */}
            <div>
              <label className="block font-bold mb-1" style={{ color: '#e0f2fe' }}>
                Email Address <span style={{ color: '#38bdf8' }}>*</span>
              </label>
              <input
                type="email"
                required
                placeholder="sarah@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:outline-none"
                style={{
                  backgroundColor: '#061834',
                  borderColor: '#93c5fd4d',
                  color: '#ffffff',
                }}
              />
            </div>

            {/* 4. Phone (Optional) */}
            <div>
              <label className="font-bold mb-1 flex items-center justify-between" style={{ color: '#e0f2fe' }}>
                <span>Phone</span>
                <span className="text-[10px] font-normal italic" style={{ color: '#bae6fd99' }}>(Optional)</span>
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 019-2831"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl focus:outline-none"
                style={{
                  backgroundColor: '#061834',
                  borderColor: '#93c5fd4d',
                  color: '#ffffff',
                }}
              />
            </div>

            {/* 5. Request (Optional) */}
            <div>
              <label className="font-bold mb-1 flex items-center justify-between" style={{ color: '#e0f2fe' }}>
                <span>Request</span>
                <span className="text-[10px] font-normal italic" style={{ color: '#bae6fd99' }}>(Optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder="Describe your request or leave notes (optional)..."
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                className="w-full p-3 border rounded-xl focus:outline-none leading-relaxed"
                style={{
                  backgroundColor: '#061834',
                  borderColor: '#93c5fd4d',
                  color: '#ffffff',
                }}
              />
            </div>

            {/* Form Footer Buttons */}
            <div 
              className="pt-3 border-t flex items-center justify-end gap-2"
              style={{ borderColor: '#93c5fd33' }}
            >
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl font-medium transition-colors border cursor-pointer hover:bg-[#38bdf826]"
                style={{
                  backgroundColor: '#081d3980',
                  borderColor: '#93c5fd33',
                  color: '#bae6fd',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-white font-bold shadow-md flex items-center gap-1.5 border cursor-pointer"
                style={{
                  background: 'linear-gradient(90deg, #2563eb 0%, #0284c7 100%)',
                  borderColor: '#60a5fa66',
                  boxShadow: '0 4px 14px #1e3a8a80',
                }}
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
