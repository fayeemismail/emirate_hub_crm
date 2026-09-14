'use client';

import React, { useState } from 'react';
import { ServiceRequest, RequestStatus, RequestPriority } from '../../types';
import { ConfirmModal } from '../ui/ConfirmModal';
import { 
  X, 
  Mail, 
  Phone, 
  PhoneOff, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  Send,
  Building,
  User,
  Copy,
  Check,
  Trash2
} from 'lucide-react';

interface RequestDetailModalProps {
  request: ServiceRequest | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: RequestStatus) => void;
  onUpdatePriority?: (id: string, newPriority: RequestPriority) => void;
  onDeleteRequest?: (id: string) => void;
  onAddNote?: (id: string, note: string) => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  request,
  onClose,
  onUpdateStatus,
  onUpdatePriority,
  onDeleteRequest,
}) => {
  const [copied, setCopied] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySent, setReplySent] = useState(false);

  // Confirmation Alert Dialog state
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    variant: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    variant: 'warning',
    onConfirm: () => {},
  });

  if (!request) return null;

  const displayName = request.name || `${request.firstName} ${request.lastName}`.trim() || 'Client';
  const initials = displayName
    .split(/\s+/)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'L';

  const handleStatusChangeRequest = (newStatus: RequestStatus) => {
    if (newStatus === request.status) return;
    setConfirmAction({
      isOpen: true,
      title: 'Change Review Status',
      message: `Are you sure you want to change the review status of this inquiry from "${request.status}" to "${newStatus}"?`,
      confirmText: `Update to ${newStatus}`,
      variant: 'info',
      onConfirm: () => {
        onUpdateStatus(request.id, newStatus);
      },
    });
  };

  const handlePriorityChangeRequest = (newPriority: RequestPriority) => {
    if (newPriority === request.priority) return;
    setConfirmAction({
      isOpen: true,
      title: 'Change Inquiry Priority',
      message: `Are you sure you want to change priority for "${displayName}" from "${request.priority}" to "${newPriority}"? Inquiries are automatically re-sorted with High priority on top.`,
      confirmText: `Set as ${newPriority}`,
      variant: newPriority === 'High' ? 'danger' : 'warning',
      onConfirm: () => {
        onUpdatePriority?.(request.id, newPriority);
      },
    });
  };

  const handleDeleteChangeRequest = () => {
    setConfirmAction({
      isOpen: true,
      title: 'Soft Delete Inquiry',
      message: `Are you sure you want to soft delete the inquiry from "${displayName}" (${request.service})? This record will be archived and hidden from all active views.`,
      confirmText: 'Yes, Delete',
      variant: 'danger',
      onConfirm: () => {
        onDeleteRequest?.(request.id);
        onClose();
      },
    });
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(request.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplySent(true);
    setTimeout(() => {
      setReplySent(false);
      setReplyText('');
    }, 2500);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div 
          className="formal-card rounded-2xl w-full max-w-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Top Banner */}
          <div className="p-4 sm:p-6 border-b border-white/10 bg-linear-to-r from-slate-900 to-[#0f172a] flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-2xl formal-gradient-bg flex items-center justify-center text-sm sm:text-base font-bold text-white shadow-lg shadow-sky-900/30 shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                    {displayName}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {request.service}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
                    request.priority === 'High' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                    request.priority === 'Medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                    'bg-sky-500/20 text-sky-300 border-sky-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      request.priority === 'High' ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]' :
                      request.priority === 'Medium' ? 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]' :
                      'bg-sky-500 shadow-[0_0_6px_rgba(14,165,233,0.8)]'
                    }`} />
                    {request.priority} Priority
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                  <span className="font-mono">{request.id}</span>
                  <span>•</span>
                  <span>Submitted {new Date(request.createdAt).toLocaleString()}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close details modal"
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Body - Scrollable container */}
          <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Customer Details & Status/Priority Control Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Contact Details Card */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-white/2 border border-white/10 space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  Customer Contact Details
                </h4>

                <div className="space-y-2 text-xs">
                  {/* Email */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-slate-400">Email:</span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-white font-medium truncate">{request.email}</span>
                      <button
                        onClick={handleCopyEmail}
                        title="Copy Email"
                        className="text-slate-400 hover:text-sky-300 p-1 shrink-0 cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Phone (Optional) */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5 gap-2 flex-wrap">
                    <span className="text-slate-400">Phone (Optional):</span>
                    {request.phone ? (
                      <span className="text-sky-300 font-mono font-medium flex items-center gap-1">
                        <Phone className="w-3 h-3 text-sky-400" />
                        {request.phone}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic flex items-center gap-1">
                        <PhoneOff className="w-3 h-3" />
                        Not Provided
                      </span>
                    )}
                  </div>

                  {/* Company Name */}
                  {request.companyName && (
                    <div className="flex items-center justify-between pt-1 border-t border-white/5 gap-2 flex-wrap">
                      <span className="text-slate-400">Company:</span>
                      <span className="text-white font-medium flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-500" />
                        {request.companyName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status & Priority Management Card */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-white/2 border border-white/10 space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Workflow & Priority Control
                </h4>

                <div className="space-y-3">
                  {/* Status Selector */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Status:</label>
                    <select
                      value={request.status}
                      onChange={(e) => handleStatusChangeRequest(e.target.value as RequestStatus)}
                      aria-label="Update Request Status"
                      className="w-full px-3 py-1.5 bg-slate-800 border border-sky-500/30 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-sky-500 cursor-pointer"
                    >
                      <option value="Pending">Pending Review</option>
                      <option value="In Progress">In Progress (Assigned)</option>
                      <option value="Resolved">Resolved & Closed</option>
                    </select>
                  </div>

                  {/* Sleek Segmented Priority Selector */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5 flex items-center justify-between">
                      <span className="font-medium text-slate-300">Admin Priority:</span>
                      <span className="text-[10px] text-sky-400 font-mono">High sorts on top</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-white/10">
                      {(['High', 'Medium', 'Low'] as const).map((p) => {
                        const isSelected = request.priority === p;
                        const styles = {
                          High: isSelected
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.25)] ring-1 ring-rose-500/30'
                            : 'text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border-transparent',
                          Medium: isSelected
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/30'
                            : 'text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 border-transparent',
                          Low: isSelected
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-[0_0_12px_rgba(14,165,233,0.25)] ring-1 ring-sky-500/30'
                            : 'text-slate-400 hover:text-sky-300 hover:bg-sky-500/10 border-transparent',
                        }[p];

                        const dotColors = {
                          High: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
                          Medium: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
                          Low: 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]',
                        }[p];

                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handlePriorityChangeRequest(p)}
                            className={`
                              px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all duration-150 cursor-pointer
                              ${styles}
                            `}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${dotColors}`} />
                            <span>{p}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Full User Request Message */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                Request / Message (Optional)
              </h4>
              <div className="p-3.5 sm:p-4 rounded-xl bg-white/3 border border-white/10 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans shadow-inner">
                {request.message ? `"${request.message}"` : <span className="text-slate-500 italic">No message provided</span>}
              </div>
            </div>

            {/* Quick Email Reply Composer */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/2 border border-white/10 space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Send Direct Response to {displayName}
              </h4>

              {replySent ? (
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Response sent successfully to {request.email}!
                </div>
              ) : (
                <form onSubmit={handleSendReply} className="space-y-2">
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Write a reply to ${request.email}...`}
                    className="w-full p-3 bg-slate-800/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-3.5 py-2 rounded-xl formal-gradient-bg text-white text-xs font-medium hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply Email</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Modal Footer with Soft Delete Option */}
          <div className="p-3.5 sm:p-4 border-t border-white/10 bg-[#0f172a] flex items-center justify-between text-xs text-slate-400">
            <button
              type="button"
              onClick={handleDeleteChangeRequest}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/40"
              title="Soft delete lead (removes from active listings)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Inquiry</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline">Emirate Hub Advisory</span>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Alert Dialog */}
      <ConfirmModal
        isOpen={confirmAction.isOpen}
        onClose={() => setConfirmAction(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmAction.onConfirm}
        title={confirmAction.title}
        message={confirmAction.message}
        confirmText={confirmAction.confirmText}
        variant={confirmAction.variant}
      />
    </>
  );
};
