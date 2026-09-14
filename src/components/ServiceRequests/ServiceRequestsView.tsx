'use client';

import React, { useState } from 'react';
import { ServiceRequest, RequestStatus } from '../../types';
import { KanbanBoard } from './KanbanBoard';
import { 
  Search, 
  Filter, 
  Inbox, 
  Mail, 
  Phone, 
  PhoneOff, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  ChevronDown,
  Sparkles,
  Plus,
  Kanban,
  Table as TableIcon,
  LayoutGrid
} from 'lucide-react';

interface ServiceRequestsViewProps {
  requests: ServiceRequest[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSelectRequest: (req: ServiceRequest) => void;
  onOpenSimulateModal: () => void;
  onUpdateStatus: (id: string, newStatus: RequestStatus) => void;
}

export const ServiceRequestsView: React.FC<ServiceRequestsViewProps> = ({
  requests,
  searchTerm,
  setSearchTerm,
  onSelectRequest,
  onOpenSimulateModal,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'All' | RequestStatus>('All');
  const [selectedService, setSelectedService] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'cards'>('kanban');

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
      const fullName = `${r.firstName} ${r.lastName}`.toLowerCase();
      const email = r.email.toLowerCase();
      const phone = (r.phone || '').toLowerCase();
      const service = r.service.toLowerCase();
      const message = r.message.toLowerCase();

      return (
        fullName.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        service.includes(q) ||
        message.includes(q)
      );
    }

    return true;
  });

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
          <p className="text-xs text-slate-400">
            User inquiries submitted from Foundex website contact form with Jira drag and drop board
          </p>
        </div>

        <button
          onClick={onOpenSimulateModal}
          className="px-4 py-2 rounded-xl formal-gradient-bg text-white text-xs font-semibold shadow-lg shadow-sky-900/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Simulate Form Submission</span>
        </button>
      </div>

      {/* Filter Toolbar & View Mode Switcher */}
      <div className="formal-card rounded-2xl p-3.5 sm:p-4 border border-white/10 space-y-4">
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
                    px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5
                    ${isActive 
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-inner' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <span>{tab}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-sky-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Secondary Filters & View Switcher */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Service Category Dropdown */}
            <div className="relative flex-1 sm:flex-none min-w-[140px]">
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                aria-label="Filter by Service Category"
                className="w-full appearance-none pl-3 pr-8 py-1.5 bg-slate-800 border border-white/10 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500/50 cursor-pointer"
              >
                <option value="All" className="bg-slate-800 text-white">All Services</option>
                {servicesList.map((svc) => (
                  <option key={svc} value={svc} className="bg-slate-800 text-white">
                    {svc}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View Mode Switcher (Jira Board, Table, Cards) */}
            <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 sm:gap-1.5 ${
                  viewMode === 'kanban' 
                    ? 'bg-sky-500 text-white shadow-sm font-semibold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Jira Board</span>
              </button>

              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 sm:gap-1.5 ${
                  viewMode === 'table' 
                    ? 'bg-sky-500 text-white shadow-sm font-semibold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table</span>
              </button>

              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 sm:gap-1.5 ${
                  viewMode === 'cards' 
                    ? 'bg-sky-500 text-white shadow-sm font-semibold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredRequests.length === 0 ? (
        <div className="formal-card rounded-2xl p-8 sm:p-12 text-center border border-white/10 space-y-3">
          <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Service Requests Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No matching requests fit your current search or status filter. Try clearing filters or submit a new simulated request.
          </p>
          <button
            onClick={onOpenSimulateModal}
            className="px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-medium hover:bg-sky-500/30 transition-all inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Submit Test Request Form
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Jira-Style Drag & Drop Board */
        <KanbanBoard
          requests={filteredRequests}
          onSelectRequest={onSelectRequest}
          onUpdateStatus={onUpdateStatus}
          onOpenSimulateModal={onOpenSimulateModal}
        />
      ) : viewMode === 'table' ? (
        /* Table View with responsive overflow */
        <div className="formal-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-white/[0.01]">
                  <th className="py-3.5 px-4">User Details</th>
                  <th className="py-3.5 px-4">Phone (Optional)</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Message Snippet</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-xs text-slate-300">
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                    onClick={() => onSelectRequest(req)}
                  >
                    {/* User First/Last Name & Email */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-xs font-bold text-sky-300 shrink-0">
                          {req.firstName[0]}{req.lastName[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-sky-300 transition-colors">
                            {req.firstName} {req.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                            {req.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Phone (Optional) */}
                    <td className="py-3.5 px-4">
                      {req.phone ? (
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className="font-mono text-[11px]">{req.phone}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic flex items-center gap-1">
                          <PhoneOff className="w-3 h-3 shrink-0" />
                          Not Provided
                        </span>
                      )}
                    </td>

                    {/* Service */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-sky-500/10 text-sky-300 border border-sky-500/20 whitespace-nowrap">
                        {req.service}
                      </span>
                    </td>

                    {/* Message Snippet */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="line-clamp-2 text-slate-400 leading-relaxed">
                        "{req.message}"
                      </p>
                    </td>

                    {/* Submitted Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                        {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(req.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRequest(req);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-sky-500/20 text-slate-300 hover:text-sky-200 border border-white/10 hover:border-sky-500/30 text-xs font-medium transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 inline mr-1" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View - Responsive Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              onClick={() => onSelectRequest(req)}
              className="formal-card formal-card-hover rounded-2xl p-4 sm:p-5 border border-white/10 space-y-4 cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center font-bold text-sky-300 text-xs shrink-0">
                      {req.firstName[0]}{req.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-white text-sm truncate">
                        {req.firstName} {req.lastName}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{req.email}</span>
                      </p>
                    </div>
                  </div>

                  {getStatusBadge(req.status)}
                </div>

                {/* Phone tag */}
                <div className="text-xs text-slate-400 pt-1 border-t border-white/5 flex items-center justify-between">
                  <span className="font-medium text-slate-400">Contact Phone:</span>
                  {req.phone ? (
                    <span className="font-mono text-sky-300 font-medium">{req.phone}</span>
                  ) : (
                    <span className="text-slate-500 italic">Not provided</span>
                  )}
                </div>

                {/* Requested Service */}
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    Service Category
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20 inline-block">
                    {req.service}
                  </span>
                </div>

                {/* Message Body */}
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                    User Message
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5 line-clamp-3">
                    "{req.message}"
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>{new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-sky-400 font-medium hover:underline flex items-center gap-1">
                  View Record &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
