import React, { useState } from 'react';
import { CheckCircle2, X, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { createMilestone } from '../../services/milestones.api';

interface AddMilestoneModalProps {
  goalId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddMilestoneModal: React.FC<AddMilestoneModalProps> = ({ goalId, isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !goalId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Milestone title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      await createMilestone(goalId, {
        title: title.trim(),
        description: description.trim() || null
      });
      setIsSubmitting(false);
      setTitle('');
      setDescription('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.response?.data?.message || err.message || 'Failed to add milestone');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card w-full max-w-md rounded-3xl p-6 border border-slate-800 space-y-4 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Milestone</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Break down goal into measurable target steps</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-mono text-slate-400 mb-1">Milestone Title *</label>
            <input
              type="text"
              placeholder="e.g. Complete React & TypeScript Course"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 rounded-xl px-3.5 py-2.5 border border-slate-800 focus:border-emerald-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-mono text-slate-400 mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Key deliverables for this milestone..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 rounded-xl px-3.5 py-2 border border-slate-800 focus:border-emerald-500 outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Add Milestone
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};
