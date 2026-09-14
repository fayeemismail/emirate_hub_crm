'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Calendar, 
  Layers, 
  GitCommit, 
  BarChart3, 
  Filter,
  Loader2
} from 'lucide-react';
import { 
  MonthlyTrendsResponse, 
  ServiceAnalyticsResponse, 
  FunnelAnalyticsResponse, 
  OverviewKpi 
} from '../../types';
import { analyticsApi } from '../../lib/api';

interface MessagesGraphProps {
  monthlyTrends?: MonthlyTrendsResponse | null;
  serviceAnalytics?: ServiceAnalyticsResponse | null;
  funnelAnalytics?: FunnelAnalyticsResponse | null;
  overviewKpi?: OverviewKpi | null;
  isLoading?: boolean;
}

export const MessagesGraph: React.FC<MessagesGraphProps> = ({
  monthlyTrends: initialMonthlyTrends,
  serviceAnalytics,
  funnelAnalytics,
  overviewKpi,
  isLoading: isParentLoading = false,
}) => {
  // Chart Display Mode
  const [activeTab, setActiveTab] = useState<'monthly' | 'funnel' | 'services'>('monthly');

  // Year and Service filter state
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedService, setSelectedService] = useState<string>('all');

  // Local state for trends
  const [currentTrends, setCurrentTrends] = useState<MonthlyTrendsResponse | null>(
    initialMonthlyTrends || null
  );
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Synchronize when initialMonthlyTrends prop arrives or updates
  useEffect(() => {
    if (initialMonthlyTrends) {
      if (selectedYear === currentYear && selectedService === 'all') {
        setCurrentTrends(initialMonthlyTrends);
      }
      setIsFilterLoading(false);
    }
  }, [initialMonthlyTrends, selectedYear, selectedService, currentYear]);

  // Handler to fetch trends when user actively changes year
  const handleYearChange = async (year: number) => {
    setSelectedYear(year);
    setIsFilterLoading(true);
    try {
      const res = await analyticsApi.getMonthlyTrends({
        year,
        service: selectedService !== 'all' ? selectedService : undefined,
      });
      if (res.data) {
        setCurrentTrends(res.data);
      }
    } catch (err) {
      console.error('Failed to load filtered monthly trends:', err);
    } finally {
      setIsFilterLoading(false);
    }
  };

  // Handler to fetch trends when user actively changes service
  const handleServiceChange = async (service: string) => {
    setSelectedService(service);
    setIsFilterLoading(true);
    try {
      const res = await analyticsApi.getMonthlyTrends({
        year: selectedYear,
        service: service !== 'all' ? service : undefined,
      });
      if (res.data) {
        setCurrentTrends(res.data);
      }
    } catch (err) {
      console.error('Failed to load filtered monthly trends:', err);
    } finally {
      setIsFilterLoading(false);
    }
  };

  // 12-month data array from backend trends
  const trendsData = useMemo(() => {
    if (currentTrends?.trends && currentTrends.trends.length > 0) {
      return currentTrends.trends;
    }
    // Zero-filled fallback for all 12 calendar months
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return MONTHS.map((m, idx) => ({
      month: `${selectedYear}-${String(idx + 1).padStart(2, '0')}`,
      monthName: m,
      year: selectedYear,
      monthNumber: idx + 1,
      totalLeads: 0,
      wonLeads: 0,
      lostLeads: 0,
      inProgressLeads: 0,
      winRatePercentage: 0,
      momChangePercentage: 0,
      statusBreakdown: {},
    }));
  }, [currentTrends, selectedYear]);

  // Metric Computations for Monthly View
  const totalYearVolume = currentTrends?.totalYearLeads ?? trendsData.reduce((acc, t) => acc + t.totalLeads, 0);
  const maxVal = Math.max(...trendsData.map((d) => d.totalLeads), 5);

  // SVG Chart Geometry
  const svgWidth = 720;
  const svgHeight = 220;
  const paddingX = 35;
  const paddingY = 30;

  const points = trendsData.map((d, i) => {
    const val = d.totalLeads;
    const x = paddingX + (i / (trendsData.length - 1)) * (svgWidth - 2 * paddingX);
    const y = svgHeight - paddingY - (val / maxVal) * (svgHeight - 2 * paddingY);
    return { x, y, val, label: d.monthName.slice(0, 3), raw: d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  // Get active services list from backend service analytics for dynamic filter tabs
  const availableServices = useMemo(() => {
    if (!serviceAnalytics?.services) return [];
    return serviceAnalytics.services.map((s) => s.service);
  }, [serviceAnalytics]);

  // Overall MoM growth percentage
  const momGrowth = overviewKpi?.momGrowthPercentage ?? null;

  return (
    <div className="formal-card rounded-2xl p-4 sm:p-6 border border-white/10 relative overflow-hidden space-y-5">
      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Chart Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Inquiry Analytics & Pipeline Trends
              </h2>
              <p className="text-xs text-slate-400">
                Inquiry volume, pipeline progression, and service demand metrics
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10 text-xs self-start md:self-auto shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveTab('monthly')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'monthly'
                ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-950/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Monthly Trends</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('funnel')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'funnel'
                ? 'bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-950/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Pipeline Funnel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'services'
                ? 'bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Service Demand</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. MONTHLY INGESTION TRENDS VIEW                         */}
      {/* ======================================================== */}
      {activeTab === 'monthly' && (
        <div className="space-y-4">
          {/* Controls & Metrics Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* KPI Summary Headline */}
            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {totalYearVolume}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                total inquiries in {selectedYear}
              </span>

              {momGrowth !== null && (
                <span className={`text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded-md border ml-auto sm:ml-0 ${
                  momGrowth >= 0 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {momGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {momGrowth >= 0 ? `+${momGrowth}%` : `${momGrowth}%`} MoM
                </span>
              )}
            </div>

            {/* Filter Dropdown & Year Selection */}
            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
              {isFilterLoading && (
                <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin mr-1" />
              )}

              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Filter className="w-3 h-3 text-sky-400" />
                Service:
              </span>
              <select
                value={selectedService}
                onChange={(e) => handleServiceChange(e.target.value)}
                aria-label="Filter Trends by Service"
                className="bg-slate-900/90 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="all">All Service Categories</option>
                {availableServices.map((svc) => (
                  <option key={svc} value={svc}>
                    {svc}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                aria-label="Select Year for Analytics"
                className="bg-slate-900/90 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer font-mono"
              >
                {[currentYear, currentYear - 1, currentYear - 2].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Service Quick Filter Pills */}
          {availableServices.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
              <button
                type="button"
                onClick={() => handleServiceChange('all')}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] whitespace-nowrap cursor-pointer ${
                  selectedService === 'all'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                    : 'text-slate-400 hover:text-white bg-white/3 border border-transparent'
                }`}
              >
                All Services
              </button>
              {availableServices.slice(0, 5).map((svc) => (
                <button
                  key={svc}
                  type="button"
                  onClick={() => handleServiceChange(svc)}
                  className={`px-2.5 py-1 rounded-lg transition-all text-[11px] whitespace-nowrap cursor-pointer ${
                    selectedService === svc
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                      : 'text-slate-400 hover:text-white bg-white/3 border border-transparent'
                  }`}
                >
                  {svc}
                </button>
              ))}
            </div>
          )}

          {/* Responsive SVG Chart Container */}
          <div className="relative w-full overflow-x-auto scrollbar-none pt-2">
            <div className="min-w-[580px] w-full relative">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto overflow-visible"
              >
                <defs>
                  <linearGradient id="trendsGlowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="trendsLineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#0284c7" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>

                {/* Grid Horizontal Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                  const y = paddingY + pct * (svgHeight - 2 * paddingY);
                  const gridVal = Math.round(maxVal * (1 - pct));
                  return (
                    <g key={idx}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={svgWidth - paddingX}
                        y2={y}
                        stroke="rgba(255, 255, 255, 0.06)"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 3}
                        textAnchor="end"
                        fontSize="9"
                        fill="rgba(148, 163, 184, 0.6)"
                        fontFamily="monospace"
                      >
                        {gridVal}
                      </text>
                    </g>
                  );
                })}

                {/* Area Fill Under Curve */}
                <path d={areaD} fill="url(#trendsGlowGradient)" />

                {/* Main Curve Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="url(#trendsLineGradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive Data Points */}
                {points.map((pt, i) => (
                  <g key={i}>
                    {/* Vertical Indicator Guide when Hovered */}
                    {hoveredIndex === i && (
                      <line
                        x1={pt.x}
                        y1={paddingY}
                        x2={pt.x}
                        y2={svgHeight - paddingY}
                        stroke="rgba(56, 189, 248, 0.4)"
                        strokeDasharray="2 2"
                      />
                    )}

                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredIndex === i ? 6.5 : 4}
                      className="transition-all duration-150 cursor-pointer"
                      fill="#0f172a"
                      stroke={pt.val > 0 ? '#38bdf8' : '#64748b'}
                      strokeWidth="2.5"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  </g>
                ))}
              </svg>

              {/* Floating Tooltip with Status Breakdown from Backend */}
              {hoveredIndex !== null && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-900 border border-sky-500/40 rounded-xl p-3 shadow-2xl z-30 pointer-events-none text-xs flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 animate-in fade-in duration-100 backdrop-blur-md"
                >
                  <div>
                    <p className="text-slate-400 font-medium">
                      {points[hoveredIndex].raw.monthName} {selectedYear}
                    </p>
                    <p className="text-white font-extrabold text-sm flex items-center gap-1.5">
                      <span>{points[hoveredIndex].val} Inquiries</span>
                      {points[hoveredIndex].raw.winRatePercentage > 0 && (
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded">
                          {points[hoveredIndex].raw.winRatePercentage}% Won
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-3 text-[11px] text-slate-300 grid grid-cols-2 gap-x-3 gap-y-1">
                    <div>New: <span className="text-sky-400 font-bold">{(points[hoveredIndex].raw.statusBreakdown as Record<string, number>)?.['new'] ?? 0}</span></div>
                    <div>In Review: <span className="text-amber-400 font-bold">{(points[hoveredIndex].raw.statusBreakdown as Record<string, number>)?.['in_review'] ?? 0}</span></div>
                    <div>Won: <span className="text-emerald-400 font-bold">{points[hoveredIndex].raw.wonLeads}</span></div>
                    <div>In Progress: <span className="text-indigo-400 font-bold">{points[hoveredIndex].raw.inProgressLeads}</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* X-Axis Month Labels */}
            <div className="flex justify-between px-2 sm:px-6 pt-2 text-[10px] sm:text-[11px] text-slate-400 font-semibold border-t border-white/10 min-w-[580px]">
              {trendsData.map((d, i) => (
                <span 
                  key={i} 
                  className={`text-center transition-colors ${
                    hoveredIndex === i ? 'text-sky-300 font-bold' : ''
                  }`}
                >
                  {d.monthName.slice(0, 3)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. PIPELINE FUNNEL VIEW                                  */}
      {/* ======================================================== */}
      {activeTab === 'funnel' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              Pipeline Stage Progression & Dwell Time ({funnelAnalytics?.totalLeadsInFunnel ?? 0} total leads)
            </span>
            <span className="text-[11px] text-sky-400 font-semibold">
              Live Funnel Conversion
            </span>
          </div>

          <div className="space-y-2.5">
            {funnelAnalytics?.stages && funnelAnalytics.stages.length > 0 ? (
              funnelAnalytics.stages.map((stage) => {
                const pct = stage.percentageOfTotal || 0;
                return (
                  <div
                    key={stage.slug}
                    className="p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/15 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: stage.color || '#38bdf8' }}
                        />
                        <span className="font-semibold text-white">{stage.title}</span>
                      </div>

                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-white font-bold">{stage.leadCount} leads</span>
                        <span className="text-sky-400 font-semibold">{pct}%</span>
                      </div>
                    </div>

                    {/* Funnel Stage Bar */}
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(pct, 2)}%`,
                          backgroundColor: stage.color || '#38bdf8',
                        }}
                      />
                    </div>

                    {/* Drop-off rate & dwell time */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>Drop-off: {stage.dropOffRatePercentage}%</span>
                      <span>Avg Dwell: {stage.avgDwellTimeHours > 0 ? `${stage.avgDwellTimeHours} hrs` : 'Immediate'}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 bg-white/2 rounded-xl">
                No pipeline funnel metrics available yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. SERVICE DEMAND VIEW                                   */}
      {/* ======================================================== */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              Inquiry Share & Performance by Service Offering
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold">
              Demand Distribution
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {serviceAnalytics?.services && serviceAnalytics.services.length > 0 ? (
              serviceAnalytics.services.map((svc) => (
                <div
                  key={svc.service}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/30 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white truncate max-w-[200px]">
                      {svc.service}
                    </span>
                    <span className="text-emerald-400 font-bold font-mono">
                      {svc.sharePercentage}% share
                    </span>
                  </div>

                  {/* Share Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(svc.sharePercentage, 3)}%` }}
                    />
                  </div>

                  {/* Volume Metrics */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                    <span>{svc.totalInquiries} total inquiries</span>
                    <span className="flex items-center gap-2">
                      <span className="text-emerald-400 font-semibold">{svc.wonCount} won</span>
                      <span>•</span>
                      <span className="text-indigo-300 font-semibold">{svc.inProgressCount} active</span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 p-8 text-center text-xs text-slate-400 bg-white/2 rounded-xl">
                No service offering breakdown available yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
