'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  MonthlyTrendsResponse,
  ServiceAnalyticsResponse,
  FunnelAnalyticsResponse,
  OverviewKpi,
} from '../../types';
import { analyticsApi } from '../../lib/api';
import { CustomSelect } from '../ui/CustomSelect';
import { Spinner, ChartSkeleton, LoadingOverlay } from '../ui/loading';

interface MessagesGraphProps {
  monthlyTrends?: MonthlyTrendsResponse | null;
  serviceAnalytics?: ServiceAnalyticsResponse | null;
  funnelAnalytics?: FunnelAnalyticsResponse | null;
  overviewKpi?: OverviewKpi | null;
  isLoading?: boolean;
}

const TABS = [
  { id: 'monthly' as const, label: 'Trends' },
  { id: 'funnel' as const, label: 'Pipeline' },
  { id: 'services' as const, label: 'Services' },
];

export const MessagesGraph: React.FC<MessagesGraphProps> = ({
  monthlyTrends: initialMonthlyTrends,
  serviceAnalytics,
  funnelAnalytics,
  overviewKpi,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'monthly' | 'funnel' | 'services'>('monthly');
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedService, setSelectedService] = useState<string>('all');
  const [currentTrends, setCurrentTrends] = useState<MonthlyTrendsResponse | null>(
    initialMonthlyTrends || null
  );
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    if (initialMonthlyTrends) {
      if (selectedYear === currentYear && selectedService === 'all') {
        setCurrentTrends(initialMonthlyTrends);
      }
      setIsFilterLoading(false);
    }
  }, [initialMonthlyTrends, selectedYear, selectedService, currentYear]);

  const handleYearChange = async (year: number) => {
    setSelectedYear(year);
    setIsFilterLoading(true);
    try {
      const res = await analyticsApi.getMonthlyTrends({
        year,
        service: selectedService !== 'all' ? selectedService : undefined,
      });
      if (res.data) setCurrentTrends(res.data);
    } catch (err) {
      console.error('Failed to load filtered monthly trends:', err);
    } finally {
      setIsFilterLoading(false);
    }
  };

  const handleServiceChange = async (service: string) => {
    setSelectedService(service);
    setIsFilterLoading(true);
    try {
      const res = await analyticsApi.getMonthlyTrends({
        year: selectedYear,
        service: service !== 'all' ? service : undefined,
      });
      if (res.data) setCurrentTrends(res.data);
    } catch (err) {
      console.error('Failed to load filtered monthly trends:', err);
    } finally {
      setIsFilterLoading(false);
    }
  };

  const trendsData = useMemo(() => {
    if (currentTrends?.trends && currentTrends.trends.length > 0) {
      return currentTrends.trends;
    }
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

  const totalYearVolume = currentTrends?.totalYearLeads ?? trendsData.reduce((acc, t) => acc + t.totalLeads, 0);
  const maxVal = Math.max(...trendsData.map((d) => d.totalLeads), 5);

  const svgWidth = 720;
  const svgHeight = 200;
  const paddingX = 28;
  const paddingY = 24;

  const points = trendsData.map((d, i) => {
    const val = d.totalLeads;
    const x = paddingX + (i / (trendsData.length - 1)) * (svgWidth - 2 * paddingX);
    const y = svgHeight - paddingY - (val / maxVal) * (svgHeight - 2 * paddingY);
    return { x, y, val, label: d.monthName.slice(0, 3), raw: d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
      : '';

  const peakMonth = useMemo(() => {
    if (!trendsData.length) return null;
    return trendsData.reduce((best, cur) =>
      cur.totalLeads > best.totalLeads ? cur : best
    );
  }, [trendsData]);

  const availableServices = useMemo(() => {
    if (!serviceAnalytics?.services) return [];
    return serviceAnalytics.services.map((s) => s.service);
  }, [serviceAnalytics]);

  const momGrowth = overviewKpi?.momGrowthPercentage ?? null;

  const yearOptions = useMemo(
    () =>
      [currentYear, currentYear - 1, currentYear - 2].map((yr) => ({
        value: String(yr),
        label: String(yr),
      })),
    [currentYear]
  );

  const serviceOptions = useMemo(
    () => [
      { value: 'all', label: 'All services' },
      ...availableServices.map((svc) => ({ value: svc, label: svc })),
    ],
    [availableServices]
  );

  if (isLoading) {
    return <ChartSkeleton />;
  }

  return (
    <div
      className="relative rounded-2xl border px-5 py-5 sm:px-6 sm:py-6 space-y-6"
      style={{
        backgroundColor: 'var(--crm-card-bg, #FFFFFF)',
        borderColor: 'var(--crm-card-border, #E7E5E4)',
      }}
    >
      <LoadingOverlay visible={isFilterLoading} label="Updating chart…" />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2
          className="text-base font-semibold tracking-tight"
          style={{ color: 'var(--crm-text-primary, #1C1917)' }}
        >
          Analytics
        </h2>

        <div className="flex items-center gap-1 border-b sm:border-b-0" style={{ borderColor: '#E7E5E4' }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="relative px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
                style={{
                  color: active
                    ? 'var(--crm-text-primary, #1C1917)'
                    : 'var(--crm-text-muted, #A8A29E)',
                }}
              >
                {tab.label}
                {active && (
                  <span
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full sm:bottom-0"
                    style={{ backgroundColor: 'var(--crm-accent-primary, #E02126)' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trends */}
      {activeTab === 'monthly' && (
        <div>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm" style={{ color: '#78716C' }}>
                Monthly volume
              </p>
              <div className="mt-1 flex items-baseline gap-2.5">
                <span
                  className="text-3xl font-semibold tracking-tight tabular-nums"
                  style={{ color: 'var(--crm-text-primary, #1C1917)' }}
                >
                  {totalYearVolume}
                </span>
                <span className="text-sm" style={{ color: '#78716C' }}>
                  in {selectedYear}
                </span>
                {momGrowth !== null && (
                  <span
                    className="inline-flex items-center gap-0.5 text-sm font-medium"
                    style={{ color: momGrowth >= 0 ? '#15803D' : '#E02126' }}
                  >
                    {momGrowth >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {momGrowth >= 0 ? `+${momGrowth}%` : `${momGrowth}%`}
                  </span>
                )}
              </div>
              {peakMonth && peakMonth.totalLeads > 0 && (
                <p className="mt-1.5 text-xs" style={{ color: '#A8A29E' }}>
                  Peak{' '}
                  <span style={{ color: '#78716C' }}>
                    {peakMonth.monthName} · {peakMonth.totalLeads}
                  </span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isFilterLoading && <Spinner size="xs" color="#A8A29E" />}
              {availableServices.length > 0 && (
                <CustomSelect
                  value={selectedService}
                  options={serviceOptions}
                  onChange={handleServiceChange}
                  ariaLabel="Filter by service"
                  minWidth={160}
                  align="right"
                />
              )}
              <CustomSelect
                value={String(selectedYear)}
                options={yearOptions}
                onChange={(yr) => handleYearChange(Number(yr))}
                ariaLabel="Select year"
                minWidth={100}
                align="right"
              />
            </div>
          </div>

          <div className="relative w-full overflow-x-auto">
            <div className="relative min-w-[520px]">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight + 28}`}
                className="w-full h-auto overflow-visible"
              >
                <defs>
                  <linearGradient id="trendsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E02126" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#E02126" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Soft baseline */}
                <line
                  x1={paddingX}
                  y1={svgHeight - paddingY}
                  x2={svgWidth - paddingX}
                  y2={svgHeight - paddingY}
                  stroke="#E7E5E4"
                  strokeWidth="1"
                />

                {/* Hover band */}
                {hoveredIndex !== null && (
                  <rect
                    x={points[hoveredIndex].x - (svgWidth - 2 * paddingX) / trendsData.length / 2}
                    y={paddingY - 8}
                    width={(svgWidth - 2 * paddingX) / trendsData.length}
                    height={svgHeight - 2 * paddingY + 16}
                    fill="rgba(224, 33, 38, 0.06)"
                    rx="4"
                  />
                )}

                {/* Area under curve */}
                <path d={areaD} fill="url(#trendsFill)" />

                {/* Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#E02126"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Points + month labels */}
                {points.map((pt, i) => {
                  const active = hoveredIndex === i;
                  const isPeak = peakMonth && pt.raw.month === peakMonth.month && pt.val > 0;
                  return (
                    <g
                      key={i}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      {/* Invisible hit area */}
                      <rect
                        x={pt.x - 16}
                        y={paddingY - 8}
                        width={32}
                        height={svgHeight - 2 * paddingY + 40}
                        fill="transparent"
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={active ? 5.5 : isPeak ? 4.5 : 3.5}
                        fill={active || isPeak ? '#E02126' : '#FFFFFF'}
                        stroke="#E02126"
                        strokeWidth="2"
                      />
                      {active && (
                        <text
                          x={pt.x}
                          y={pt.y - 14}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="600"
                          fill="#1C1917"
                        >
                          {pt.val}
                        </text>
                      )}
                      <text
                        x={pt.x}
                        y={svgHeight + 12}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight={active ? '600' : '400'}
                        fill={active ? '#1C1917' : '#A8A29E'}
                      >
                        {pt.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline — tapering funnel */}
      {activeTab === 'funnel' && (
        <div>
          <div className="mb-6 flex items-baseline justify-between gap-3">
            <p className="text-sm" style={{ color: '#78716C' }}>
              Stage progression
            </p>
            <p className="text-sm tabular-nums font-medium" style={{ color: '#1C1917' }}>
              {funnelAnalytics?.totalLeadsInFunnel ?? 0} in pipeline
            </p>
          </div>

          {funnelAnalytics?.stages && funnelAnalytics.stages.length > 0 ? (
            <div className="mx-auto flex w-full max-w-md flex-col items-center gap-1.5">
              {funnelAnalytics.stages.map((stage, index) => {
                const stageCount = funnelAnalytics.stages.length;
                // Narrow from ~100% at top to ~42% at bottom
                const widthPct = 100 - (index / Math.max(stageCount - 1, 1)) * 58;
                const opacity = 0.28 + (1 - index / Math.max(stageCount - 1, 1)) * 0.72;

                return (
                  <div
                    key={stage.slug}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 transition-all"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: `rgba(224, 33, 38, ${opacity.toFixed(2)})`,
                      clipPath:
                        index === stageCount - 1
                          ? 'polygon(8% 0, 92% 0, 100% 100%, 0 100%)'
                          : 'polygon(0 0, 100% 0, 96% 100%, 4% 100%)',
                      color: opacity > 0.55 ? '#FFFFFF' : '#1C1917',
                    }}
                  >
                    <span className="min-w-0 truncate text-sm font-medium">{stage.title}</span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {stage.leadCount}
                      <span className="ml-1.5 text-[11px] font-normal opacity-80">
                        {stage.percentageOfTotal}%
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-sm" style={{ color: '#A8A29E' }}>
              No pipeline data yet. Run <code className="text-xs">npm run seed</code> in crm-be.
            </p>
          )}
        </div>
      )}

      {/* Services — ranked table, no bars */}
      {activeTab === 'services' && (
        <div>
          <div className="mb-5 flex items-baseline justify-between gap-3">
            <p className="text-sm" style={{ color: '#78716C' }}>
              Ranked by demand
            </p>
            <p className="text-sm tabular-nums font-medium" style={{ color: '#1C1917' }}>
              {serviceAnalytics?.totalInquiries ?? 0} inquiries
            </p>
          </div>

          {serviceAnalytics?.services && serviceAnalytics.services.length > 0 ? (
            <div>
              <div
                className="mb-2 grid grid-cols-[2rem_1fr_4.5rem_3.5rem] gap-2 px-1 text-[11px] font-medium uppercase tracking-wide"
                style={{ color: '#A8A29E' }}
              >
                <span>#</span>
                <span>Service</span>
                <span className="text-right">Leads</span>
                <span className="text-right">Share</span>
              </div>
              <ul className="divide-y" style={{ borderColor: '#E7E5E4' }}>
                {[...serviceAnalytics.services]
                  .sort((a, b) => b.totalInquiries - a.totalInquiries)
                  .map((svc, index) => (
                    <li
                      key={svc.service}
                      className="grid grid-cols-[2rem_1fr_4.5rem_3.5rem] items-center gap-2 py-3 first:pt-2"
                      style={{ borderColor: '#E7E5E4' }}
                    >
                      <span
                        className="text-sm font-semibold tabular-nums"
                        style={{
                          color: index === 0 ? 'var(--crm-accent-primary, #E02126)' : '#A8A29E',
                        }}
                      >
                        {index + 1}
                      </span>
                      <span
                        className="min-w-0 truncate text-sm font-medium"
                        style={{ color: '#1C1917' }}
                      >
                        {svc.service}
                      </span>
                      <span
                        className="text-right text-sm font-semibold tabular-nums"
                        style={{ color: '#1C1917' }}
                      >
                        {svc.totalInquiries}
                      </span>
                      <span
                        className="text-right text-sm tabular-nums"
                        style={{ color: '#78716C' }}
                      >
                        {svc.sharePercentage}%
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ) : (
            <p className="py-8 text-center text-sm" style={{ color: '#A8A29E' }}>
              No service breakdown yet. Run <code className="text-xs">npm run seed</code> in crm-be.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
