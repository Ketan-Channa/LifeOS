import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertTriangle, 
  Layers, 
  CheckSquare, 
  Target 
} from 'lucide-react';
import { ScheduleDayView } from '../components/schedule/ScheduleDayView';
import { ScheduleWeekView } from '../components/schedule/ScheduleWeekView';
import { ScheduleMonthView } from '../components/schedule/ScheduleMonthView';
import { AddEventModal } from '../components/modals/AddEventModal';
import { AIPlanMyDayModal } from '../components/modals/AIPlanMyDayModal';
import { WorkloadPredictionCard } from '../components/predictive/WorkloadPredictionCard';
import { 
  getDayEvents, 
  getWeekEvents, 
  getMonthEvents, 
  getScheduleStats, 
  getScheduleConflicts, 
  getFreeTimeSlots 
} from '../services/schedule.api';
import { getWorkloadPrediction } from '../services/predictions.api';
import { ScheduleEventItem, ScheduleStats, ScheduleConflict, FreeTimeSlot, WorkloadPrediction } from '../../../shared/types/lifeos.types';

export const ScheduleView: React.FC = () => {
  const [activeView, setActiveView] = useState<'DAY' | 'WEEK' | 'MONTH'>('WEEK');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Data state
  const [dayData, setDayData] = useState<{ events: ScheduleEventItem[]; scheduledTasks: any[]; deadlines: any[] }>({ events: [], scheduledTasks: [], deadlines: [] });
  const [weekData, setWeekData] = useState<{ events: ScheduleEventItem[]; scheduledTasks: any[]; deadlines: any[] }>({ events: [], scheduledTasks: [], deadlines: [] });
  const [monthData, setMonthData] = useState<{ events: ScheduleEventItem[]; deadlines: any[]; milestones: any[] }>({ events: [], deadlines: [], milestones: [] });
  const [stats, setStats] = useState<ScheduleStats | null>(null);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [freeSlots, setFreeSlots] = useState<FreeTimeSlot[]>([]);
  const [workloadPrediction, setWorkloadPrediction] = useState<WorkloadPrediction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isAiPlanModalOpen, setIsAiPlanModalOpen] = useState(false);

  const fetchScheduleData = async () => {
    try {
      setIsLoading(true);
      const [dData, wData, mData, stData, confData, freeData, wPred] = await Promise.all([
        getDayEvents(selectedDate),
        getWeekEvents(selectedDate),
        getMonthEvents(new Date(selectedDate).getFullYear(), new Date(selectedDate).getMonth() + 1),
        getScheduleStats(),
        getScheduleConflicts(selectedDate),
        getFreeTimeSlots(selectedDate),
        getWorkloadPrediction().catch(() => null)
      ]);

      setDayData(dData);
      setWeekData(wData);
      setMonthData(mData);
      setStats(stData);
      setConflicts(confData);
      setFreeSlots(freeData);
      setWorkloadPrediction(wPred);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduleData();
  }, [selectedDate]);

  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    const cur = new Date(selectedDate);
    if (direction === 'today') {
      setSelectedDate(new Date().toISOString().split('T')[0]);
      return;
    }

    if (activeView === 'DAY') {
      cur.setDate(cur.getDate() + (direction === 'next' ? 1 : -1));
    } else if (activeView === 'WEEK') {
      cur.setDate(cur.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      cur.setMonth(cur.getMonth() + (direction === 'next' ? 1 : -1));
    }

    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="text-cyan-400" /> Schedule
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Plan your time, organize your workload, and stay ahead of deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddEventModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus size={16} /> Add Event
          </button>

          <button
            onClick={() => setIsAiPlanModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-xs text-white flex items-center gap-1.5 transition-all shadow-lg shadow-purple-600/20"
          >
            <Sparkles size={16} /> AI Plan My Day
          </button>

          <button
            onClick={() => handleNavigate('today')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-300 hover:text-white transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Predictive Workload Risk Warning Card */}
      <WorkloadPredictionCard prediction={workloadPrediction} />

      {/* 2. Controls Toolbar (View Switcher & Date Navigation) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl glass-card border border-slate-800">
        
        {/* Date Navigator */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => handleNavigate('prev')}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-3 py-1 font-bold text-slate-200">
            {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <button
            onClick={() => handleNavigate('next')}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono">
          <button
            onClick={() => setActiveView('DAY')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeView === 'DAY' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            DAY
          </button>
          <button
            onClick={() => setActiveView('WEEK')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeView === 'WEEK' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            WEEK
          </button>
          <button
            onClick={() => setActiveView('MONTH')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeView === 'MONTH' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            MONTH
          </button>
        </div>

      </div>

      {/* 3. Conflict Alert Banner */}
      {conflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle size={16} className="text-amber-400" />
            <span>{conflicts.length} SCHEDULE OVERLAP CONFLICT(S) DETECTED</span>
          </div>
          {conflicts.map((c, idx) => (
            <p key={idx} className="text-slate-300 pl-6">
              "{c.eventA.title}" and "{c.eventB.title}" overlap by {c.overlapMinutes} minutes.
            </p>
          ))}
        </div>
      )}

      {/* 4. Main 2-Column Schedule Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left 3 Columns — Main Calendar View */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-3 glass-card rounded-3xl border border-slate-800">
              <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
              <p className="text-xs font-mono text-slate-400">Loading Schedule Telemetry...</p>
            </div>
          ) : activeView === 'DAY' ? (
            <ScheduleDayView
              date={selectedDate}
              events={dayData.events}
              scheduledTasks={dayData.scheduledTasks}
              deadlines={dayData.deadlines}
            />
          ) : activeView === 'WEEK' ? (
            <ScheduleWeekView
              startDate={selectedDate}
              events={weekData.events}
              scheduledTasks={weekData.scheduledTasks}
              deadlines={weekData.deadlines}
            />
          ) : (
            <ScheduleMonthView
              year={new Date(selectedDate).getFullYear()}
              month={new Date(selectedDate).getMonth() + 1}
              events={monthData.events}
              deadlines={monthData.deadlines}
              milestones={monthData.milestones}
              onSelectDate={(d) => {
                setSelectedDate(d);
                setActiveView('DAY');
              }}
            />
          )}
        </div>

        {/* Right Column — Today Overview & Stats Sidebar */}
        <div className="space-y-6">
          
          {/* Today Overview Panel */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3 font-mono text-xs">
            <h3 className="font-bold text-slate-200 flex items-center gap-2">
              <Clock size={16} className="text-indigo-400" /> Today's Schedule Overview
            </h3>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">SCHEDULED</span>
                <span className="text-lg font-bold text-indigo-400 font-sans">{stats?.scheduledHoursToday || 0}h</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">AVAILABLE</span>
                <span className="text-lg font-bold text-emerald-400 font-sans">{stats?.freeHoursToday || 0}h</span>
              </div>
            </div>

            {/* Free Time Slots */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Available Free Time Windows</span>
              {freeSlots.length === 0 ? (
                <p className="text-slate-500 text-[11px]">No continuous free time slots detected today.</p>
              ) : (
                freeSlots.slice(0, 3).map((slot, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex justify-between">
                    <span>{new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="font-bold">{slot.durationMinutes}m</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* LifeOS Intelligence Suggestions Card */}
          <div className="glass-card p-5 rounded-3xl border border-purple-500/20 space-y-3 font-mono text-xs">
            <h3 className="font-bold text-purple-300 flex items-center gap-2">
              <Sparkles size={16} className="text-purple-400" /> LifeOS Intelligence
            </h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Click <strong className="text-purple-300 font-bold">"✨ AI Plan My Day"</strong> to generate a conflict-free daily schedule aligned with your peak productive hours.
            </p>
          </div>

        </div>

      </div>

      {/* Modals */}
      <AddEventModal
        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
        onSuccess={fetchScheduleData}
        initialDate={selectedDate}
      />

      <AIPlanMyDayModal
        isOpen={isAiPlanModalOpen}
        onClose={() => setIsAiPlanModalOpen(false)}
        onSuccess={fetchScheduleData}
        initialDate={selectedDate}
      />

    </div>
  );
};
