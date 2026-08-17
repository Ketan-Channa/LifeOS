import React, { useState } from 'react';
import { X, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { postponeTask } from '../../services/tasks.api';
import { TaskItem } from '../../../../shared/types/lifeos.types';

interface TaskPostponeModalProps {
  task: TaskItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskPostponeModal: React.FC<TaskPostponeModalProps> = ({
  task,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [customDate, setCustomDate] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<'LATER_TODAY' | 'TOMORROW' | 'NEXT_WEEK' | 'CUSTOM'>('TOMORROW');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !task) return null;

  const calculateNewDueDate = () => {
    const now = new Date();
    if (selectedPreset === 'LATER_TODAY') {
      const later = new Date(now.getTime() + 4 * 60 * 60 * 1000);
      return later.toISOString();
    }
    if (selectedPreset === 'TOMORROW') {
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0);
      return tomorrow.toISOString();
    }
    if (selectedPreset === 'NEXT_WEEK') {
      const nextWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 9, 0);
      return nextWeek.toISOString();
    }
    return customDate ? new Date(customDate).toISOString() : new Date().toISOString();
  };

  const handlePostpone = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const newDueDate = calculateNewDueDate();
      await postponeTask(task.id, newDueDate);
      setIsLoading(false);
      onSuccess();
      onClose();
    } catch (err) {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Clock size={20} />
            <h3 className="text-base font-bold text-white">Postpone Task</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1">
          <p className="font-bold text-white truncate">{task.title}</p>
          <p className="text-slate-400 text-[11px]">
            Current Due Date:{' '}
            <span className="font-mono text-amber-400">
              {task.dueDate ? new Date(task.dueDate).toLocaleString() : 'No due date set'}
            </span>
          </p>
        </div>

        <form onSubmit={handlePostpone} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedPreset('LATER_TODAY')}
              className={`p-3 rounded-xl border text-left font-medium transition-all ${
                selectedPreset === 'LATER_TODAY'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-xs">Later Today</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">+4 hours</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPreset('TOMORROW')}
              className={`p-3 rounded-xl border text-left font-medium transition-all ${
                selectedPreset === 'TOMORROW'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-xs">Tomorrow</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">9:00 AM</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPreset('NEXT_WEEK')}
              className={`p-3 rounded-xl border text-left font-medium transition-all ${
                selectedPreset === 'NEXT_WEEK'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-xs">Next Week</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">+7 days</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPreset('CUSTOM')}
              className={`p-3 rounded-xl border text-left font-medium transition-all ${
                selectedPreset === 'CUSTOM'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-xs">Custom Date</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Select time</div>
            </button>
          </div>

          {selectedPreset === 'CUSTOM' && (
            <Input
              label="Select Custom Date & Time"
              type="datetime-local"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              required
            />
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              leftIcon={<ArrowRight size={14} />}
              className="bg-amber-600 hover:bg-amber-500 text-white"
            >
              Save Postponement
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
