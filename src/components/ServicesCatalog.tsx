'use client';

import React from 'react';
import { CatalogService } from '../types';
import { EmptyState } from './ui/EmptyState';
import {
  Layers,
  Code,
  Bot,
  Cloud,
  Layout,
  Briefcase,
  Smartphone,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';

interface ServicesCatalogProps {
  catalogServices: CatalogService[];
}

export const ServicesCatalog: React.FC<ServicesCatalogProps> = ({
  catalogServices,
}) => {
  const getIcon = (index: number) => {
    const icons = [Code, Bot, Cloud, Layout, Briefcase, Smartphone, ShieldCheck];
    const IconComponent = icons[index % icons.length];
    return <IconComponent className="w-5 h-5 text-[#E02126]" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2
          className="text-xl font-bold tracking-tight flex items-center gap-2"
          style={{ color: 'var(--crm-text-primary, #1C1917)' }}
        >
          <Layers className="w-5 h-5 text-[#E02126]" />
          Emirate Hub Company Services Catalog
        </h2>
        <p className="text-xs" style={{ color: '#78716C' }}>
          Services from Sanity used for visitor inquiries and CRM lead intake
        </p>
      </div>

      {catalogServices.length === 0 ? (
        <EmptyState
          icon="status"
          title="No services published"
          description="Add and publish emirateCorporateService documents in Sanity to populate this catalog."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {catalogServices.map((svc, idx) => (
            <div
              key={svc.id || svc.slug}
              className="rounded-2xl p-5 border space-y-3 flex flex-col justify-between backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E7E5E4',
                boxShadow: '0 10px 30px #1C191715',
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div
                    className="p-2.5 rounded-xl border"
                    style={{
                      backgroundColor: '#FEE2E2',
                      borderColor: '#FECACA',
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
                    {svc.tag || 'Active'}
                  </span>
                </div>

                <h3
                  className="text-base font-semibold pt-1"
                  style={{ color: 'var(--crm-text-primary, #1C1917)' }}
                >
                  {svc.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: '#78716C' }}>
                  {svc.description ||
                    'Corporate service available for Emirate Hub inquiries.'}
                </p>
              </div>

              <div
                className="pt-3 border-t flex items-center justify-between text-xs"
                style={{ borderColor: '#E7E5E4' }}
              >
                <span style={{ color: '#A8A29E' }}>{svc.slug}</span>
                <span
                  className="font-medium flex items-center gap-1"
                  style={{ color: '#E02126' }}
                >
                  CMS <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
