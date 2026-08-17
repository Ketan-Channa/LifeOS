import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { startTask, pauseTask, resumeTask, completeTask } from '../../services/tasks.api';
import { TaskItem } from '../../../../shared/types/lifeos.types';

interface TaskTimerProps {
  task: TaskItem;
  onUpdate: () => void;
}

export const TaskTimer: React.FC<TaskTimerProps> = ({ task, onUpdate }) => {
  const [isTimerRunning, setIsTimerRunning] = useState(task.status === 'IN_PROGRESS');
  const [seconds, setSeconds] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsTimerRunning(task.status === 'IN_PROGRESS');
  }, [task.status]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    setIsLoading(true);
    try {
      await startTask(task.id);
      setIsTimerRunning(true);
      setIsLoading(false);
      onUpdate();
    } catch (err) {
      setIsLoading(false);
    }
  };

  const handlePause = async () => {
    setIsLoading(true);
    try {
      const elapsedMins = Math.ceil(seconds / 60);
      await pauseTask(task.id, elapsedMins);
      setIsTimerRunning(false);
      setSeconds(0);
      setIsLoading(false);
      onUpdate();
    } catch (err) {
      setIsLoading(false);
    }
  };

  const handleResume = async () => {
    setIsLoading(true);
    try {
      await resumeTask(task.id);
      setIsTimerRunning(true);
      setIsLoading(false);
      onUpdate();
    } catch (err) {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const elapsedMins = Math.ceil(seconds / 60);
      const finalActualMins = task.actualMinutes + elapsedMins;
      await completeTask(task.id, finalActualMins > 0 ? finalActualMins : task.estimatedMinutes);
      setIsTimerRunning(false);
      setSeconds(0);
      setIsLoading(false);
      onUpdate();
    } catch (err) {
      setIsLoading(false);
    }
  };

  if (task.status === 'COMPLETED') {
    return (
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 flex items-center justify-between">
        <span className="flex items-center gap-2 font-bold">
          <Clock size={16} /> Task Execution Completed
        </span>
        <span>Actual Duration: {task.actualMinutes}m</span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 font-bold">
          <Clock size={16} className={isTimerRunning ? 'animate-pulse text-emerald-400' : ''} />
          <span>TASK EXECUTION TIMER</span>
        </div>

        <div className="text-xl font-mono font-extrabold text-white tracking-widest bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
          {formatTime(seconds)}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        {!isTimerRunning && task.status !== 'IN_PROGRESS' && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleStart}
            isLoading={isLoading}
            leftIcon={<Play size={14} />}
            className="w-full text-xs"
          >
            Start Timer
          </Button>
        )}

        {!isTimerRunning && task.status === 'IN_PROGRESS' && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleResume}
            isLoading={isLoading}
            leftIcon={<Play size={14} />}
            className="w-full text-xs bg-indigo-600"
          >
            Resume Timer
          </Button>
        )}

        {isTimerRunning && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePause}
              isLoading={isLoading}
              leftIcon={<Pause size={14} />}
              className="flex-1 text-xs"
            >
              Pause
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleComplete}
              isLoading={isLoading}
              leftIcon={<Square size={14} />}
              className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-500"
            >
              Complete Task
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
