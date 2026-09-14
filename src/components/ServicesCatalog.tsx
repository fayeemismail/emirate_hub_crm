'use client';

import React from 'react';
import { COMPANY_SERVICES } from '../data/mockData';
import { Layers, Code, Bot, Cloud, Layout, Briefcase, Smartphone, ShieldCheck, ArrowUpRight } from 'lucide-react';

export const ServicesCatalog: React.FC = () => {
  const getIcon = (index: number) => {
    const icons = [Code, Bot, Cloud, Layout, Briefcase, Smartphone, ShieldCheck];
    const IconComponent = icons[index % icons.length];
    return <IconComponent className="w-5 h-5 text-indigo-400" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          Emirate Hub Company Services Catalog
        </h2>
        <p className="text-xs text-gray-400">
          Services presented on Emirate Hub website for visitor inquiries
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMPANY_SERVICES.map((serviceName, idx) => (
          <div
            key={serviceName}
            className="glass-card glass-card-hover rounded-2xl p-5 border border-white/5 space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  {getIcon(idx)}
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active Offering
                </span>
              </div>

              <h3 className="text-base font-semibold text-white pt-1">{serviceName}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Full lifecycle engineering, strategy, and deployment services tailored for high-growth enterprises and tech ventures.
              </p>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="text-gray-500">Form Enabled</span>
              <span className="text-indigo-400 font-medium flex items-center gap-1 hover:underline cursor-pointer">
                Configure <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
