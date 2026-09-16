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
    <div 
      className="rounded-2xl p-4 sm:p-6 border relative overflow-hidden space-y-5 backdrop-blur-md"
      style={{
        backgroundColor: '#0d284ce6',
        borderColor: '#93c5fd40',
        boxShadow: '0 10px 30px #040f1eb3',
      }}
    >
      {/* Background Ambient Glow */}
      <div 
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: '#0284c726' }}
      />

      {/* Chart Top Header */}
      <div 
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4"
        style={{ borderColor: '#93c5fd33' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <div 
              className="p-2 rounded-xl border shrink-0"
              style={{
                backgroundColor: '#0284c733',
                borderColor: '#38bdf84d',
                color: '#38bdf8',
              }}
            >
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight" style={{ color: '#ffffff' }}>
                Inquiry Analytics & Pipeline Trends
              </h2>
              <p className="text-xs" style={{ color: '#bae6fdcc' }}>
                Inquiry volume, pipeline progression, and service demand metrics
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div 
          className="flex items-center gap-1 p-1 rounded-xl border text-xs self-start md:self-auto shrink-0 flex-wrap"
          style={{
            backgroundColor: '#061730',
            borderColor: '#93c5fd40',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('monthly')}
            className="px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5"
            style={
              activeTab === 'monthly'
                ? {
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px #1e3a8a80',
                  }
                : {
                    backgroundColor: 'transparent',
                    color: '#bae6fd',
                  }
            }
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Monthly Trends</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('funnel')}
            className="px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5"
            style={
              activeTab === 'funnel'
                ? {
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px #312e8180',
                  }
                : {
                    backgroundColor: 'transparent',
                    color: '#bae6fd',
                  }
            }
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Pipeline Funnel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className="px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5"
            style={
              activeTab === 'services'
                ? {
                    backgroundColor: '#0d9488',
                    color: '#ffffff',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px #134e4a80',
                  }
                : {
                    backgroundColor: 'transparent',
                    color: '#bae6fd',
                  }
            }
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
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: '#ffffff' }}>
                {totalYearVolume}
              </span>
              <span className="text-xs font-medium" style={{ color: '#bae6fdcc' }}>
                total inquiries in {selectedYear}
              </span>

              {momGrowth !== null && (
                <span 
                  className="text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded-md border ml-auto sm:ml-0"
                  style={
                    momGrowth >= 0
                      ? {
                          backgroundColor: '#10b98133',
                          color: '#6ee7b7',
                          borderColor: '#34d39966',
                        }
                      : {
                          backgroundColor: '#f43f5e33',
                          color: '#fca5a5',
                          borderColor: '#fb718566',
                        }
                  }
                >
                  {momGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {momGrowth >= 0 ? `+${momGrowth}%` : `${momGrowth}%`} MoM
                </span>
              )}
            </div>

            {/* Filter Dropdown & Year Selection */}
            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
              {isFilterLoading && (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" style={{ color: '#38bdf8' }} />
              )}

              <span className="text-xs font-medium flex items-center gap-1" style={{ color: '#bae6fd' }}>
                <Filter className="w-3 h-3" style={{ color: '#38bdf8' }} />
                Service:
              </span>
              <select
                value={selectedService}
                onChange={(e) => handleServiceChange(e.target.value)}
                aria-label="Filter Trends by Service"
                className="border rounded-xl px-2.5 py-1 text-xs focus:outline-none cursor-pointer"
                style={{
                  backgroundColor: '#061834',
                  borderColor: '#93c5fd4d',
                  color: '#ffffff',
                }}
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
                className="border rounded-xl px-2.5 py-1 text-xs focus:outline-none cursor-pointer font-mono"
                style={{
                  backgroundColor: '#061834',
                  borderColor: '#93c5fd4d',
                  color: '#ffffff',
                }}
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
                className="px-2.5 py-1 rounded-lg transition-all text-[11px] whitespace-nowrap cursor-pointer border"
                style={
                  selectedService === 'all'
                    ? {
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        borderColor: '#60a5fa80',
                        fontWeight: 600,
                      }
                    : {
                        backgroundColor: '#071b3866',
                        color: '#bae6fd',
                        borderColor: '#93c5fd40',
                      }
                }
              >
                All Services
              </button>
              {availableServices.slice(0, 5).map((svc) => (
                <button
                  key={svc}
                  type="button"
                  onClick={() => handleServiceChange(svc)}
                  className="px-2.5 py-1 rounded-lg transition-all text-[11px] whitespace-nowrap cursor-pointer border"
                  style={
                    selectedService === svc
                      ? {
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          borderColor: '#60a5fa80',
                          fontWeight: 600,
                        }
                      : {
                          backgroundColor: '#071b3866',
                          color: '#bae6fd',
                          borderColor: '#93c5fd40',
                        }
                  }
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
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="trendsLineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#818cf8" />
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
                        stroke="#93c5fd26"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingX - 8}
                        y={y + 3}
                        textAnchor="end"
                        fontSize="9"
                        fill="#bae6fdc0"
                        fontFamily="monospace"
                        fontWeight="600"
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
                        stroke="#38bdf899"
                        strokeDasharray="2 2"
                      />
                    )}

                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredIndex === i ? 6.5 : 4}
                      className="transition-all duration-150 cursor-pointer"
                      fill="#071b36"
                      stroke={pt.val > 0 ? '#38bdf8' : '#60a5fa'}
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
                  className="absolute top-0 left-1/2 -translate-x-1/2 rounded-xl p-3 shadow-2xl z-30 pointer-events-none text-xs flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 animate-in fade-in duration-100 backdrop-blur-md border"
                  style={{
                    backgroundColor: '#061730f2',
                    borderColor: '#38bdf866',
                    boxShadow: '0 10px 25px #020617cc',
                  }}
                >
                  <div>
                    <p className="font-medium" style={{ color: '#bae6fd' }}>
                      {points[hoveredIndex].raw.monthName} {selectedYear}
                    </p>
                    <p className="font-extrabold text-sm flex items-center gap-1.5" style={{ color: '#ffffff' }}>
                      <span>{points[hoveredIndex].val} Inquiries</span>
                      {points[hoveredIndex].raw.winRatePercentage > 0 && (
                        <span 
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                          style={{
                            color: '#6ee7b7',
                            backgroundColor: '#10b98133',
                            borderColor: '#34d3994d',
                          }}
                        >
                          {points[hoveredIndex].raw.winRatePercentage}% Won
                        </span>
                      )}
                    </p>
                  </div>

                  <div 
                    className="border-t sm:border-t-0 sm:border-l pt-2 sm:pt-0 sm:pl-3 text-[11px] grid grid-cols-2 gap-x-3 gap-y-1"
                    style={{
                      borderColor: '#93c5fd33',
                      color: '#e0f2fee6',
                    }}
                  >
                    <div>New: <span className="font-bold" style={{ color: '#38bdf8' }}>{(points[hoveredIndex].raw.statusBreakdown as Record<string, number>)?.['new'] ?? 0}</span></div>
                    <div>In Review: <span className="font-bold" style={{ color: '#fbbf24' }}>{(points[hoveredIndex].raw.statusBreakdown as Record<string, number>)?.['in_review'] ?? 0}</span></div>
                    <div>Won: <span className="font-bold" style={{ color: '#34d399' }}>{points[hoveredIndex].raw.wonLeads}</span></div>
                    <div>In Progress: <span className="font-bold" style={{ color: '#818cf8' }}>{points[hoveredIndex].raw.inProgressLeads}</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* X-Axis Month Labels */}
            <div 
              className="flex justify-between px-2 sm:px-6 pt-2 text-[10px] sm:text-[11px] font-semibold border-t min-w-[580px]"
              style={{
                borderColor: '#93c5fd33',
                color: '#bae6fdcc',
              }}
            >
              {trendsData.map((d, i) => (
                <span 
                  key={i} 
                  className="text-center transition-colors"
                  style={{
                    color: hoveredIndex === i ? '#38bdf8' : '#bae6fdcc',
                    fontWeight: hoveredIndex === i ? 700 : 600,
                  }}
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
            <span className="font-medium" style={{ color: '#bae6fd' }}>
              Pipeline Stage Progression & Dwell Time ({funnelAnalytics?.totalLeadsInFunnel ?? 0} total leads)
            </span>
            <span className="font-semibold" style={{ color: '#38bdf8' }}>
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
                    className="p-3 rounded-xl border transition-all space-y-2"
                    style={{
                      backgroundColor: '#07162dbf',
                      borderColor: '#93c5fd33',
                    }}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: stage.color || '#38bdf8' }}
                        />
                        <span className="font-semibold" style={{ color: '#ffffff' }}>{stage.title}</span>
                      </div>

                      <div className="flex items-center gap-3 font-mono">
                        <span className="font-bold" style={{ color: '#ffffff' }}>{stage.leadCount} leads</span>
                        <span className="font-semibold" style={{ color: '#38bdf8' }}>{pct}%</span>
                      </div>
                    </div>

                    {/* Funnel Stage Bar */}
                    <div 
                      className="w-full h-2 rounded-full border overflow-hidden"
                      style={{
                        backgroundColor: '#061730',
                        borderColor: '#93c5fd33',
                      }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(pct, 2)}%`,
                          backgroundColor: stage.color || '#38bdf8',
                        }}
                      />
                    </div>

                    {/* Drop-off rate & dwell time */}
                    <div className="flex items-center justify-between text-[10px] pt-0.5" style={{ color: '#bae6fdcc' }}>
                      <span>Drop-off: {stage.dropOffRatePercentage}%</span>
                      <span>Avg Dwell: {stage.avgDwellTimeHours > 0 ? `${stage.avgDwellTimeHours} hrs` : 'Immediate'}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div 
                className="p-8 text-center text-xs rounded-xl border"
                style={{
                  backgroundColor: '#07162d99',
                  borderColor: '#93c5fd26',
                  color: '#bae6fdb3',
                }}
              >
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
            <span className="font-medium" style={{ color: '#bae6fd' }}>
              Inquiry Share & Performance by Service Offering
            </span>
            <span className="font-semibold" style={{ color: '#34d399' }}>
              Demand Distribution
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {serviceAnalytics?.services && serviceAnalytics.services.length > 0 ? (
              serviceAnalytics.services.map((svc) => (
                <div
                  key={svc.service}
                  className="p-3.5 rounded-xl border transition-all space-y-2.5"
                  style={{
                    backgroundColor: '#07162dbf',
                    borderColor: '#93c5fd33',
                  }}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold truncate max-w-[200px]" style={{ color: '#ffffff' }}>
                      {svc.service}
                    </span>
                    <span className="font-bold font-mono" style={{ color: '#34d399' }}>
                      {svc.sharePercentage}% share
                    </span>
                  </div>

                  {/* Share Progress Bar */}
                  <div 
                    className="w-full h-2 rounded-full border overflow-hidden"
                    style={{
                      backgroundColor: '#061730',
                      borderColor: '#93c5fd33',
                    }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.max(svc.sharePercentage, 3)}%`,
                        background: 'linear-gradient(90deg, #38bdf8 0%, #34d399 100%)',
                      }}
                    />
                  </div>

                  {/* Volume Metrics */}
                  <div 
                    className="flex items-center justify-between text-[11px] pt-1 border-t"
                    style={{
                      borderColor: '#93c5fd26',
                      color: '#bae6fdcc',
                    }}
                  >
                    <span>{svc.totalInquiries} total inquiries</span>
                    <span className="flex items-center gap-2">
                      <span className="font-semibold" style={{ color: '#34d399' }}>{svc.wonCount} won</span>
                      <span>•</span>
                      <span className="font-semibold" style={{ color: '#bae6fd' }}>{svc.inProgressCount} active</span>
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div 
                className="col-span-2 p-8 text-center text-xs rounded-xl border"
                style={{
                  backgroundColor: '#07162d99',
                  borderColor: '#93c5fd26',
                  color: '#bae6fdb3',
                }}
              >
                No service offering breakdown available yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
