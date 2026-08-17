import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Target, Clock, Calendar, CheckCircle2, Pause, Play, Archive, Trash2 } from 'lucide-react';
import { getHabitById, pauseHabit, resumeHabit, archiveHabit, deleteHabit, logHabit } from '../services/habits.api';
import { HabitItem } from '../../../shared/types/lifeos.types';

export const HabitDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [habit, setHabit] = useState<HabitItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHabit = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await getHabitById(id);
      setHabit(data);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load habit detail.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHabit();
  }, [id]);

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-xs font-mono text-slate-400">Loading Habit Telemetry...</p>
      </div>
    );
  }

  if (error || !habit) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
        {error || 'Habit not found.'}
      </div>
    );
  }

  const handleLog = async (status: string) => {
    if (!id) return;
    try {
      await logHabit(id, { status });
      fetchHabit();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async () => {
    if (!id) return;
    try {
      if (habit.isActive) await pauseHabit(id);
      else await resumeHabit(id);
      fetchHabit();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm(`Are you sure you want to delete habit "${habit.name}"?`)) return;
    try {
      await deleteHabit(id);
      navigate('/habits');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Back Button */}
      <Link to="/habits" className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors">
        <ArrowLeft size={16} /> Back to Habits Workspace
      </Link>

      {/* Main Header Card */}
      <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {habit.category}
              </span>
              <span className="text-xs font-mono text-slate-500 font-bold uppercase">
                {habit.frequency}
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                habit.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
              }`}>
                {habit.isActive ? 'ACTIVE' : 'PAUSED'}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-100 font-sans">{habit.name}</h2>
            {habit.description && <p className="text-xs text-slate-400 font-sans">{habit.description}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={() => handleLog('COMPLETED')}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all shadow-lg shadow-amber-600/30 flex items-center gap-1.5"
            >
              <CheckCircle2 size={16} /> Log Today
            </button>

            <button
              onClick={handleToggleActive}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              {habit.isActive ? <Pause size={15} /> : <Play size={15} />}
              <span>{habit.isActive ? 'Pause' : 'Resume'}</span>
            </button>

            <button
              onClick={handleDelete}
              className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 font-mono text-xs">
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">CURRENT STREAK</span>
            <span className="text-lg font-bold text-amber-400 font-sans flex items-center gap-1">
              <Flame size={18} /> {habit.currentStreak} days
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">BEST STREAK</span>
            <span className="text-lg font-bold text-slate-200 font-sans">{habit.longestStreak} days</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">TARGET</span>
            <span className="text-lg font-bold text-cyan-400 font-sans">{habit.targetValue} {habit.targetUnit}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">PREFERRED TIME</span>
            <span className="text-lg font-bold text-indigo-400 font-sans">{habit.preferredTime || 'Anytime'}</span>
          </div>
        </div>
      </div>

      {/* Goal Linkage Section */}
      {habit.goal && (
        <div className="glass-card p-4 rounded-3xl border border-cyan-500/20 text-xs font-mono text-cyan-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={16} />
            <span>LINKED GOAL: <strong className="text-white font-sans">{habit.goal.title}</strong></span>
          </div>
          <Link to="/goals" className="underline hover:text-white">View Goal ↗</Link>
        </div>
      )}

      {/* History Audit Log */}
      <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3 font-mono text-xs">
        <h3 className="font-bold text-slate-200">Habit History Audit Logs</h3>
        {habit.habitHistories && habit.habitHistories.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {habit.habitHistories.map(h => (
              <div key={h.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                <span className="font-bold text-amber-400">{h.action}</span>
                <span className="text-slate-500 text-[10px]">
                  {new Date(h.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-[11px]">No history logs recorded yet.</p>
        )}
      </div>

    </div>
  );
};
