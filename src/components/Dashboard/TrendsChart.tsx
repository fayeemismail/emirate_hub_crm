'use client';

import React, { useMemo, useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { MonthlyTrendItem } from '../../lib/api';

interface TrendsChartProps {
  trends: MonthlyTrendItem[];
  /** Same calendar months for previous year (optional compare layer). */
  previousYearTrends?: MonthlyTrendItem[] | null;
  previousYear?: number | null;
  chartKey: string | number;
}

function niceMax(raw: number): number {
  if (raw <= 5) return 5;
  if (raw <= 10) return 10;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = magnitude >= 10 ? magnitude / 2 : magnitude;
  return Math.ceil(raw / step) * step;
}

function formatMom(value: number | null | undefined): string | null {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  const rounded = Number(value.toFixed(1));
  const label =
    rounded % 1 === 0 ? String(Math.round(rounded)) : rounded.toFixed(1);
  return rounded > 0 ? `+${label}%` : `${label}%`;
}

export const TrendsChart: React.FC<TrendsChartProps> = ({
  trends,
  previousYearTrends = null,
  previousYear = null,
  chartKey,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const svgWidth = 720;
  const svgHeight = 248;
  const padL = 40;
  const padR = 16;
  const padT = 28;
  const padB = 36;
  const plotW = svgWidth - padL - padR;
  const plotH = svgHeight - padT - padB;
  const baselineY = padT + plotH;

  const values = trends.map((t) => t.totalLeads);
  const prevValues = previousYearTrends?.map((t) => t.totalLeads) ?? [];
  const avg =
    values.length > 0
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0;

  const maxVal = niceMax(Math.max(...values, ...prevValues, avg, 1));

  const yTicks = useMemo(() => {
    const steps = 4;
    return Array.from({ length: steps + 1 }, (_, i) =>
      Math.round((maxVal * i) / steps)
    );
  }, [maxVal]);

  const n = Math.max(trends.length, 1);
  const slot = plotW / n;
  const barW = Math.min(28, slot * 0.55);

  const points = trends.map((d, i) => {
    const x = padL + slot * i + slot / 2;
    const y = baselineY - (d.totalLeads / maxVal) * plotH;
    return { x, y, val: d.totalLeads, label: d.monthName.slice(0, 3), raw: d, i };
  });

  const prevPoints =
    previousYearTrends && previousYearTrends.length === trends.length
      ? previousYearTrends.map((d, i) => {
          const x = padL + slot * i + slot / 2;
          const y = baselineY - (d.totalLeads / maxVal) * plotH;
          return { x, y, val: d.totalLeads };
        })
      : null;

  const linePath = points.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1]!.x} ${baselineY} L ${points[0]!.x} ${baselineY} Z`
      : '';
  const prevLinePath = prevPoints
    ? prevPoints.reduce(
        (acc, pt, i) =>
          i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`,
        ''
      )
    : '';

  const avgY = baselineY - (avg / maxVal) * plotH;

  const hovered = hoveredIndex !== null ? points[hoveredIndex] : null;
  const hoveredPrev =
    hoveredIndex !== null && prevPoints ? prevPoints[hoveredIndex] : null;

  const tooltipAnchor = useMemo(() => {
    if (!hovered) return null;
    const leftPct = (hovered.x / svgWidth) * 100;
    const preferLeft = leftPct > 68;
    return {
      leftPct,
      preferLeft,
      top: Math.max(8, hovered.y - 10),
    };
  }, [hovered]);

  const momLabel = hovered ? formatMom(hovered.raw.momChangePercentage) : null;
  const momPositive =
    hovered?.raw.momChangePercentage != null &&
    hovered.raw.momChangePercentage >= 0;

  return (
    <div key={chartKey} className="relative w-full overflow-x-auto">
      <div className="relative min-w-[560px]">
        {/* Legend */}
        <div
          className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]"
          style={{ color: '#A8A29E' }}
        >
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-0.5 w-3 rounded-full"
              style={{ backgroundColor: '#E02126' }}
            />
            Volume
          </span>
          {prevPoints && previousYear != null && (
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-px w-3 border-t border-dashed"
                style={{ borderColor: '#A8A29E' }}
              />
              {previousYear}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-px w-3 border-t border-dashed"
              style={{ borderColor: '#D6D3D1' }}
            />
            Avg {avg > 0 ? avg.toFixed(avg >= 10 ? 0 : 1) : '0'}
          </span>
        </div>

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
          role="img"
          aria-label="Monthly inquiry volume chart"
        >
          <defs>
            <linearGradient id="trendsFillV2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E02126" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#E02126" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="trendsBarFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E02126" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#E02126" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Y grid + labels */}
          {yTicks.map((tick) => {
            const y = baselineY - (tick / maxVal) * plotH;
            return (
              <g key={tick}>
                <line
                  x1={padL}
                  y1={y}
                  x2={svgWidth - padR}
                  y2={y}
                  stroke="#F5F5F4"
                  strokeWidth="1"
                />
                <text
                  x={padL - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  fill="#A8A29E"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Average guide */}
          {avg > 0 && (
            <line
              x1={padL}
              y1={avgY}
              x2={svgWidth - padR}
              y2={avgY}
              stroke="#D6D3D1"
              strokeWidth="1"
              strokeDasharray="4 4"
              className="crm-chart-fade"
            />
          )}

          {/* Volume bars */}
          <g className="crm-chart-bars">
            {points.map((pt, i) => {
              const h = Math.max(0, baselineY - pt.y);
              const active = hoveredIndex === i;
              return (
                <rect
                  key={`bar-${pt.raw.month}`}
                  x={pt.x - barW / 2}
                  y={pt.y}
                  width={barW}
                  height={h}
                  rx="4"
                  fill="url(#trendsBarFill)"
                  opacity={hoveredIndex === null || active ? 1 : 0.4}
                  style={{ ['--crm-item-i' as string]: i } as React.CSSProperties}
                  className="crm-chart-bar"
                />
              );
            })}
          </g>

          {/* Previous year compare */}
          {prevLinePath && (
            <path
              d={prevLinePath}
              fill="none"
              stroke="#A8A29E"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="5 4"
              className="crm-chart-line-prev"
            />
          )}

          {/* Area + current line */}
          {areaPath && (
            <path
              d={areaPath}
              fill="url(#trendsFillV2)"
              className="crm-chart-area"
            />
          )}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#E02126"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="crm-chart-line"
              pathLength={1}
            />
          )}

          {/* Points + hit targets + month labels */}
          {points.map((pt, i) => {
            const active = hoveredIndex === i;
            return (
              <g
                key={pt.raw.month}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <rect
                  x={pt.x - slot / 2}
                  y={padT - 8}
                  width={slot}
                  height={plotH + padB}
                  fill="transparent"
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={active ? 5 : 3.5}
                  fill={active ? '#E02126' : '#FFFFFF'}
                  stroke="#E02126"
                  strokeWidth="2"
                />
                <text
                  x={pt.x}
                  y={svgHeight - 10}
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

        {/* Hover readout card */}
        {hovered && tooltipAnchor && (
          <div
            className="pointer-events-none absolute z-10"
            style={{
              top: tooltipAnchor.top,
              left: tooltipAnchor.preferLeft ? undefined : `${tooltipAnchor.leftPct}%`,
              right: tooltipAnchor.preferLeft
                ? `${100 - tooltipAnchor.leftPct}%`
                : undefined,
              marginLeft: tooltipAnchor.preferLeft ? undefined : 8,
              marginRight: tooltipAnchor.preferLeft ? 8 : undefined,
              transform: 'translateY(-100%)',
            }}
          >
            <div
              className="crm-chart-tooltip min-w-[9.5rem] rounded-xl border px-3 py-2.5"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E7E5E4',
                boxShadow: '0 12px 28px rgba(28, 25, 23, 0.12)',
              }}
            >
              <p
                className="text-[11px] font-medium uppercase tracking-wide"
                style={{ color: '#A8A29E' }}
              >
                {hovered.raw.monthName}
              </p>
              <p
                className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight"
                style={{ color: '#1C1917' }}
              >
                {hovered.val}
                <span
                  className="ml-1 text-xs font-normal"
                  style={{ color: '#78716C' }}
                >
                  leads
                </span>
              </p>
              <div
                className="mt-2 space-y-1 border-t pt-2 text-[11px]"
                style={{ borderColor: '#F5F5F4', color: '#78716C' }}
              >
                {momLabel && (
                  <p className="flex items-center justify-between gap-3">
                    <span>vs prior month</span>
                    <span
                      className="inline-flex items-center gap-0.5 font-semibold tabular-nums"
                      style={{ color: momPositive ? '#15803D' : '#E02126' }}
                    >
                      {momPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {momLabel}
                    </span>
                  </p>
                )}
                <p className="flex items-center justify-between gap-3">
                  <span>Won / lost</span>
                  <span
                    className="font-medium tabular-nums"
                    style={{ color: '#1C1917' }}
                  >
                    {hovered.raw.wonLeads} · {hovered.raw.lostLeads}
                  </span>
                </p>
                {hoveredPrev && previousYear != null && (
                  <p className="flex items-center justify-between gap-3">
                    <span>{previousYear}</span>
                    <span
                      className="font-medium tabular-nums"
                      style={{ color: '#1C1917' }}
                    >
                      {hoveredPrev.val}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
