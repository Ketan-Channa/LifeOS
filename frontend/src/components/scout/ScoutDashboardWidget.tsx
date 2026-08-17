import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { getScoutBriefing } from '../../services/scout.api';
import { ScoutBriefingItem } from '../../../../shared/types/lifeos.types';

export const ScoutDashboardWidget: React.FC = () => {
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState<ScoutBriefingItem | null>(null);

  useEffect(() => {
    getScoutBriefing().then((data) => setBriefing(data)).catch(() => {});
  }, []);

  return (
    <div className="glass-card p-5 rounded-3xl border border-purple-500/30 bg-slate-950/90 text-slate-100 font-sans space-y-3 shadow-xl select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Bot size={18} />
          </div>
          <div>
            <h4 className="font-bold text-white text-xs tracking-tight">SCOUT TODAY</h4>
            <p className="text-[10px] text-slate-400 font-mono">Unified Life Intelligence Agent</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/assistant')}
          className="px-3 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-[11px] flex items-center gap-1 transition-all shadow-sm"
        >
          <Sparkles size={12} /> ASK SCOUT <ArrowRight size={12} />
        </button>
      </div>

      <div className="text-xs space-y-1 text-slate-200">
        <strong className="block text-white font-sans">{briefing?.greeting || 'Hello'}!</strong>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          {briefing?.overviewText || 'SCOUT is actively analyzing your tasks, goals, schedule, and habits.'}
        </p>
      </div>

      {briefing?.topRecommendedFocus && (
        <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] font-mono flex items-center justify-between text-purple-300">
          <span>RECOMMENDED FOCUS: <strong className="text-white">{briefing.topRecommendedFocus}</strong></span>
          <span className="text-amber-400 font-bold">HIGH PRIORITY</span>
        </div>
      )}
    </div>
  );
};
