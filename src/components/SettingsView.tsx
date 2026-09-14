'use client';

import React from 'react';
import { Settings, Shield, Bell, Key, Globe } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          Foundex Admin Settings
        </h2>
        <p className="text-xs text-gray-400">
          Manage system preferences, API webhooks, and email notifications
        </p>
      </div>

      <div className="space-y-4">
        {/* Form Webhook Integration */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Website Contact Form Webhook</h3>
              <p className="text-xs text-gray-400">Receives incoming POST requests from foundex.com website</p>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono text-indigo-300 flex items-center justify-between">
            <span>https://api.foundex.io/v1/webhooks/service-requests</span>
            <span className="text-emerald-400 text-[11px] font-sans font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              Active
            </span>
          </div>
        </div>

        {/* Security & Access */}
        <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Admin Security & Access Control</h3>
              <p className="text-xs text-gray-400">Two-factor authentication and session security</p>
            </div>
          </div>
          <div className="text-xs text-gray-400">
            2FA is currently enabled for admin account <span className="text-white font-medium">admin@foundex.io</span>.
          </div>
        </div>
      </div>
    </div>
  );
};
