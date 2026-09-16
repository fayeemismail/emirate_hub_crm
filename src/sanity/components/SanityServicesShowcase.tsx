'use client';

import React from 'react';
import { SanityService } from '../types/documents';
import { hasValidSanityServices } from '../types/typeGuards';
import { SanityFallbackMessage } from './SanityFallbackMessage';
import { Briefcase, Layers } from 'lucide-react';

interface SanityServicesShowcaseProps {
  services: SanityService[] | null;
  showFallbackIfEmpty?: boolean;
}

export const SanityServicesShowcase: React.FC<SanityServicesShowcaseProps> = ({
  services,
  showFallbackIfEmpty = true,
}) => {
  // Check if incoming Sanity services data exists
  if (!hasValidSanityServices(services)) {
    if (showFallbackIfEmpty) {
      return (
        <div className="my-4">
          <SanityFallbackMessage 
            entityName="Services Catalog"
            message="No service records found in Sanity CMS. Create and publish services in Sanity Studio to display them here."
          />
        </div>
      );
    }
    // Do not show component if no data
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <Layers className="w-4 h-4 text-sky-400" />
        <span>Published Services from Sanity CMS</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {services.map((svc) => (
          <div
            key={svc._id}
            className="p-4 rounded-xl border backdrop-blur-md"
            style={{
              backgroundColor: '#0d284cf2',
              borderColor: '#93c5fd40',
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Briefcase className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs font-bold text-white truncate">{svc.title}</h4>
            </div>
            {svc.tagline && (
              <p className="text-[11px] text-slate-300 line-clamp-2">{svc.tagline}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
