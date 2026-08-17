import React from 'react';
import { Settings, ShieldCheck, Sparkles, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const SettingsView: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="text-slate-400" /> Account & Operating Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">System telemetry, user profile, and subscription management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">{user?.name}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Account Plan:</span>
              <span className="text-emerald-400 font-bold">{user?.currentPlan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Phone:</span>
              <span>{user?.phone || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Age / Sex:</span>
              <span>{user?.age || 'N/A'} / {user?.sex || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Blood Group:</span>
              <span>{user?.bloodGroup || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <ShieldCheck size={18} className="text-indigo-400" /> LifeOS Kernel Telemetry
          </h3>
          <div className="space-y-2 text-xs text-slate-300 font-mono">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between">
              <span>Database Sync</span>
              <span className="text-emerald-400 font-bold">MySQL Online</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between">
              <span>Session Handler</span>
              <span className="text-indigo-400 font-bold">JWT Persistent</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between">
              <span>Security Questions</span>
              <span className="text-cyan-400 font-bold">Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
