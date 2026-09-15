'use client';

import React, { useState } from 'react';
import { ServiceRequest, RequestStatus, RequestPriority } from '../../types';
import { sortByPriorityDesc } from '../../lib/adapters';
import { KanbanBoard } from './KanbanBoard';
import { PrioritySelector } from '../ui/PrioritySelector';
import { ConfirmModal } from '../ui/ConfirmModal';
import { 
  Search, 
  Filter, 
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
    // Status filter
    if (activeTab !== 'All' && r.status !== activeTab) return false;
    
    // Service category filter
    if (selectedService !== 'All' && r.service !== selectedService) return false;

    // Search query filter
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

  // Always sort high priority on top, then newest date
  const sortedRequests = [...filteredRequests].sort(sortByPriorityDesc);

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5 w-max">
            <AlertCircle className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case 'In Progress':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1.5 w-max">
            <Clock className="w-3.5 h-3.5" />
            In Progress
          </span>
        );
      case 'Resolved':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 w-max">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Resolved
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-500/10 text-gray-400 border border-gray-500/20 w-max">
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
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Inbox className="w-5 h-5 text-sky-400 shrink-0" />
            Service Requests
          </h2>
          <p className="text-xs text-sky-200/80">
            Client inquiries prioritized with High priority on top • Live sync with Jira board and Table view
          </p>
        </div>
      </div>

      {/* Filter Toolbar & View Mode Switcher */}
      <div className="office-blue-card rounded-2xl p-3.5 sm:p-4 border border-blue-400/25 space-y-4">
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
                  className={`
                    px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer
                    ${isActive 
                      ? 'bg-blue-600 text-white border border-blue-400/40 shadow-md shadow-blue-900/40 font-semibold' 
                      : 'text-sky-200 hover:text-white hover:bg-blue-800/30 border border-transparent'
                    }
                  `}
                >
                  <span>{tab}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white text-blue-950 font-bold' : 'bg-blue-500/20 text-sky-200 border border-blue-400/30'}`}>
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
                className="w-full appearance-none pl-3 pr-8 py-1.5 bg-[#061834] border border-blue-400/30 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400 cursor-pointer"
              >
                <option value="All" className="bg-[#061834] text-white">All Services</option>
                {servicesList.map((svc) => (
                  <option key={svc} value={svc} className="bg-[#061834] text-white">
                    {svc}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-sky-300 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View Mode Switcher (Jira Board, Table) */}
            <div className="flex items-center bg-[#061834] p-1 rounded-xl border border-blue-400/30">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
                  viewMode === 'kanban' 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50 font-semibold border border-blue-400/30' 
                    : 'text-sky-200 hover:text-white'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Jira Board</span>
              </button>

              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
                  viewMode === 'table' 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50 font-semibold border border-blue-400/30' 
                    : 'text-sky-200 hover:text-white'
                }`}
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
        <div className="office-blue-card rounded-2xl p-6 sm:p-8 border border-blue-400/20 space-y-4 animate-pulse">
          <div className="flex items-center justify-between pb-3 border-b border-blue-400/10">
            <div className="h-5 bg-blue-400/15 rounded w-44" />
            <div className="h-5 bg-blue-400/15 rounded w-20" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-blue-900/20 border border-blue-400/15 rounded-xl flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-400/15" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 bg-blue-400/15 rounded w-28" />
                    <div className="h-2.5 bg-blue-400/10 rounded w-36" />
                  </div>
                </div>
                <div className="h-6 bg-blue-400/15 rounded-full w-20" />
              </div>
            ))}
          </div>
        </div>
      ) : sortedRequests.length === 0 ? (
        requests.length === 0 ? (
          /* Zero Total Requests Empty State */
          <div className="office-blue-card rounded-2xl p-10 sm:p-16 text-center border border-blue-400/25 space-y-4 max-w-xl mx-auto my-6">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/20 border border-blue-400/30 text-sky-300 flex items-center justify-center mx-auto shadow-xl shadow-blue-950/40">
              <Inbox className="w-8 h-8 text-sky-400" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white tracking-tight">No Service Requests Yet</h3>
              <p className="text-xs text-sky-200/80 max-w-md mx-auto leading-relaxed">
                There are currently no customer inquiries. When visitors submit the inquiry form on the website, incoming requests will appear here in real time.
              </p>
            </div>
          </div>
        ) : (
          /* Filtered Results Empty State */
          <div className="office-blue-card rounded-2xl p-8 sm:p-12 text-center border border-blue-400/25 space-y-3 max-w-md mx-auto my-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-900/30 border border-blue-400/25 text-sky-300 flex items-center justify-center mx-auto">
              <Search className="w-5 h-5 text-sky-300" />
            </div>
            <h3 className="text-base font-semibold text-white">No Matching Inquiries Found</h3>
            <p className="text-xs text-sky-200/80 max-w-sm mx-auto">
              No inquiries match your current filters {searchTerm ? `for "${searchTerm}"` : ''}. Try resetting your search or category filter.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveTab('All');
                setSelectedService('All');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs text-white font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 mt-2 shadow-md shadow-blue-950/50"
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
        <div className="office-blue-card rounded-2xl border border-blue-400/25 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-140">
              <thead>
                <tr className="border-b border-blue-400/20 text-[11px] font-semibold text-sky-300/80 uppercase tracking-wider bg-[#061834]/90">
                  <th className="py-3.5 px-4">User Details</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-400/15 text-xs">
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
                      className="hover:bg-blue-600/10 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/35 flex items-center justify-center font-bold text-sky-200 text-[11px] shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate group-hover:text-sky-300 transition-colors">
                              {clientName}
                            </p>
                            <p className="text-[11px] text-sky-200/75 truncate flex items-center gap-1">
                              <Mail className="w-3 h-3 text-sky-400/70 shrink-0" />
                              {req.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-900/40 border border-blue-400/30 text-sky-100">
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

                      <td className="py-3.5 px-4 text-sky-200/70 whitespace-nowrap text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-sky-400/70 shrink-0" />
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
                            className="px-2.5 py-1 rounded-lg text-sky-300 hover:text-white hover:bg-blue-600/25 border border-blue-400/25 text-xs font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
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
                              className="p-1 rounded-lg text-sky-300/60 hover:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
