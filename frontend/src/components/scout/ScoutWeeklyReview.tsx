import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, CheckCircle2, AlertTriangle, Sparkles, Layers } from 'lucide-react';
import { getScoutWeeklyReview } from '../../services/scout.api';
import { ScoutWeeklyReviewItem } from '../../../../shared/types/lifeos.types';

export const ScoutWeeklyReview: React.FC = () => {
  const [review, setReview] = useState<ScoutWeeklyReviewItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getScoutWeeklyReview()
      .then((data) => { setReview(data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl glass-card border border-purple-500/30 text-center text-slate-400 font-mono text-xs">
        Generating Weekly SCOUT Intelligence Review...
      </div>
    );
  }

  if (!review) return null;

  return (
    <div className="glass-card p-6 rounded-3xl border border-purple-500/30 bg-slate-950/90 text-slate-100 space-y-5 font-sans shadow-xl select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Award size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base tracking-tight">WEEKLY LIFE REVIEW</h3>
            <p className="text-xs text-slate-400 font-mono">{review.startDate} to {review.endDate}</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-xs">
          +{review.productivityScoreTrend}% SCORE
        </span>
      </div>

      {/* Telemetry Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 block uppercase">TASKS COMPLETED</span>
          <strong className="text-base text-emerald-400">{review.tasksCompletedCount} Tasks ({review.taskCompletionRate}%)</strong>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 block uppercase">POSTPONEMENTS</span>
          <strong className="text-base text-amber-400">{review.postponementsCount} Tasks</strong>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 block uppercase">HABIT CONSISTENCY</span>
          <strong className="text-base text-cyan-400">{review.habitConsistencyRate}% Rate</strong>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 block uppercase">ML MODEL ACCURACY</span>
          <strong className="text-base text-purple-300">{review.mlAccuracyRate}% Calibrated</strong>
        </div>
      </div>

      {/* Wins & Patterns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
          <span className="font-mono font-bold text-emerald-300 uppercase text-[10px] block">WEEKLY WINS</span>
          <ul className="space-y-1 text-slate-200">
            {review.wins.map((w, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-2">
          <span className="font-mono font-bold text-indigo-300 uppercase text-[10px] block">OBSERVED PATTERNS</span>
          <ul className="space-y-1 text-slate-200">
            {review.patternsObserved.map((p, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <TrendingUp size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* SCOUT Recommendation Callout */}
      {review.recommendations && review.recommendations.length > 0 && (
        <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-purple-300 font-mono font-bold">
            <Sparkles size={16} /> SCOUT WEEKLY RECOMMENDATION:
          </div>
          {review.recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-center justify-between font-mono pt-1">
              <div>
                <strong className="block text-white font-sans text-xs">{rec.title}</strong>
                <span className="text-[11px] text-slate-400">{rec.reason}</span>
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 font-bold text-xs">
                {rec.actionText}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
