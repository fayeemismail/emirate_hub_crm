'use client';

import React, { useState } from 'react';
import { ServiceRequest, RequestStatus, RequestPriority } from '../../types';
import { sortByPriorityDesc } from '../../lib/adapters';
import { PrioritySelector } from '../ui/PrioritySelector';
import { ConfirmModal } from '../ui/ConfirmModal';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Mail, 
  Phone, 
  PhoneOff, 
  Eye, 
  GripVertical,
  ArrowRightLeft,
  Trash2
} from 'lucide-react';

interface KanbanBoardProps {
  requests: ServiceRequest[];
  onSelectRequest: (req: ServiceRequest) => void;
  onUpdateStatus: (id: string, newStatus: RequestStatus) => void;
  onUpdatePriority?: (id: string, newPriority: RequestPriority) => void;
  onDeleteRequest?: (id: string) => void;
}

const COLUMNS: { id: RequestStatus; title: string; color: string; bg: string; border: string; icon: React.ElementType }[] = [
  {
    id: 'Pending',
    title: 'Pending Review',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: AlertCircle,
  },
  {
    id: 'In Progress',
    title: 'In Progress',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    icon: Clock,
  },
  {
    id: 'Resolved',
    title: 'Resolved',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: CheckCircle2,
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  requests,
  onSelectRequest,
  onUpdateStatus,
  onUpdatePriority,
  onDeleteRequest,
}) => {
  const [draggedRequestId, setDraggedRequestId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<RequestStatus | null>(null);

  // Confirmation Alert Dialog state
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  } | null>(null);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, reqId: string) => {
    e.dataTransfer.setData('text/plain', reqId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedRequestId(reqId);
  };

  const handleDragEnd = () => {
    setDraggedRequestId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: RequestStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent, status: RequestStatus) => {
    e.preventDefault();
    if (dragOverColumn === status) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: RequestStatus) => {
    e.preventDefault();
    const reqId = e.dataTransfer.getData('text/plain') || draggedRequestId;
    if (reqId) {
      onUpdateStatus(reqId, targetStatus);
    }
    setDraggedRequestId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="space-y-4">
      {/* Helper Guidance Banner */}
      <div className="p-3 rounded-xl bg-blue-900/30 border border-blue-400/25 text-xs text-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
        <span className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-sky-300 shrink-0" />
          <span><strong>Jira Drag & Drop Board:</strong> Drag cards between columns on desktop, or swipe across columns on mobile. Leads are sorted with High Priority on top.</span>
        </span>
        <span className="text-[10px] font-mono font-bold bg-blue-500/20 border border-blue-400/30 px-2 py-0.5 rounded text-sky-200 uppercase self-start sm:self-auto shrink-0">
          Priority Sorted
        </span>
      </div>

      {/* Kanban Board Columns - Swipeable Carousel on Mobile, Grid on Tablet/Desktop */}
      <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory pb-4 md:pb-0 scrollbar-none items-start">
        {COLUMNS.map((column) => {
          const columnRequests = requests
            .filter(r => r.status === column.id)
            .sort(sortByPriorityDesc);
          const isOver = dragOverColumn === column.id;
          const Icon = column.icon;

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={(e) => handleDragLeave(e, column.id)}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`
                office-blue-card rounded-2xl p-4 border transition-all duration-200 min-h-120 sm:min-h-130 flex flex-col justify-between
                w-[85vw] sm:w-[320px] md:w-auto shrink-0 snap-center
                ${isOver 
                  ? 'border-sky-400 bg-blue-900/40 ring-2 ring-sky-400/30 scale-[1.01]' 
                  : 'border-blue-400/20 bg-[#081e3d]/85'
                }
              `}
            >
              <div>
                {/* Column Header */}
                <div className={`p-3 rounded-xl ${column.bg} border ${column.border} mb-4 flex items-center justify-between shadow-sm`}>
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${column.color}`} />
                    <h3 className="text-xs font-bold text-white tracking-tight uppercase">
                      {column.title}
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${column.bg} ${column.color} border ${column.border}`}>
                    {columnRequests.length}
                  </span>
                </div>

                {/* Drop Zone Placeholder */}
                {isOver && columnRequests.length === 0 && (
                  <div className="p-8 text-center border-2 border-dashed border-sky-400/50 rounded-xl bg-blue-500/10 mb-3 text-xs text-sky-200 font-medium animate-pulse">
                    Drop Request Here to set as "{column.title}"
                  </div>
                )}

                {/* Cards Container */}
                <div className="space-y-3">
                  {columnRequests.map((req) => {
                    const isBeingDragged = draggedRequestId === req.id;
                    const clientName = req.name || `${req.firstName} ${req.lastName}`.trim() || 'Client';

                    return (
                      <div
                        key={req.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, req.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onSelectRequest(req)}
                        className={`
                          office-blue-inner-card rounded-xl p-3.5 sm:p-4 border border-blue-400/20 hover:border-sky-400/50 transition-all cursor-grab active:cursor-grabbing group relative space-y-3
                          ${isBeingDragged 
                            ? 'opacity-40 scale-95 border-sky-400 ring-2 ring-sky-400' 
                            : 'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/50'
                          }
                        `}
                      >
                        {/* Drag Handle, Priority Selector & Soft Delete */}
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-sky-300/80">
                            <GripVertical className="w-3.5 h-3.5 text-sky-400/60 group-hover:text-sky-300 transition-colors" />
                            <span className="font-mono text-[10px] font-semibold text-sky-200">{req.id}</span>
                          </div>

                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <PrioritySelector
                              priority={req.priority}
                              onChange={(newPriority) => {
                                if (newPriority === req.priority) return;
                                setConfirmAction({
                                  isOpen: true,
                                  title: 'Change Inquiry Priority',
                                  message: `Are you sure you want to change priority for "${clientName}" from "${req.priority}" to "${newPriority}"? Inquiries will be automatically re-sorted with High priority on top.`,
                                  confirmText: `Set as ${newPriority}`,
                                  variant: newPriority === 'High' ? 'danger' : 'warning',
                                  onConfirm: () => onUpdatePriority?.(req.id, newPriority),
                                });
                              }}
                              align="right"
                              size="sm"
                            />

                            {onDeleteRequest && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmAction({
                                    isOpen: true,
                                    title: 'Soft Delete Inquiry',
                                    message: `Are you sure you want to soft delete the inquiry from "${clientName}" (${req.service})? This record will be archived and hidden from all active views.`,
                                    confirmText: 'Yes, Delete',
                                    variant: 'danger',
                                    onConfirm: () => onDeleteRequest(req.id),
                                  });
                                }}
                                title="Soft delete lead"
                                className="text-sky-300/60 hover:text-rose-400 p-1 rounded hover:bg-rose-500/20 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Customer Full Name & Email */}
                        <div className="space-y-1">
                          <h4 className="font-bold text-white text-xs group-hover:text-sky-300 transition-colors flex items-center justify-between">
                            <span className="truncate">{clientName}</span>
                          </h4>
                          <p className="text-[11px] text-sky-200/75 flex items-center gap-1 min-w-0">
                            <Mail className="w-3 h-3 text-sky-400/70 shrink-0" />
                            <span className="truncate">{req.email}</span>
                          </p>
                        </div>

                        {/* Optional Phone Field */}
                        <div className="text-[11px] text-sky-200/75 flex items-center gap-1 pt-1 border-t border-blue-400/15">
                          {req.phone ? (
                            <span className="text-sky-300 font-mono font-semibold flex items-center gap-1 truncate">
                              <Phone className="w-3 h-3 text-sky-400 shrink-0" />
                              {req.phone}
                            </span>
                          ) : (
                            <span className="text-sky-300/50 italic flex items-center gap-1">
                              <PhoneOff className="w-3 h-3 shrink-0" />
                              Phone not provided
                            </span>
                          )}
                        </div>

                        {/* Service Category Tag */}
                        <div>
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-semibold bg-blue-500/25 text-sky-100 border border-blue-400/35 inline-block truncate max-w-full">
                            {req.service}
                          </span>
                        </div>

                        {/* Message Preview */}
                        <p className="text-xs text-sky-100 bg-[#061834] p-2.5 rounded-lg border border-blue-400/20 line-clamp-2 leading-relaxed italic">
                          {req.message ? `"${req.message}"` : <span className="italic text-sky-300/50">No message provided</span>}
                        </p>

                        {/* Mobile Quick Move Dropdown Options */}
                        <div className="pt-2 border-t border-blue-400/15 flex items-center justify-between text-[10px] text-sky-200/70 font-medium">
                          <span>{new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                          
                          <div className="flex items-center gap-2">
                            {/* Mobile Move Dropdown Button */}
                            <select
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                e.stopPropagation();
                                if (e.target.value) {
                                  onUpdateStatus(req.id, e.target.value as RequestStatus);
                                }
                              }}
                              value={req.status}
                              aria-label="Move Status"
                              className="md:hidden bg-[#061834] border border-blue-400/30 text-[10px] text-sky-200 rounded px-1.5 py-0.5 focus:outline-none"
                            >
                              <option value="Pending">Move: Pending</option>
                              <option value="In Progress">Move: In Progress</option>
                              <option value="Resolved">Move: Resolved</option>
                            </select>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectRequest(req);
                              }}
                              className="text-sky-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <ConfirmModal
          isOpen={confirmAction.isOpen}
          onClose={() => setConfirmAction(null)}
          onConfirm={confirmAction.onConfirm}
          title={confirmAction.title}
          message={confirmAction.message}
          confirmText={confirmAction.confirmText}
          variant={confirmAction.variant}
        />
      )}
    </div>
  );
};
