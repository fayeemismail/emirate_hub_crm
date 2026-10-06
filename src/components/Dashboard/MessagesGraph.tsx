'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  MonthlyTrendsResponse,
  AvailableYearsResponse,
  ServiceAnalyticsResponse,
  FunnelAnalyticsResponse,
  OverviewKpi,
} from '../../types';
import { analyticsApi } from '../../lib/api';
import { CustomSelect } from '../ui/CustomSelect';
import { Spinner, ChartSkeleton } from '../ui/loading';
import { EmptyState } from '../ui/EmptyState';
import { Enter } from '../ui/motion';
import { TrendsChart } from './TrendsChart';

interface MessagesGraphProps {
  monthlyTrends?: MonthlyTrendsResponse | null;
  availableYears?: AvailableYearsResponse | null;
  serviceAnalytics?: ServiceAnalyticsResponse | null;
  funnelAnalytics?: FunnelAnalyticsResponse | null;
  overviewKpi?: OverviewKpi | null;
  isLoading?: boolean;
  /** Dashboard-wide refresh (metrics + analytics). */
  isRefreshing?: boolean;
}

const TABS = [
  { id: 'monthly' as const, label: 'Trends' },
  { id: 'funnel' as const, label: 'Pipeline' },
  { id: 'services' as const, label: 'Services' },
];

