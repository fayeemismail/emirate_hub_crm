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
    color: '#fbbf24',
    bg: '#f59e0b26',
    border: '#f59e0b4d',
    icon: AlertCircle,
  },
  {
    id: 'In Progress',
    title: 'In Progress',
    color: '#38bdf8',
    bg: '#0284c726',
    border: '#38bdf84d',
    icon: Clock,
  },
  {
    id: 'Resolved',
    title: 'Resolved',
    color: '#34d399',
    bg: '#10b98126',
    border: '#10b9814d',
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
      <div 
        className="p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm"
        style={{
          backgroundColor: '#0c244799',
          borderColor: '#93c5fd40',
          color: '#bae6fd',
        }}
      >
        <span className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 shrink-0" style={{ color: '#38bdf8' }} />
          <span><strong>Jira Drag & Drop Board:</strong> Drag cards between columns on desktop, or swipe across columns on mobile. Leads are sorted with High Priority on top.</span>
        </span>
        <span 
          className="text-[10px] font-mono font-bold border px-2 py-0.5 rounded uppercase self-start sm:self-auto shrink-0"
          style={{
            backgroundColor: '#0284c733',
            borderColor: '#38bdf84d',
            color: '#bae6fd',
          }}
        >
          Priority Sorted
        </span>
      </div>

      {/* Kanban Board Columns */}
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
              className="rounded-2xl p-4 border transition-all duration-200 min-h-120 sm:min-h-130 flex flex-col justify-between w-[85vw] sm:w-[320px] md:w-auto shrink-0 snap-center backdrop-blur-md"
              style={{
                backgroundColor: isOver ? '#0c2e59e6' : '#0d284ce6',
                borderColor: isOver ? '#38bdf8' : '#93c5fd40',
                boxShadow: isOver ? '0 0 25px #0284c766' : '0 10px 30px #040f1eb3',
              }}
            >
              <div>
                {/* Column Header */}
                <div 
                  className="p-3 rounded-xl border mb-4 flex items-center justify-between shadow-sm"
                  style={{
                    backgroundColor: column.bg,
                    borderColor: column.border,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" style={{ color: column.color }} />
                    <h3 className="text-xs font-bold tracking-tight uppercase" style={{ color: '#ffffff' }}>
                      {column.title}
                    </h3>
                  </div>
                  <span 
                    className="px-2 py-0.5 rounded-full text-xs font-bold border"
                    style={{
                      backgroundColor: column.bg,
                      color: column.color,
                      borderColor: column.border,
                    }}
                  >
                    {columnRequests.length}
                  </span>
                </div>

                {/* Drop Zone Placeholder */}
                {isOver && columnRequests.length === 0 && (
                  <div 
                    className="p-8 text-center border-2 border-dashed rounded-xl mb-3 text-xs font-medium animate-pulse"
                    style={{
                      borderColor: '#38bdf899',
                      backgroundColor: '#0284c726',
                      color: '#bae6fd',
                    }}
                  >
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
                        className="rounded-xl p-3.5 sm:p-4 border transition-all cursor-grab active:cursor-grabbing group relative space-y-3"
                        style={{
                          backgroundColor: '#07162dbf',
                          borderColor: isBeingDragged ? '#38bdf8' : '#93c5fd33',
                          opacity: isBeingDragged ? 0.4 : 1,
                          boxShadow: '0 4px 12px #02061766',
                        }}
                      >
                        {/* Drag Handle, Priority Selector & Soft Delete */}
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5" style={{ color: '#7dd3fccc' }}>
                            <GripVertical className="w-3.5 h-3.5" style={{ color: '#38bdf899' }} />
                            <span className="font-mono text-[10px] font-semibold" style={{ color: '#bae6fd' }}>{req.id}</span>
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
                                className="p-1 rounded transition-colors cursor-pointer hover:bg-[#f43f5e33]"
                                style={{ color: '#bae6fd80' }}
                              >
                                <Trash2 className="w-3.5 h-3.5 hover:text-[#f43f5e]" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Customer Full Name & Email */}
                        <div className="space-y-1">
                          <h4 
                            className="font-bold text-xs transition-colors flex items-center justify-between group-hover:text-[#38bdf8]"
                            style={{ color: '#ffffff' }}
                          >
                            <span className="truncate">{clientName}</span>
                          </h4>
                          <p className="text-[11px] flex items-center gap-1 min-w-0" style={{ color: '#bae6fdcc' }}>
                            <Mail className="w-3 h-3 shrink-0" style={{ color: '#38bdf8b3' }} />
                            <span className="truncate">{req.email}</span>
                          </p>
                        </div>

                        {/* Optional Phone Field */}
                        <div 
                          className="text-[11px] flex items-center gap-1 pt-1 border-t"
                          style={{
                            borderColor: '#93c5fd26',
                            color: '#bae6fdcc',
                          }}
                        >
                          {req.phone ? (
                            <span className="font-mono font-semibold flex items-center gap-1 truncate" style={{ color: '#7dd3fc' }}>
                              <Phone className="w-3 h-3 shrink-0" style={{ color: '#38bdf8' }} />
                              {req.phone}
                            </span>
                          ) : (
                            <span className="italic flex items-center gap-1" style={{ color: '#93c5fd80' }}>
                              <PhoneOff className="w-3 h-3 shrink-0" />
                              Phone not provided
                            </span>
                          )}
                        </div>

                        {/* Service Category Tag */}
                        <div>
                          <span 
                            className="px-2.5 py-0.5 rounded-lg text-[10px] font-semibold border inline-block truncate max-w-full"
                            style={{
                              backgroundColor: '#0284c733',
                              borderColor: '#38bdf84d',
                              color: '#bae6fd',
                            }}
                          >
                            {req.service}
                          </span>
                        </div>

                        {/* Message Preview */}
                        <p 
                          className="text-xs p-2.5 rounded-lg border line-clamp-2 leading-relaxed italic"
                          style={{
                            backgroundColor: '#061834',
                            borderColor: '#93c5fd33',
                            color: '#e0f2fee6',
                          }}
                        >
                          {req.message ? `"${req.message}"` : <span className="italic" style={{ color: '#93c5fd80' }}>No message provided</span>}
                        </p>

                        {/* Mobile Quick Move Dropdown Options */}
                        <div 
                          className="pt-2 border-t flex items-center justify-between text-[10px] font-medium"
                          style={{
                            borderColor: '#93c5fd26',
                            color: '#bae6fdb3',
                          }}
                        >
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
                              className="md:hidden border text-[10px] rounded px-1.5 py-0.5 focus:outline-none"
                              style={{
                                backgroundColor: '#061834',
                                borderColor: '#93c5fd4d',
                                color: '#bae6fd',
                              }}
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
                              className="font-bold flex items-center gap-1 cursor-pointer hover:text-white"
                              style={{ color: '#7dd3fc' }}
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
