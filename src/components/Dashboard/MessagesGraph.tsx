'use client';

import React, { useState } from 'react';
import { MessagesGraphData } from '../../types';
import { TrendingUp, MessageSquare } from 'lucide-react';

interface MessagesGraphProps {
  data: MessagesGraphData[];
}

export const MessagesGraph: React.FC<MessagesGraphProps> = ({ data }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'webDev' | 'aiAutomation' | 'cloudMigration' | 'designUiUx'>('all');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Compute total volume & max value
  const totalVolume = data.reduce((acc, curr) => acc + curr.total, 0);
  const maxVal = Math.max(...data.map(d => {
    if (activeCategory === 'all') return d.total;
    if (activeCategory === 'webDev') return d.webDev;
    if (activeCategory === 'aiAutomation') return d.aiAutomation;
    if (activeCategory === 'cloudMigration') return d.cloudMigration;
    return d.designUiUx;
  }), 1);

  // Calculate SVG Points
  const svgWidth = 700;
  const svgHeight = 220;
  const paddingX = 30;
  const paddingY = 25;

  const points = data.map((d, i) => {
    const val = activeCategory === 'all' ? d.total : d[activeCategory];
    const x = paddingX + (i / (data.length - 1)) * (svgWidth - 2 * paddingX);
    const y = svgHeight - paddingY - (val / maxVal) * (svgHeight - 2 * paddingY);
    return { x, y, val, label: d.label, raw: d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  return (
    <div className="formal-card rounded-2xl p-4 sm:p-6 border border-white/10 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                All Messages Graph
              </h2>
              <p className="text-xs text-slate-400">
                Incoming consultancy inquiries volume received over time
              </p>
            </div>
          </div>
        </div>

        {/* Category Filters - Wrap on small mobile */}
        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/10 text-xs flex-wrap self-start sm:self-auto">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeCategory === 'all' 
                ? 'bg-sky-500 text-white font-semibold shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Messages
          </button>
          <button
            onClick={() => setActiveCategory('webDev')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeCategory === 'webDev' 
                ? 'bg-sky-500 text-white font-semibold shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Web Dev
          </button>
          <button
            onClick={() => setActiveCategory('aiAutomation')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeCategory === 'aiAutomation' 
                ? 'bg-sky-500 text-white font-semibold shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            AI & Automation
          </button>
        </div>
      </div>

      {/* Metric Highlight */}
      <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mb-4">
        <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {totalVolume}
        </span>
        <span className="text-xs text-slate-400 font-medium">
          total messages logged across past 7 days
        </span>
        <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 ml-auto bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
          <TrendingUp className="w-3 h-3" />
          +18.4% growth
        </span>
      </div>

      {/* Responsive SVG Chart Container */}
      <div className="relative w-full overflow-x-auto scrollbar-none">
        <div className="min-w-[500px] w-full">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible"
          >
            <defs>
              <linearGradient id="formalGlowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="formalLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>

            {/* Grid Horizontal Lines */}
            {[0, 0.33, 0.66, 1].map((pct, idx) => {
              const y = paddingY + pct * (svgHeight - 2 * paddingY);
              return (
                <line
                  key={idx}
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Area Fill */}
            <path d={areaD} fill="url(#formalGlowGradient)" />

            {/* Line */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#formalLineGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points */}
            {points.map((pt, i) => (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredIndex === i ? 6 : 4}
                  className="transition-all duration-150 cursor-pointer"
                  fill="#0f172a"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

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
              </g>
            ))}
          </svg>
        </div>

        {/* Hover Tooltip */}
        {hoveredIndex !== null && (
          <div 
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-800 border border-sky-500/30 rounded-xl p-3 shadow-xl z-20 pointer-events-none text-xs flex items-center gap-4 animate-in fade-in"
          >
            <div>
              <p className="text-slate-400 font-medium">{points[hoveredIndex].label}</p>
              <p className="text-white font-bold text-sm">{points[hoveredIndex].val} Messages</p>
            </div>
            <div className="border-l border-white/10 pl-3 text-[11px] text-slate-300 space-y-0.5">
              <div>Web Dev: <span className="text-sky-400 font-bold">{points[hoveredIndex].raw.webDev}</span></div>
              <div>AI & Auto: <span className="text-indigo-400 font-bold">{points[hoveredIndex].raw.aiAutomation}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Axis X */}
      <div className="flex justify-between px-2 sm:px-6 pt-2 text-[10px] sm:text-[11px] text-slate-400 font-semibold border-t border-white/10">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
};
