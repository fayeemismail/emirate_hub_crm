'use client';

import React, { useState } from 'react';
import { ServiceRequest, RequestStatus, RequestPriority } from '../../types';
import { ConfirmModal } from '../ui/ConfirmModal';
import { 
  X, 
  Phone, 
  PhoneOff, 
  CheckCircle2, 
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
      <div 
        className="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
        style={{ backgroundColor: '#020617cc' }}
      >
        <div 
          className="rounded-2xl w-full max-w-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto"
          style={{
            backgroundColor: '#0d284ce6',
            borderColor: '#93c5fd4d',
            boxShadow: '0 25px 50px #020617cc',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Top Banner */}
          <div 
            className="p-4 sm:p-6 border-b flex items-start justify-between gap-3"
            style={{
              background: 'linear-gradient(90deg, #061834 0%, #09254c 50%, #0c3162 100%)',
              borderColor: '#93c5fd33',
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 sm:w-12 h-10 sm:h-12 rounded-2xl flex items-center justify-center text-sm sm:text-base font-bold text-white shadow-lg border shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #38bdf8 100%)',
                  borderColor: '#93c5fd4d',
                  boxShadow: '0 4px 14px #1e3a8a80',
                }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold tracking-tight truncate" style={{ color: '#ffffff' }}>
                    {displayName}
                  </h3>
                  <span 
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                    style={{
                      backgroundColor: '#0284c733',
                      borderColor: '#38bdf84d',
                      color: '#bae6fd',
                    }}
                  >
                    {request.service}
                  </span>
                  <span 
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5"
                    style={
                      request.priority === 'High'
                        ? { backgroundColor: '#f43f5e33', color: '#fca5a5', borderColor: '#fb71854d' }
                        : request.priority === 'Medium'
                        ? { backgroundColor: '#f59e0b33', color: '#fcd34d', borderColor: '#fbbf244d' }
                        : { backgroundColor: '#0284c733', color: '#bae6fd', borderColor: '#38bdf84d' }
                    }
                  >
                    <span 
                      className="w-1.5 h-1.5 rounded-full" 
                      style={{ 
                        backgroundColor: request.priority === 'High' ? '#f43f5e' : request.priority === 'Medium' ? '#f59e0b' : '#38bdf8',
                        boxShadow: `0 0 6px ${request.priority === 'High' ? '#f43f5e' : request.priority === 'Medium' ? '#f59e0b' : '#38bdf8'}` 
                      }} 
                    />
                    {request.priority} Priority
                  </span>
                </div>
                <p className="text-xs mt-0.5 flex items-center gap-2 flex-wrap" style={{ color: '#bae6fdcc' }}>
                  <span className="font-mono" style={{ color: '#7dd3fc' }}>{request.id}</span>
                  <span>•</span>
                  <span>Submitted {new Date(request.createdAt).toLocaleString()}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close details modal"
              className="p-1.5 rounded-xl transition-colors shrink-0 cursor-pointer hover:bg-[#38bdf833]"
              style={{ color: '#7dd3fc' }}
            >
              <X className="w-5 h-5 hover:text-white" />
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Customer Details & Status/Priority Control Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Contact Details Card */}
              <div 
                className="p-3.5 sm:p-4 rounded-xl border space-y-3"
                style={{
                  backgroundColor: '#061834cc',
                  borderColor: '#93c5fd33',
                }}
              >
                <h4 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: '#7dd3fc' }}>
                  <User className="w-3.5 h-3.5" style={{ color: '#38bdf8' }} />
                  Customer Contact Details
                </h4>

                <div className="space-y-2 text-xs">
                  {/* Email */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span style={{ color: '#bae6fdcc' }}>Email:</span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-medium truncate" style={{ color: '#ffffff' }}>{request.email}</span>
                      <button
                        onClick={handleCopyEmail}
                        title="Copy Email"
                        className="p-1 shrink-0 cursor-pointer hover:text-white"
                        style={{ color: '#7dd3fc' }}
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-[#34d399]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Phone */}
                  <div 
                    className="flex items-center justify-between pt-1 border-t gap-2 flex-wrap"
                    style={{ borderColor: '#93c5fd26' }}
                  >
                    <span style={{ color: '#bae6fdcc' }}>Phone (Optional):</span>
                    {request.phone ? (
                      <span className="font-mono font-medium flex items-center gap-1" style={{ color: '#7dd3fc' }}>
                        <Phone className="w-3.5 h-3.5" style={{ color: '#38bdf8' }} />
                        {request.phone}
                      </span>
                    ) : (
                      <span className="italic flex items-center gap-1" style={{ color: '#93c5fd80' }}>
                        <PhoneOff className="w-3.5 h-3.5" />
                        Not Provided
                      </span>
                    )}
                  </div>

                  {/* Company Name */}
                  {request.companyName && (
                    <div 
                      className="flex items-center justify-between pt-1 border-t gap-2 flex-wrap"
                      style={{ borderColor: '#93c5fd26' }}
                    >
                      <span style={{ color: '#bae6fdcc' }}>Company:</span>
                      <span className="font-medium flex items-center gap-1" style={{ color: '#ffffff' }}>
                        <Building className="w-3.5 h-3.5" style={{ color: '#38bdf8' }} />
                        {request.companyName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status & Priority Management Card */}
              <div 
                className="p-3.5 sm:p-4 rounded-xl border space-y-3"
                style={{
                  backgroundColor: '#061834cc',
                  borderColor: '#93c5fd33',
                }}
              >
                <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#7dd3fc' }}>
                  Workflow & Priority Control
                </h4>

                <div className="space-y-3">
                  {/* Status Selector */}
                  <div>
                    <label className="text-xs block mb-1" style={{ color: '#bae6fdcc' }}>Status:</label>
                    <select
                      value={request.status}
                      onChange={(e) => handleStatusChangeRequest(e.target.value as RequestStatus)}
                      aria-label="Update Request Status"
                      className="w-full px-3 py-1.5 border rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
                      style={{
                        backgroundColor: '#081e3a',
                        borderColor: '#93c5fd4d',
                        color: '#ffffff',
                      }}
                    >
                      <option value="Pending" style={{ backgroundColor: '#081e3a', color: '#ffffff' }}>Pending Review</option>
                      <option value="In Progress" style={{ backgroundColor: '#081e3a', color: '#ffffff' }}>In Progress (Assigned)</option>
                      <option value="Resolved" style={{ backgroundColor: '#081e3a', color: '#ffffff' }}>Resolved & Closed</option>
                    </select>
                  </div>

                  {/* Sleek Segmented Priority Selector */}
                  <div>
                    <label className="text-xs mb-1.5 flex items-center justify-between">
                      <span className="font-medium" style={{ color: '#bae6fd' }}>Admin Priority:</span>
                      <span className="text-[10px] font-mono" style={{ color: '#7dd3fc' }}>High sorts on top</span>
                    </label>
                    <div 
                      className="grid grid-cols-3 gap-1.5 p-1 rounded-xl border"
                      style={{
                        backgroundColor: '#07162c',
                        borderColor: '#93c5fd40',
                      }}
                    >
                      {(['High', 'Medium', 'Low'] as const).map((p) => {
                        const isSelected = request.priority === p;
                        const btnStyles = {
                          High: isSelected
                            ? { backgroundColor: '#f43f5e33', color: '#fca5a5', borderColor: '#fb718580' }
                            : { backgroundColor: 'transparent', color: '#93c5fdb3', borderColor: 'transparent' },
                          Medium: isSelected
                            ? { backgroundColor: '#f59e0b33', color: '#fcd34d', borderColor: '#fbbf2480' }
                            : { backgroundColor: 'transparent', color: '#93c5fdb3', borderColor: 'transparent' },
                          Low: isSelected
                            ? { backgroundColor: '#0284c740', color: '#e0f2fe', borderColor: '#38bdf880' }
                            : { backgroundColor: 'transparent', color: '#93c5fdb3', borderColor: 'transparent' },
                        }[p];

                        const dotColors = {
                          High: '#f43f5e',
                          Medium: '#f59e0b',
                          Low: '#38bdf8',
                        }[p];

                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handlePriorityChangeRequest(p)}
                            className="px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all duration-150 cursor-pointer"
                            style={btnStyles}
                          >
                            <span 
                              className="w-1.5 h-1.5 rounded-full" 
                              style={{ backgroundColor: dotColors, boxShadow: `0 0 6px ${dotColors}` }} 
                            />
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
              <h4 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: '#7dd3fc' }}>
                <MessageSquare className="w-3.5 h-3.5" style={{ color: '#38bdf8' }} />
                Request / Message (Optional)
              </h4>
              <div 
                className="p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm leading-relaxed font-sans shadow-inner"
                style={{
                  backgroundColor: '#061834',
                  borderColor: '#93c5fd33',
                  color: '#e0f2fee6',
                }}
              >
                {request.message ? `"${request.message}"` : <span className="italic" style={{ color: '#93c5fd80' }}>No message provided</span>}
              </div>
            </div>

            {/* Quick Email Reply Composer */}
            <div 
              className="p-3.5 sm:p-4 rounded-xl border space-y-3"
              style={{
                backgroundColor: '#061834cc',
                borderColor: '#93c5fd33',
              }}
            >
              <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#7dd3fc' }}>
                Send Direct Response to {displayName}
              </h4>

              {replySent ? (
                <div 
                  className="p-3 rounded-xl text-xs font-medium border flex items-center gap-2"
                  style={{
                    backgroundColor: '#10b98133',
                    color: '#6ee7b7',
                    borderColor: '#34d3994d',
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#34d399]" />
                  Response sent successfully to {request.email}!
                </div>
              ) : (
                <form onSubmit={handleSendReply} className="space-y-2">
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Write a reply to ${request.email}...`}
                    className="w-full p-3 border rounded-xl text-xs focus:outline-none"
                    style={{
                      backgroundColor: '#081e3a',
                      borderColor: '#93c5fd4d',
                      color: '#ffffff',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-3.5 py-2 rounded-xl text-white text-xs font-medium disabled:opacity-50 transition-all flex items-center gap-1.5 ml-auto cursor-pointer shadow-md border"
                    style={{
                      backgroundColor: '#2563eb',
                      borderColor: '#60a5fa66',
                      boxShadow: '0 4px 12px #02061780',
                    }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply Email</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Modal Footer with Soft Delete Option */}
          <div 
            className="p-3.5 sm:p-4 border-t flex items-center justify-between text-xs"
            style={{
              backgroundColor: '#061834',
              borderColor: '#93c5fd33',
              color: '#bae6fdcc',
            }}
          >
            <button
              type="button"
              onClick={handleDeleteChangeRequest}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border hover:bg-[#f43f5e33]"
              style={{
                backgroundColor: '#f43f5e1a',
                color: '#fca5a5',
                borderColor: '#fb718533',
              }}
              title="Soft delete lead (removes from active listings)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Inquiry</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline font-medium" style={{ color: '#7dd3fcb3' }}>Emirate Hub Advisory</span>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border font-medium transition-colors cursor-pointer hover:bg-[#0284c733]"
                style={{
                  backgroundColor: '#081d3980',
                  borderColor: '#93c5fd40',
                  color: '#e0f2fe',
                }}
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
