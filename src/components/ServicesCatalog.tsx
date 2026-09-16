'use client';

import React from 'react';
import { COMPANY_SERVICES } from '../data/mockData';
import { Layers, Code, Bot, Cloud, Layout, Briefcase, Smartphone, ShieldCheck, ArrowUpRight } from 'lucide-react';

export const ServicesCatalog: React.FC = () => {
  const getIcon = (index: number) => {
    const icons = [Code, Bot, Cloud, Layout, Briefcase, Smartphone, ShieldCheck];
    const IconComponent = icons[index % icons.length];
    return <IconComponent className="w-5 h-5 text-[#38bdf8]" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: '#ffffff' }}>
          <Layers className="w-5 h-5 text-[#38bdf8]" />
          Emirate Hub Company Services Catalog
        </h2>
        <p className="text-xs" style={{ color: '#bae6fdcc' }}>
          Services presented on Emirate Hub website for visitor inquiries
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMPANY_SERVICES.map((serviceName, idx) => (
          <div
            key={serviceName}
            className="rounded-2xl p-5 border space-y-3 flex flex-col justify-between backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: '#0d284ce6',
              borderColor: '#93c5fd40',
              boxShadow: '0 10px 30px #040f1eb3',
            }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div 
                  className="p-2.5 rounded-xl border"
                  style={{
                    backgroundColor: '#0284c726',
                    borderColor: '#38bdf84d',
                  }}
                >
                  {getIcon(idx)}
                </div>
                <span 
                  className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border"
                  style={{
                    backgroundColor: '#10b98126',
                    color: '#34d399',
                    borderColor: '#10b9814d',
                  }}
                >
                  Active Offering
                </span>
              </div>

              <h3 className="text-base font-semibold pt-1" style={{ color: '#ffffff' }}>{serviceName}</h3>
              <p className="text-xs leading-relaxed" style={{ color: '#bae6fdcc' }}>
                Full lifecycle engineering, strategy, and deployment services tailored for high-growth enterprises and tech ventures.
              </p>
            </div>

            <div 
              className="pt-3 border-t flex items-center justify-between text-xs"
              style={{ borderColor: '#93c5fd26' }}
            >
              <span style={{ color: '#93c5fdb3' }}>Form Enabled</span>
              <span 
                className="font-medium flex items-center gap-1 cursor-pointer hover:underline"
                style={{ color: '#38bdf8' }}
              >
                Configure <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
