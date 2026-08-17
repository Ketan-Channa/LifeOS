import React, { useState, useEffect } from 'react';
import { X, Flame, Target, Clock, Bell, Link2, AlertCircle } from 'lucide-react';
import { createHabit } from '../../services/habits.api';
import { getGoals } from '../../services/goals.api';
import { GoalItem } from '../../../../shared/types/lifeos.types';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddHabitModal: React.FC<AddHabitModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Health');
  const [frequency, setFrequency] = useState('DAILY');
  const [targetValue, setTargetValue] = useState(1);
  const [targetUnit, setTargetUnit] = useState('session');
  const [preferredTime, setPreferredTime] = useState('19:00');
  const [priority, setPriority] = useState('MEDIUM');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [reminderMinutes, setReminderMinutes] = useState<number | ''>(15);
  const [goalId, setGoalId] = useState('');

  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      getGoals({ status: 'ACTIVE' }).then(setGoals).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Habit name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createHabit({
        name: name.trim(),
        description: description.trim() || null,
        category,
        frequency: frequency as any,
        targetValue: Number(targetValue),
        targetUnit,
        preferredTime: preferredTime || null,
        priority: priority as any,
        startDate,
        reminderMinutes: reminderMinutes ? Number(reminderMinutes) : null,
        goalId: goalId || null
      });

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create habit.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg glass-card rounded-3xl border border-slate-800 p-6 space-y-5 bg-slate-950/90 text-slate-100 shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Flame size={18} />
            </div>
            <h3 className="text-lg font-bold">Create New Habit</h3>
          </div>

          <button onClick={onClose} className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          
          {/* Habit Name */}
          <div>
            <label className="block text-slate-400 mb-1 font-bold">Habit Name *</label>
            <input
              type="text"
              required
              placeholder="e.g., DSA Practice, Morning Run, Read 20 Pages"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-400 mb-1 font-bold">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Describe your consistency goal or routine trigger..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-amber-500 font-sans resize-none"
            />
          </div>

          {/* Category & Frequency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-bold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="Health">Health & Wellness</option>
                <option value="Fitness">Fitness & Exercise</option>
                <option value="Learning">Learning & Study</option>
                <option value="Career">Career & Placement</option>
                <option value="Work">Work & Projects</option>
                <option value="Personal">Personal Growth</option>
                <option value="Finance">Finance</option>
                <option value="Productivity">Productivity</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-bold">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="DAILY">Every Day (Daily)</option>
                <option value="WEEKDAYS">Weekdays (Mon-Fri)</option>
                <option value="WEEKLY">Weekly</option>
                <option value="CUSTOM">Custom Days</option>
              </select>
            </div>
          </div>

          {/* Target Value & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-bold">Target Value</label>
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-bold">Target Unit</label>
              <input
                type="text"
                placeholder="e.g., minutes, pages, glasses"
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-sans"
              />
            </div>
          </div>

          {/* Preferred Time & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-bold flex items-center gap-1">
                <Clock size={12} /> Preferred Time
              </label>
              <input
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-bold">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Goal Linkage */}
          <div>
            <label className="block text-slate-400 mb-1 font-bold flex items-center gap-1">
              <Link2 size={12} /> Link to Goal (Optional)
            </label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
            >
              <option value="">None (Standalone Habit)</option>
              {goals.map(g => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-white transition-all shadow-lg shadow-amber-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Habit'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
