import React from 'react';
import { 
  Plus, 
  CheckSquare, 
  Target, 
  Calendar, 
  RotateCcw, 
  FileText, 
  Bot 
} from 'lucide-react';
import { Button } from '../ui/Button';

interface QuickActionsBarProps {
  onOpenTaskModal: () => void;
  onOpenGoalModal: () => void;
  onOpenScheduleModal: () => void;
  onOpenHabitModal: () => void;
  onOpenNoteModal: () => void;
  onOpenScout: () => void;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onOpenTaskModal,
  onOpenGoalModal,
  onOpenScheduleModal,
  onOpenHabitModal,
  onOpenNoteModal,
  onOpenScout
}) => {
  return (
    <div className="glass-card p-4 rounded-3xl space-y-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block px-2">
        QUICK ACTIONS
      </span>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenTaskModal}
          leftIcon={<CheckSquare size={14} className="text-indigo-400" />}
          className="text-xs justify-start py-2.5"
        >
          Add Task
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenGoalModal}
          leftIcon={<Target size={14} className="text-emerald-400" />}
          className="text-xs justify-start py-2.5"
        >
          Create Goal
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenScheduleModal}
          leftIcon={<Calendar size={14} className="text-purple-400" />}
          className="text-xs justify-start py-2.5"
        >
          Schedule Event
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenHabitModal}
          leftIcon={<RotateCcw size={14} className="text-cyan-400" />}
          className="text-xs justify-start py-2.5"
        >
          Track Habit
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenNoteModal}
          leftIcon={<FileText size={14} className="text-amber-400" />}
          className="text-xs justify-start py-2.5"
        >
          Add Note
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenScout}
          leftIcon={<Bot size={14} className="text-white" />}
          className="text-xs justify-start py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 border-none"
        >
          Ask SCOUT
        </Button>
      </div>
    </div>
  );
};
