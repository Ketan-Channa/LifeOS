import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Bell, Link2, AlertCircle } from 'lucide-react';
import { createScheduleEvent } from '../../services/schedule.api';
import { getTasks } from '../../services/tasks.api';
import { getGoals } from '../../services/goals.api';
import { TaskItem, GoalItem } from '../../../../shared/types/lifeos.types';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: string;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialDate
}) => {
  const defaultDateStr = initialDate || new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('OTHER');
  const [priority, setPriority] = useState('MEDIUM');
  const [startDate, setStartDate] = useState(defaultDateStr);
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState(defaultDateStr);
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [isAllDay, setIsAllDay] = useState(false);
  const [recurrenceRule, setRecurrenceRule] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState<number | ''>(15);
  const [linkedTaskId, setLinkedTaskId] = useState('');
  const [linkedGoalId, setLinkedGoalId] = useState('');

  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      getTasks({ status: 'TODO' }).then(setTasks).catch(() => {});
      getGoals({ status: 'ACTIVE' }).then(setGoals).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Event title is required.');
      return;
    }

    const startIso = `${startDate}T${startTime}:00`;
    const endIso = `${endDate}T${endTime}:00`;

    const startDt = new Date(startIso);
    const endDt = new Date(endIso);

    if (isNaN(startDt.getTime()) || isNaN(endDt.getTime())) {
      setError('Please provide valid start and end dates and times.');
      return;
    }

    if (endDt <= startDt) {
      setError('End time must be strictly after start time.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createScheduleEvent({
        title,
        description,
        type: type as any,
        priority: priority as any,
        startTime: startIso,
        endTime: endIso,
        location: location || null,
        isAllDay,
        recurrenceRule: recurrenceRule || null,
        reminderMinutes: reminderMinutes ? Number(reminderMinutes) : null,
        linkedTaskId: linkedTaskId || null,
        linkedGoalId: linkedGoalId || null
      });

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create event.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg glass-card rounded-3xl border border-slate-800 p-6 space-y-5 bg-slate-950/90 text-slate-100 shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Calendar size={18} />
            </div>
            <h3 className="text-lg font-bold">Add Calendar Event</h3>
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
          
          {/* Title */}
          <div>
            <label className="block text-slate-400 mb-1 font-bold">Event Title *</label>
            <input
              type="text"
              required
              placeholder="e.g., Deep Work Sprint, Team Meeting, College Lecture"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-bold">Event Type / Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="WORK">Work</option>
                <option value="CLASS">College / Class</option>
                <option value="PROJECT">Project</option>
                <option value="MEETING">Meeting</option>
                <option value="PERSONAL">Personal</option>
                <option value="HEALTH">Health & Fitness</option>
                <option value="EXERCISE">Exercise</option>
                <option value="TASK">Task execution</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-bold">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          {/* Date & Time Selectors */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div>
              <label className="block text-slate-400 mb-1 font-bold">Start Date & Time</label>
              <div className="space-y-1.5">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs"
                />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-bold">End Date & Time</label>
              <div className="space-y-1.5">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs"
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Location & Reminder */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-bold flex items-center gap-1">
                <MapPin size={12} /> Location / Link
              </label>
              <input
                type="text"
                placeholder="e.g., Room 302, Google Meet"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-sans"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-bold flex items-center gap-1">
                <Bell size={12} /> Reminder
              </label>
              <select
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
              >
                <option value="">No Reminder</option>
                <option value={5}>5 minutes before</option>
                <option value={10}>10 minutes before</option>
                <option value={15}>15 minutes before</option>
                <option value={30}>30 minutes before</option>
                <option value={60}>1 hour before</option>
              </select>
            </div>
          </div>

          {/* Optional Linked Task & Goal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-bold flex items-center gap-1">
                <Link2 size={12} /> Link Task (Optional)
              </label>
              <select
                value={linkedTaskId}
                onChange={(e) => setLinkedTaskId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
              >
                <option value="">None</option>
                {tasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-bold flex items-center gap-1">
                <Link2 size={12} /> Link Goal (Optional)
              </label>
              <select
                value={linkedGoalId}
                onChange={(e) => setLinkedGoalId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
              >
                <option value="">None</option>
                {goals.map(g => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            </div>
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
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
