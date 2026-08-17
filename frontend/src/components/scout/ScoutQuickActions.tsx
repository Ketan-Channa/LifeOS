import React from 'react';
import { Sparkles, Compass, AlertTriangle, BarChart3, Target, RotateCcw, BookOpen, Calendar, FileText, CheckSquare } from 'lucide-react';

interface ScoutQuickActionsProps {
  onActionClick: (promptText: string) => void;
}

export const QUICK_ACTIONS = [
  { label: 'PLAN MY DAY', icon: <Sparkles size={13} className="text-purple-400" />, prompt: 'Plan my day.' },
  { label: 'WHAT SHOULD I DO NOW?', icon: <Compass size={13} className="text-indigo-400" />, prompt: 'What should I work on now?' },
  { label: 'SHOW MY PRIORITIES', icon: <CheckSquare size={13} className="text-emerald-400" />, prompt: 'Show my highest priority tasks.' },
  { label: 'WHAT IS AT RISK?', icon: <AlertTriangle size={13} className="text-rose-400" />, prompt: 'What tasks or goals are at risk?' },
  { label: 'ANALYZE MY PRODUCTIVITY', icon: <BarChart3 size={13} className="text-cyan-400" />, prompt: 'Analyze my productivity trends and focus.' },
  { label: 'CHECK MY GOALS', icon: <Target size={13} className="text-amber-400" />, prompt: 'Check my progress toward active goals.' },
  { label: 'REVIEW MY HABITS', icon: <RotateCcw size={13} className="text-pink-400" />, prompt: 'Review my habit consistency and streaks.' },
  { label: 'SEARCH MY KNOWLEDGE', icon: <BookOpen size={13} className="text-indigo-300" />, prompt: 'Search my knowledge base documents.' },
  { label: 'EXPLAIN MY SCHEDULE', icon: <Calendar size={13} className="text-blue-400" />, prompt: 'Explain my schedule for today.' },
  { label: "GENERATE TODAY'S SUMMARY", icon: <FileText size={13} className="text-teal-400" />, prompt: 'Generate summary for today.' }
];

export const ScoutQuickActions: React.FC<ScoutQuickActionsProps> = ({ onActionClick }) => {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 font-mono text-xs select-none">
      {QUICK_ACTIONS.map((act, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onActionClick(act.prompt)}
          className="shrink-0 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 hover:text-white hover:border-purple-500/50 hover:bg-slate-900 transition-all font-bold text-[11px] flex items-center gap-2 shadow-sm"
        >
          {act.icon}
          <span>{act.label}</span>
        </button>
      ))}
    </div>
  );
};
