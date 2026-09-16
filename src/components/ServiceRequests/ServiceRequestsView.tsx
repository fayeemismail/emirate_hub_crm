'use client';

import React, { useState } from 'react';
import { ServiceRequest, RequestStatus, RequestPriority } from '../../types';
import { sortByPriorityDesc } from '../../lib/adapters';
import { KanbanBoard } from './KanbanBoard';
import { PrioritySelector } from '../ui/PrioritySelector';
import { ConfirmModal } from '../ui/ConfirmModal';
import { 
  Search, 
  Inbox, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  ChevronDown, 
  Kanban, 
  Table as TableIcon,
  Trash2
} from 'lucide-react';

interface ServiceRequestsViewProps {
  requests: ServiceRequest[];
  isLoading?: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSelectRequest: (req: ServiceRequest) => void;
  onUpdateStatus: (id: string, newStatus: RequestStatus) => void;
  onUpdatePriority?: (id: string, newPriority: RequestPriority) => void;
  onDeleteRequest?: (id: string) => void;
}

export const ServiceRequestsView: React.FC<ServiceRequestsViewProps> = ({
  requests,
  isLoading = false,
  searchTerm,
  setSearchTerm,
  onSelectRequest,
  onUpdateStatus,
  onUpdatePriority,
  onDeleteRequest,
}) => {
  const [activeTab, setActiveTab] = useState<'All' | RequestStatus>('All');
  const [selectedService, setSelectedService] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Confirmation Alert Dialog state
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  } | null>(null);

  // Available unique services
  const servicesList = Array.from(new Set(requests.map(r => r.service)));

  // Filter requests
  const filteredRequests = requests.filter(r => {
    if (activeTab !== 'All' && r.status !== activeTab) return false;
    if (selectedService !== 'All' && r.service !== selectedService) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const clientName = (r.name || `${r.firstName} ${r.lastName}`).toLowerCase();
      const email = r.email.toLowerCase();
      const phone = (r.phone || '').toLowerCase();
      const service = r.service.toLowerCase();
      const message = (r.message || '').toLowerCase();

      return (
        clientName.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        service.includes(q) ||
        message.includes(q)
      );
    }

    return true;
  });

  const sortedRequests = [...filteredRequests].sort(sortByPriorityDesc);

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span 
            className="px-2.5 py-1 text-xs font-semibold rounded-full border flex items-center gap-1.5 w-max"
            style={{
              backgroundColor: '#f59e0b26',
              color: '#fbbf24',
              borderColor: '#f59e0b4d',
            }}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case 'In Progress':
        return (
          <span 
            className="px-2.5 py-1 text-xs font-semibold rounded-full border flex items-center gap-1.5 w-max"
            style={{
              backgroundColor: '#0284c726',
              color: '#38bdf8',
              borderColor: '#0284c74d',
            }}
          >
            <Clock className="w-3.5 h-3.5" />
            In Progress
          </span>
        );
      case 'Resolved':
        return (
          <span 
            className="px-2.5 py-1 text-xs font-semibold rounded-full border flex items-center gap-1.5 w-max"
            style={{
              backgroundColor: '#10b98126',
              color: '#34d399',
              borderColor: '#10b9814d',
            }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Resolved
          </span>
        );
      default:
        return (
          <span 
            className="px-2.5 py-1 text-xs font-semibold rounded-full border w-max"
            style={{
              backgroundColor: '#64748b26',
              color: '#94a3b8',
              borderColor: '#64748b4d',
            }}
          >
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: '#ffffff' }}>
            <Inbox className="w-5 h-5 shrink-0" style={{ color: '#38bdf8' }} />
            Service Requests
          </h2>
          <p className="text-xs" style={{ color: '#bae6fdcc' }}>
            Client inquiries prioritized with High priority on top • Live sync with Jira board and Table view
          </p>
        </div>
      </div>

      {/* Filter Toolbar & View Mode Switcher */}
      <div 
        className="rounded-2xl p-3.5 sm:p-4 border space-y-4 backdrop-blur-md"
        style={{
          backgroundColor: '#0d284ce6',
          borderColor: '#93c5fd40',
          boxShadow: '0 10px 30px #040f1eb3',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {(['All', 'Pending', 'In Progress', 'Resolved'] as const).map((tab) => {
              const count = tab === 'All' 
                ? requests.length 
                : requests.filter(r => r.status === tab).length;

              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer border"
                  style={
                    isActive
                      ? {
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          borderColor: '#60a5fa66',
                          boxShadow: '0 4px 12px #1e3a8a66',
                          fontWeight: 600,
                        }
                      : {
                          backgroundColor: 'transparent',
                          color: '#bae6fd',
                          borderColor: 'transparent',
                        }
                  }
                >
                  <span>{tab}</span>
                  <span 
                    className="px-1.5 py-0.2 rounded-full text-[10px] border"
                    style={
                      isActive
                        ? {
                            backgroundColor: '#ffffff',
                            color: '#0f172a',
                            borderColor: '#ffffff',
                            fontWeight: 700,
                          }
                        : {
                            backgroundColor: '#3b82f633',
                            color: '#bae6fd',
                            borderColor: '#60a5fa4d',
                          }
                    }
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Filters & View Switcher */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Service Category Dropdown */}
            <div className="relative flex-1 sm:flex-none min-w-35">
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                aria-label="Filter by Service Category"
                className="w-full appearance-none pl-3 pr-8 py-1.5 border rounded-xl text-xs focus:outline-none cursor-pointer"
                style={{
                  backgroundColor: '#061834',
                  borderColor: '#93c5fd4d',
                  color: '#ffffff',
                }}
              >
                <option value="All" style={{ backgroundColor: '#061834', color: '#ffffff' }}>All Services</option>
                {servicesList.map((svc) => (
                  <option key={svc} value={svc} style={{ backgroundColor: '#061834', color: '#ffffff' }}>
                    {svc}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#7dd3fc' }} />
            </div>

            {/* View Mode Switcher (Jira Board, Table) */}
            <div 
              className="flex items-center p-1 rounded-xl border"
              style={{
                backgroundColor: '#061834',
                borderColor: '#93c5fd4d',
              }}
            >
              <button
                onClick={() => setViewMode('kanban')}
                className="px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer border"
                style={
                  viewMode === 'kanban'
                    ? {
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        borderColor: '#60a5fa4d',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px #1e3a8a80',
                      }
                    : {
                        backgroundColor: 'transparent',
                        color: '#bae6fd',
                        borderColor: 'transparent',
                      }
                }
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Jira Board</span>
              </button>

              <button
                onClick={() => setViewMode('table')}
                className="px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer border"
                style={
                  viewMode === 'table'
                    ? {
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        borderColor: '#60a5fa4d',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px #1e3a8a80',
                      }
                    : {
                        backgroundColor: 'transparent',
                        color: '#bae6fd',
                        borderColor: 'transparent',
                      }
                }
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div 
          className="rounded-2xl p-6 sm:p-8 border space-y-4 animate-pulse backdrop-blur-md"
          style={{
            backgroundColor: '#0d284ce6',
            borderColor: '#93c5fd33',
          }}
        >
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: '#93c5fd1a' }}>
            <div className="h-5 rounded w-44" style={{ backgroundColor: '#93c5fd26' }} />
            <div className="h-5 rounded w-20" style={{ backgroundColor: '#93c5fd26' }} />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className="h-16 border rounded-xl flex items-center justify-between px-4"
                style={{
                  backgroundColor: '#081d394d',
                  borderColor: '#93c5fd26',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: '#93c5fd26' }} />
                  <div className="space-y-1.5">
                    <div className="h-3.5 rounded w-28" style={{ backgroundColor: '#93c5fd26' }} />
                    <div className="h-2.5 rounded w-36" style={{ backgroundColor: '#93c5fd1a' }} />
                  </div>
                </div>
                <div className="h-6 rounded-full w-20" style={{ backgroundColor: '#93c5fd26' }} />
              </div>
            ))}
          </div>
        </div>
      ) : sortedRequests.length === 0 ? (
        requests.length === 0 ? (
          /* Zero Total Requests Empty State */
          <div 
            className="rounded-2xl p-10 sm:p-16 text-center border space-y-4 max-w-xl mx-auto my-6 backdrop-blur-md"
            style={{
              backgroundColor: '#0d284ce6',
              borderColor: '#93c5fd40',
              boxShadow: '0 10px 30px #040f1eb3',
            }}
          >
            <div 
              className="w-16 h-16 rounded-3xl border flex items-center justify-center mx-auto shadow-xl"
              style={{
                backgroundColor: '#0284c733',
                borderColor: '#38bdf84d',
                color: '#38bdf8',
                boxShadow: '0 10px 25px #02061766',
              }}
            >
              <Inbox className="w-8 h-8" style={{ color: '#38bdf8' }} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold tracking-tight" style={{ color: '#ffffff' }}>No Service Requests Yet</h3>
              <p className="text-xs max-w-md mx-auto leading-relaxed" style={{ color: '#bae6fdcc' }}>
                There are currently no customer inquiries. When visitors submit the inquiry form on the website, incoming requests will appear here in real time.
              </p>
            </div>
          </div>
        ) : (
          /* Filtered Results Empty State */
          <div 
            className="rounded-2xl p-8 sm:p-12 text-center border space-y-3 max-w-md mx-auto my-6 backdrop-blur-md"
            style={{
              backgroundColor: '#0d284ce6',
              borderColor: '#93c5fd40',
            }}
          >
            <div 
              className="w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto"
              style={{
                backgroundColor: '#081d3966',
                borderColor: '#93c5fd40',
                color: '#7dd3fc',
              }}
            >
              <Search className="w-5 h-5" style={{ color: '#7dd3fc' }} />
            </div>
            <h3 className="text-base font-semibold" style={{ color: '#ffffff' }}>No Matching Inquiries Found</h3>
            <p className="text-xs max-w-sm mx-auto" style={{ color: '#bae6fdcc' }}>
              No inquiries match your current filters {searchTerm ? `for "${searchTerm}"` : ''}. Try resetting your search or category filter.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveTab('All');
                setSelectedService('All');
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs text-white font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 mt-2 shadow-md"
              style={{
                backgroundColor: '#2563eb',
                boxShadow: '0 4px 12px #02061780',
              }}
            >
              <span>Clear Filters</span>
            </button>
          </div>
        )
      ) : viewMode === 'kanban' ? (
        /* Jira-Style Drag & Drop Board with Priority Sorting */
        <KanbanBoard
          requests={sortedRequests}
          onSelectRequest={onSelectRequest}
          onUpdateStatus={onUpdateStatus}
          onUpdatePriority={onUpdatePriority}
          onDeleteRequest={onDeleteRequest}
        />
      ) : (
        /* Table View with responsive overflow and Priority Sorting */
        <div 
          className="rounded-2xl border overflow-hidden backdrop-blur-md"
          style={{
            backgroundColor: '#0d284ce6',
            borderColor: '#93c5fd40',
            boxShadow: '0 10px 30px #040f1eb3',
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-140">
              <thead>
                <tr 
                  className="border-b text-[11px] font-semibold uppercase tracking-wider"
                  style={{
                    backgroundColor: '#061834e6',
                    borderColor: '#93c5fd33',
                    color: '#bae6fdcc',
                  }}
                >
                  <th className="py-3.5 px-4">User Details</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs" style={{ borderColor: '#93c5fd26' }}>
                {sortedRequests.map((req) => {
                  const clientName = req.name || `${req.firstName} ${req.lastName}`.trim() || 'Client';
                  const initials = clientName
                    .split(/\s+/)
                    .map(w => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || 'L';

                  return (
                    <tr 
                      key={req.id} 
                      onClick={() => onSelectRequest(req)}
                      className="hover:bg-[#2563eb1a] cursor-pointer transition-colors group"
                      style={{ borderBottomColor: '#93c5fd26' }}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-[11px] shrink-0"
                            style={{
                              backgroundColor: '#0284c733',
                              borderColor: '#38bdf859',
                              color: '#bae6fd',
                            }}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold transition-colors group-hover:text-[#38bdf8]" style={{ color: '#ffffff' }}>
                              {clientName}
                            </p>
                            <p className="text-[11px] truncate flex items-center gap-1" style={{ color: '#bae6fdbf' }}>
                              <Mail className="w-3 h-3 shrink-0" style={{ color: '#38bdf8b3' }} />
                              {req.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span 
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border"
                          style={{
                            backgroundColor: '#081d3980',
                            borderColor: '#93c5fd4d',
                            color: '#bae6fd',
                          }}
                        >
                          {req.service}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
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
                          align="left"
                          size="sm"
                        />
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-[11px]" style={{ color: '#bae6fdb3' }}>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 shrink-0" style={{ color: '#38bdf8b3' }} />
                          {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(req.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectRequest(req)}
                            className="px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer hover:text-white"
                            style={{
                              color: '#7dd3fc',
                              borderColor: '#93c5fd40',
                              backgroundColor: '#0284c71a',
                            }}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          {onDeleteRequest && (
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmAction({
                                  isOpen: true,
                                  title: 'Soft Delete Inquiry',
                                  message: `Are you sure you want to soft delete the inquiry from "${clientName}" (${req.service})? This record will be archived and hidden from all active views.`,
                                  confirmText: 'Yes, Delete',
                                  variant: 'danger',
                                  onConfirm: () => onDeleteRequest(req.id),
                                });
                              }}
                              title="Soft delete inquiry"
                              className="p-1 rounded-lg transition-colors cursor-pointer hover:bg-[#f43f5e33]"
                              style={{ color: '#bae6fd80' }}
                            >
                              <Trash2 className="w-3.5 h-3.5 hover:text-[#f43f5e]" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
