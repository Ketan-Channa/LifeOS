import React, { useState } from 'react';
import { ShieldCheck, Plus, CheckCircle2 } from 'lucide-react';
import { AgentConstraintItem } from '../../../shared/types/lifeos.types';

export const AgentConstraintView: React.FC = () => {
  const [constraints, setConstraints] = useState<AgentConstraintItem[]>([
    { id: 'c1', userId: 'default_user', type: 'NO_EARLY_MORNING', value: "Don't schedule before 7:00 AM", priority: 'HIGH', active: true },
    { id: 'c2', userId: 'default_user', type: 'MAX_DAILY_WORKLOAD', value: 'Cap daily scheduled workload at 6.5 hours', priority: 'HIGH', active: true },
    { id: 'c3', userId: 'default_user', type: 'GOAL_PRIORITY', value: 'Prioritize Placement Readiness goal', priority: 'MEDIUM', active: true }
  ]);

  const handleToggle = (id: string) => {
    setConstraints(constraints.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-purple-500/30 bg-slate-950/90 text-slate-100 font-sans space-y-4 shadow-xl select-none">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base tracking-tight">PLANNING CONSTRAINTS</h3>
            <p className="text-xs text-slate-400 font-mono">Enforce strict rules for SCOUT daily planning engine.</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {constraints.map((c) => (
          <div
            key={c.id}
            className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                {c.type}
              </span>
              <span className="text-slate-200 font-sans">{c.value}</span>
            </div>

            <button
              type="button"
              onClick={() => handleToggle(c.id)}
              className={`px-3 py-1 rounded-xl font-mono text-[11px] font-bold transition-all ${
                c.active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
              }`}
            >
              {c.active ? 'ACTIVE' : 'INACTIVE'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
