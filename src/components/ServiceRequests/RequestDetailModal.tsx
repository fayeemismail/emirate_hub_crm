'use client';

import React, { useState } from 'react';
import { ServiceRequest, RequestStatus } from '../../types';
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
  Check
} from 'lucide-react';

interface RequestDetailModalProps {
  request: ServiceRequest | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: RequestStatus) => void;
  onAddNote: (id: string, note: string) => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  request,
  onClose,
  onUpdateStatus,
  onAddNote,
}) => {
  const [newNote, setNewNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySent, setReplySent] = useState(false);

  if (!request) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(request.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAddNote(request.id, newNote.trim());
    setNewNote('');
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div 
        className="formal-card rounded-2xl w-full max-w-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Banner */}
        <div className="p-4 sm:p-6 border-b border-white/10 bg-gradient-to-r from-slate-900 to-[#0f172a] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-2xl formal-gradient-bg flex items-center justify-center text-sm sm:text-base font-bold text-white shadow-lg shadow-sky-900/30 shrink-0">
              {request.firstName[0]}{request.lastName[0]}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  {request.firstName} {request.lastName}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {request.service}
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
          {/* Customer Details & Status Control Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Contact Details Card */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
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
                      className="text-slate-400 hover:text-sky-300 p-1 shrink-0"
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

            {/* Status Workflow Selector */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Status Workflow Management
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Change Current Status:</label>
                  <select
                    value={request.status}
                    onChange={(e) => onUpdateStatus(request.id, e.target.value as RequestStatus)}
                    aria-label="Update Request Status"
                    className="w-full px-3 py-2 bg-slate-800 border border-sky-500/30 rounded-xl text-xs text-white font-semibold focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="Pending">Pending Review</option>
                    <option value="In Progress">In Progress (Assigned)</option>
                    <option value="Resolved">Resolved & Closed</option>
                  </select>
                </div>

                <div className="text-[11px] text-slate-400 bg-sky-500/10 p-2.5 rounded-lg border border-sky-500/20">
                  Status changes sync dynamically across table, card, and Jira drag & drop board views.
                </div>
              </div>
            </div>
          </div>

          {/* Full User Request Message */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
              Full User Message Content
            </h4>
            <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.03] border border-white/10 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans shadow-inner">
              "{request.message}"
            </div>
          </div>

          {/* Quick Email Reply Composer */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Send Direct Response to {request.firstName}
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
                  className="px-3.5 py-2 rounded-xl formal-gradient-bg text-white text-xs font-medium hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-1.5 ml-auto"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reply Email</span>
                </button>
              </form>
            )}
          </div>

          {/* Internal Notes History */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Internal Admin Notes ({request.notes?.length || 0})
            </h4>

            <div className="space-y-2">
              {request.notes && request.notes.length > 0 ? (
                request.notes.map((note, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300">
                    {note}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No internal notes added yet.</p>
              )}
            </div>

            <form onSubmit={handleAddNoteSubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add internal note..."
                className="flex-1 px-3 py-2 bg-slate-800/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
              />
              <button
                type="submit"
                disabled={!newNote.trim()}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-xl disabled:opacity-50 transition-colors shrink-0"
              >
                Add Note
              </button>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-white/10 bg-[#0f172a] flex items-center justify-between text-xs text-slate-400">
          <span>Foundex Advisory</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
