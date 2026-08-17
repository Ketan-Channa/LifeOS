import React, { useState, useEffect } from 'react';
import { Sun, Calendar, AlertTriangle, Target, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { getScoutBriefing } from '../../services/scout.api';
import { ScoutBriefingItem } from '../../../../shared/types/lifeos.types';
import { ScoutActionPreview } from './ScoutActionPreview';

export const ScoutDailyBriefing: React.FC = () => {
  const [briefing, setBriefing] = useState<ScoutBriefingItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getScoutBriefing()
      .then((data) => { setBriefing(data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl glass-card border border-purple-500/30 text-center text-slate-400 font-mono text-xs">
        Loading Today's SCOUT Daily Briefing...
      </div>
    );
  }

  if (!briefing) return null;

  return (
    <div className="glass-card p-6 rounded-3xl border border-purple-500/30 bg-slate-950/90 text-slate-100 space-y-4 font-sans shadow-xl select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sun size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base tracking-tight">{briefing.greeting.toUpperCase()}</h3>
            <p className="text-xs text-slate-400 font-mono">{briefing.date} • Daily Briefing Summary</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300 font-mono font-bold text-xs">
          SCOUT TODAY
        </span>
      </div>

      <p className="text-xs text-slate-200 leading-relaxed font-sans">{briefing.overviewText}</p>

      {/* Telemetry Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 block uppercase">SCHEDULED</span>
          <strong className="text-base text-white">{briefing.scheduledEventsCount} Events</strong>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 block uppercase">RISK DEADLINES</span>
          <strong className="text-base text-rose-400">{briefing.highRiskDeadlinesCount} Urgent</strong>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 block uppercase">HABITS</span>
          <strong className="text-base text-cyan-400">{briefing.habitsCount} Trackers</strong>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 block uppercase">AT-RISK GOAL</span>
          <strong className="text-xs text-amber-300 truncate block">{briefing.atRiskGoalTitle || 'None'}</strong>
        </div>
      </div>

      {/* Top Focus Callout */}
      <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-purple-300 font-mono font-bold">
          <Sparkles size={16} /> RECOMMENDED TODAY FOCUS: <span className="text-white">{briefing.topRecommendedFocus}</span>
        </div>
        <ul className="space-y-1 text-slate-300 pl-6 list-disc font-sans text-xs">
          {briefing.whyThisFocus.map((point, idx) => (
            <li key={idx}>{point}</li>
          ))}
        </ul>
      </div>

      {/* Briefing Action Cards */}
      {briefing.actions && briefing.actions.length > 0 && (
        <div className="pt-2 border-t border-slate-800">
          {briefing.actions.map((act, idx) => (
            <ScoutActionPreview key={idx} action={act} />
          ))}
        </div>
      )}

    </div>
  );
};
