'use client';

import React, { useState } from 'react';
import { ServiceRequest } from '../../types';
import { COMPANY_SERVICES } from '../../data/mockData';
import { X, Plus, CheckCircle2 } from 'lucide-react';
import { Spinner } from '../ui/loading';
import { CustomSelect } from '../ui/CustomSelect';

interface SimulateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitNewRequest: (
    req: Omit<ServiceRequest, 'id' | 'createdAt' | 'status' | 'priority'>
  ) => void | Promise<void>;
}

const labelStyle: React.CSSProperties = {
  color: 'var(--crm-text-primary, #1C1917)',
};

const fieldStyle: React.CSSProperties = {
  backgroundColor: '#FAF9F6',
  borderColor: '#E7E5E4',
  color: 'var(--crm-text-primary, #1C1917)',
};

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serviceOptions = COMPANY_SERVICES.map((s) => ({ value: s, label: s }));

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || isSubmitting) {
      return;
    }

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Client';
    const lastName = nameParts.slice(1).join(' ') || '';

    setIsSubmitting(true);
    try {
      await onSubmitNewRequest({
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
        setName('');
        setEmail('');
        setPhone('');
        setRequestText('');
        setService(COMPANY_SERVICES[0]);
        onClose();
      }, 1600);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      style={{ backgroundColor: '#1C191755' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border bg-white my-auto"
        style={{ borderColor: '#E7E5E4' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between gap-3 border-b px-5 py-4"
          style={{ borderColor: '#E7E5E4' }}
        >
          <div>
            <h3 className="text-base font-semibold tracking-tight" style={labelStyle}>
              Create lead
            </h3>
            <p className="mt-0.5 text-sm" style={{ color: '#78716C' }}>
              Add a production inquiry to the CRM pipeline.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 transition-colors hover:bg-[#F5F5F4] cursor-pointer"
            style={{ color: '#78716C' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}
            >
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold" style={labelStyle}>
              Lead created
            </h4>
            <p className="max-w-xs text-sm" style={{ color: '#78716C' }}>
              The inquiry is now in your pipeline and dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={labelStyle}>
                Service <span style={{ color: '#E02126' }}>*</span>
              </label>
              <CustomSelect
                value={service}
                options={serviceOptions}
                onChange={setService}
                ariaLabel="Select service"
                align="left"
                size="field"
                disabled={isSubmitting}
                className="w-full"
                minWidth={200}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-sm font-medium" style={labelStyle}>
                  Name <span style={{ color: '#E02126' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none"
                  style={fieldStyle}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium" style={labelStyle}>
                  Email <span style={{ color: '#E02126' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none"
                  style={fieldStyle}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium" style={labelStyle}>
                  Phone
                </label>
                <input
                  type="tel"
                  placeholder="+971 …"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none"
                  style={fieldStyle}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={labelStyle}>
                Notes
              </label>
              <textarea
                rows={3}
                placeholder="Optional message or context…"
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                className="w-full rounded-xl border px-3 py-2.5 text-sm leading-relaxed focus:outline-none resize-none"
                style={fieldStyle}
              />
            </div>

            <div
              className="flex items-center justify-end gap-2 border-t pt-4"
              style={{ borderColor: '#E7E5E4' }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors hover:bg-[#F5F5F4] disabled:opacity-50"
                style={{
                  borderColor: '#E7E5E4',
                  color: '#57534E',
                  backgroundColor: '#FFFFFF',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#E02126' }}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="xs" color="#FFFFFF" />
                    <span>Creating…</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create lead</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
