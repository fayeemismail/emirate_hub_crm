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
  Kanban,
  Table as TableIcon
} from 'lucide-react';

interface ServiceRequestsViewProps {
  requests: ServiceRequest[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSelectRequest: (req: ServiceRequest) => void;
  onUpdateStatus: (id: string, newStatus: RequestStatus) => void;
}

export const ServiceRequestsView: React.FC<ServiceRequestsViewProps> = ({
  requests,
  searchTerm,
  setSearchTerm,
  onSelectRequest,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'All' | RequestStatus>('All');
  const [selectedService, setSelectedService] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

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
            <div className="relative flex-1 sm:flex-none min-w-35">
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
            No matching requests fit your current search or status filter. Try clearing your filters or check back later.
          </p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Jira-Style Drag & Drop Board */
        <KanbanBoard
          requests={filteredRequests}
          onSelectRequest={onSelectRequest}
          onUpdateStatus={onUpdateStatus}
        />
      ) : (
        /* Table View with responsive overflow */
        <div className="formal-card rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-175">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-white/1">
                  <th className="py-3.5 px-4">User Details</th>
                  <th className="py-3.5 px-4">Phone (Optional)</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Message Snippet</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredRequests.map((req) => (
                  <tr 
                    key={req.id} 
                    onClick={() => onSelectRequest(req)}
                    className="hover:bg-white/2 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center font-bold text-sky-300 text-[11px] shrink-0">
                          {req.firstName[0]}{req.lastName[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate group-hover:text-sky-300 transition-colors">
                            {req.firstName} {req.lastName}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                            {req.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {req.phone ? (
                        <span className="font-mono text-slate-300 text-[11px] bg-white/3 px-2 py-0.5 rounded border border-white/5">
                          {req.phone}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px] italic flex items-center gap-1">
                          <PhoneOff className="w-3 h-3 shrink-0" />
                          None
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 border border-white/10 text-slate-300">
                        {req.service}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-400 truncate text-[11px]">
                        "{req.message}"
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                        {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(req.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRequest(req);
                        }}
                        className="px-2.5 py-1 rounded-lg text-sky-400 hover:text-white hover:bg-sky-500/20 text-xs font-semibold transition-all inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