export const MessagesGraph: React.FC<MessagesGraphProps> = ({
  monthlyTrends: initialMonthlyTrends,
  availableYears,
  serviceAnalytics,
  funnelAnalytics,
  overviewKpi,
  isLoading = false,
  isRefreshing = false,
}) => {
  const [activeTab, setActiveTab] = useState<'monthly' | 'funnel' | 'services'>('monthly');
  const currentYear = availableYears?.currentYear ?? new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedService, setSelectedService] = useState<string>('all');
  const [currentTrends, setCurrentTrends] = useState<MonthlyTrendsResponse | null>(
    initialMonthlyTrends || null
  );
  const [previousYearTrends, setPreviousYearTrends] =
    useState<MonthlyTrendsResponse | null>(null);
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  // Keep selection valid when BE years arrive / refresh.
  useEffect(() => {
    const years = availableYears?.years;
    if (!years?.length) return;
    if (!years.includes(selectedYear)) {
      setSelectedYear(availableYears?.currentYear ?? years[0]!);
    }
  }, [availableYears, selectedYear]);

  useEffect(() => {
    if (initialMonthlyTrends) {
      if (selectedYear === currentYear && selectedService === 'all') {
        setCurrentTrends(initialMonthlyTrends);
      }
      setIsFilterLoading(false);
    }
  }, [initialMonthlyTrends, selectedYear, selectedService, currentYear]);

  // Prior-year compare layer (same service filter).
  useEffect(() => {
    let cancelled = false;
    const prevYear = selectedYear - 1;
    const years = availableYears?.years;
    const prevYearKnown = !years?.length || years.includes(prevYear);

    if (!prevYearKnown) {
      setPreviousYearTrends(null);
      return;
    }

    (async () => {
      try {
        const res = await analyticsApi.getMonthlyTrends({
          year: prevYear,
          service: selectedService !== 'all' ? selectedService : undefined,
        });
        if (!cancelled && res.data) {
          setPreviousYearTrends(res.data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load previous-year trends:', err);
          setPreviousYearTrends(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedYear, selectedService, availableYears?.years]);

  const loadTrends = async (year: number, service: string) => {
    setIsFilterLoading(true);
    try {
      const res = await analyticsApi.getMonthlyTrends({
        year,
        service: service !== 'all' ? service : undefined,
      });
      if (res.data) setCurrentTrends(res.data);
    } catch (err) {
      console.error('Failed to load filtered monthly trends:', err);
    } finally {
      setIsFilterLoading(false);
    }
  };

  const handleYearChange = async (year: number) => {
    setSelectedYear(year);
    await loadTrends(year, selectedService);
  };

  const handleServiceChange = async (service: string) => {
    setSelectedService(service);
    await loadTrends(selectedYear, service);
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
      momChangePercentage: 0 as number | null,
      statusBreakdown: {},
    }));
  }, [currentTrends, selectedYear]);

  const totalYearVolume =
    currentTrends?.totalYearLeads ??
    trendsData.reduce((acc, t) => acc + t.totalLeads, 0);

  const peakMonth = useMemo(() => {
    if (!trendsData.length) return null;
    return trendsData.reduce((best, cur) =>
      cur.totalLeads > best.totalLeads ? cur : best
    );
  }, [trendsData]);

  const compareYear = selectedYear - 1;
  const showPreviousYear =
    !!previousYearTrends?.trends?.length &&
    (previousYearTrends.totalYearLeads ?? 0) > 0 &&
    previousYearTrends.trends.length === trendsData.length;

  const availableServices = useMemo(() => {
    if (!serviceAnalytics?.services) return [];
    return serviceAnalytics.services.map((s) => s.service);
  }, [serviceAnalytics]);

  const momGrowth = overviewKpi?.momGrowthPercentage ?? null;

  const yearOptions = useMemo(() => {
    const years =
      availableYears?.years?.length
        ? availableYears.years
        : [currentYear];
    return years.map((yr) => ({
      value: String(yr),
      label: String(yr),
    }));
  }, [availableYears, currentYear]);

  const serviceOptions = useMemo(
    () => [
      { value: 'all', label: 'All services' },
      ...availableServices.map((svc) => ({ value: svc, label: svc })),
    ],
    [availableServices]
  );

  const chartKey = `${selectedYear}-${selectedService}-${totalYearVolume}`;

  if (isLoading) {
    return <ChartSkeleton />;
  }

  const showUpdating = isRefreshing || isFilterLoading;

  return (
    <div
      className="crm-enter relative rounded-2xl border px-5 py-5 sm:px-6 sm:py-6 space-y-6"
      style={{
        backgroundColor: 'var(--crm-card-bg, #FFFFFF)',
        borderColor: 'var(--crm-card-border, #E7E5E4)',
      }}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <h2
            className="text-base font-semibold tracking-tight"
            style={{ color: 'var(--crm-text-primary, #1C1917)' }}
          >
            Analytics
          </h2>
          {showUpdating ? (
            <span
              className="crm-fade-enter inline-flex items-center gap-1.5 text-xs font-medium"
              style={{ color: '#A8A29E' }}
              role="status"
              aria-live="polite"
            >
              <Spinner size="xs" color="#A8A29E" />
              Updating…
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1 border-b sm:border-b-0" style={{ borderColor: '#E7E5E4' }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="crm-interactive relative px-3 py-2 text-sm font-medium cursor-pointer"
                style={{
                  color: active
                    ? 'var(--crm-text-primary, #1C1917)'
                    : 'var(--crm-text-muted, #A8A29E)',
                }}
              >
                {tab.label}
                {active && (
                  <span
                    className="crm-tab-indicator absolute inset-x-2 -bottom-px h-0.5 rounded-full sm:bottom-0"
                    style={{ backgroundColor: 'var(--crm-accent-primary, #E02126)' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Enter key={activeTab} className="min-w-0">
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
                  {showPreviousYear && (
                    <>
                      {' '}
                      · vs {compareYear}{' '}
                      <span style={{ color: '#78716C' }}>
                        {previousYearTrends?.totalYearLeads ?? 0} total
                      </span>
                    </>
                  )}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
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

          {totalYearVolume === 0 ? (
            <EmptyState
              compact
              icon="chart"
              title="No trend data for this year"
              description="Monthly volume will show once leads are created."
            />
          ) : (
            <TrendsChart
              trends={trendsData}
              previousYearTrends={
                showPreviousYear ? previousYearTrends!.trends : null
              }
              previousYear={showPreviousYear ? compareYear : null}
              chartKey={chartKey}
            />
          )}
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
            <EmptyState
              compact
              icon="pipeline"
              title="No pipeline data yet"
              description="Funnel stages appear once Sanity statuses are live and leads enter the board."
            />
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
            <EmptyState
              compact
              icon="chart"
              title="No service breakdown yet"
              description="Demand by service shows up after inquiries start coming in."
            />
          )}
        </div>
      )}
      </Enter>
    </div>
  );
};
