import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sliders, CheckCircle2, Lock } from 'lucide-react';
import { getAgentSettings, updateAgentSettings } from '../services/agent.api';
import { AgentSettingsItem } from '../../../shared/types/lifeos.types';

export const AgentSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<AgentSettingsItem>({
    userId: 'default_user',
    autonomyLevel: 'AUTONOMY_2',
    allowLowRiskActions: false,
    allowTaskCreation: true,
    allowScheduleChanges: false,
    allowGoalChanges: false,
    allowNotifications: true,
    requireConfirmationForWrites: true
  });
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    getAgentSettings().then((data) => setSettings(data)).catch(() => {});
  }, []);

  const handleLevelChange = async (level: string) => {
    try {
      const updated = await updateAgentSettings({ ...settings, autonomyLevel: level });
      setSettings(updated);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {}
  };

  const handleToggle = async (key: keyof AgentSettingsItem) => {
    try {
      const newSettings = { ...settings, [key]: !settings[key] };
      const updated = await updateAgentSettings(newSettings);
      setSettings(updated);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (e) {}
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-purple-500/30 bg-slate-950/90 text-slate-100 font-sans space-y-6 shadow-xl select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Sliders size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base tracking-tight">SCOUT AUTONOMY SETTINGS</h3>
            <p className="text-xs text-slate-400 font-mono">Configure agent execution permissions and human-in-the-loop controls.</p>
          </div>
        </div>

        {isSaved && (
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-xs flex items-center gap-1.5">
            <CheckCircle2 size={13} /> SAVED
          </span>
        )}
      </div>

      {/* Autonomy Level Selectors */}
      <div className="space-y-3">
        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">AUTONOMY LEVEL</span>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            onClick={() => handleLevelChange('AUTONOMY_2')}
            className={`p-4 rounded-2xl cursor-pointer border transition-all ${
              settings.autonomyLevel === 'AUTONOMY_2'
                ? 'bg-purple-950/60 border-purple-500 text-white shadow-lg'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between font-mono text-xs font-bold mb-1">
              <span>ASSISTED (DEFAULT)</span>
              <span className="text-[10px] text-purple-300">AUTONOMY_2</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Reads LifeOS telemetry, analyzes risks, and prepares plans. <strong>All writes require explicit confirmation.</strong>
            </p>
          </div>

          <div
            onClick={() => handleLevelChange('AUTONOMY_3')}
            className={`p-4 rounded-2xl cursor-pointer border transition-all ${
              settings.autonomyLevel === 'AUTONOMY_3'
                ? 'bg-purple-950/60 border-purple-500 text-white shadow-lg'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between font-mono text-xs font-bold mb-1">
              <span>CONFIRM ACTIONS</span>
              <span className="text-[10px] text-purple-300">AUTONOMY_3</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Executes low-risk draft actions. Schedule shifts and goal changes require confirmation.
            </p>
          </div>

          <div
            onClick={() => handleLevelChange('AUTONOMY_4')}
            className={`p-4 rounded-2xl cursor-pointer border transition-all ${
              settings.autonomyLevel === 'AUTONOMY_4'
                ? 'bg-purple-950/60 border-purple-500 text-white shadow-lg'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between font-mono text-xs font-bold mb-1">
              <span>LIMITED AUTONOMY</span>
              <span className="text-[10px] text-purple-300">AUTONOMY_4</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Executes pre-approved recurring focus blocks automatically. Destructive changes remain locked.
            </p>
          </div>
        </div>
      </div>

      {/* Safety Rules Checklist */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">SAFETY RULES & PERMISSIONS</span>

        <div className="space-y-2 font-mono text-xs">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer">
            <span className="text-slate-200">Require Explicit Approval for Write Operations</span>
            <input
              type="checkbox"
              checked={settings.requireConfirmationForWrites}
              onChange={() => handleToggle('requireConfirmationForWrites')}
              className="accent-purple-600 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer">
            <span className="text-slate-200">Allow Automatic Task Creation</span>
            <input
              type="checkbox"
              checked={settings.allowTaskCreation}
              onChange={() => handleToggle('allowTaskCreation')}
              className="accent-purple-600 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer">
            <span className="text-slate-200">Allow Schedule Modifications</span>
            <input
              type="checkbox"
              checked={settings.allowScheduleChanges}
              onChange={() => handleToggle('allowScheduleChanges')}
              className="accent-purple-600 w-4 h-4"
            />
          </label>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-2">
        <Lock size={15} className="text-amber-400 shrink-0" />
        <span>Destructive operations (data deletions, payment alterations, password changes) are <strong>permanently restricted</strong> across all autonomy levels.</span>
      </div>

    </div>
  );
};
