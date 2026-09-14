'use client';

import React from 'react';
import { Settings, Shield, Bell, Key, Globe } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          Emirate Hub Admin Settings
        </h2>
        <p className="text-xs text-gray-400">
          System configurations, integrations, and advisory preference controls
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111C24] border border-[#223849] rounded-xl p-5">
          <h3 className="text-base font-semibold text-white mb-2">Webhook Ingestion</h3>
          <div className="bg-[#0B131B] p-3 rounded-lg border border-[#223849] text-xs font-mono text-cyan-400 flex items-center justify-between">
            <span>https://api.emiratehub.ae/v1/webhooks/service-requests</span>
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">ACTIVE</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Receives incoming POST requests from emiratehub.ae website
          </p>
        </div>

        <div className="bg-[#111C24] border border-[#223849] rounded-xl p-5">
          <h3 className="text-base font-semibold text-white mb-2">Advisory Notifications</h3>
          <p className="text-xs text-gray-400 mb-3">
            Real-time browser notifications are dispatched when a new inquiry arrives.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Real-time listener enabled
          </div>
        </div>

        <div className="bg-[#111C24] border border-[#223849] rounded-xl p-5 md:col-span-2">
          <h3 className="text-base font-semibold text-white mb-2">Security & Access Control</h3>
          <p className="text-xs text-gray-400 mb-3">
            Admin session secured with JWT HTTP Bearer token and role-based validation.
          </p>
          <div className="text-xs text-gray-300">
            Admin account: <span className="text-white font-medium">admin@emirate.com</span>.
          </div>
        </div>
      </div>
    </div>
  );
};
