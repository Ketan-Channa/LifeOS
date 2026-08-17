import React, { useState, useEffect } from 'react';
import { 
  Bot, Sparkles, Send, Play, PauseCircle, RotateCcw, Brain, Sliders, 
  ShieldCheck, CheckCircle2, History, AlertTriangle, ArrowRight, StopCircle
} from 'lucide-react';
import { AgentStatusIndicator } from '../components/agent/AgentStatusIndicator';
import { AgentStepTimeline } from '../components/agent/AgentStepTimeline';
import { AgentApprovalCenter } from '../components/agent/AgentApprovalCenter';
import { AgentExecutionTrace } from '../components/agent/AgentExecutionTrace';
import { AgentSettingsView } from './AgentSettingsView';
import { AgentMemoryView } from './AgentMemoryView';
import { AgentConstraintView } from './AgentConstraintView';
import { 
  runAgentObjective, getAgentRuns, cancelAgentRun, undoAgentAction 
} from '../services/agent.api';
import { AgentRunItem } from '../../../shared/types/lifeos.types';

export const AgentCommandCenter: React.FC = () => {
  const [agentTab, setAgentTab] = useState<'RUN' | 'APPROVALS' | 'MEMORY' | 'SETTINGS' | 'HISTORY'>('RUN');
  
  const [objectiveInput, setObjectiveInput] = useState('');
  const [activeRun, setActiveRun] = useState<AgentRunItem | null>(null);
  const [runHistory, setRunHistory] = useState<AgentRunItem[]>([]);

  const [isRunning, setIsRunning] = useState(false);
  const [undoSuccessMessage, setUndoSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchHistory = async () => {
    try {
      const list = await getAgentRuns();
      setRunHistory(list);
      if (list.length > 0 && !activeRun) {
        setActiveRun(list[0]);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleLaunchObjective = async (textToSend?: string) => {
    const text = textToSend || objectiveInput;
    if (!text.trim()) return;

    setIsRunning(true);
    setErrorMessage('');
    setUndoSuccessMessage('');

    try {
      const result: any = await runAgentObjective(text.trim());
      setActiveRun(result);
      if (!textToSend) setObjectiveInput('');
      setIsRunning(false);
      fetchHistory();
    } catch (err: any) {
      setErrorMessage(err.message || 'Agent loop execution error.');
      setIsRunning(false);
    }
  };

  const handleStopAgent = async () => {
    if (!activeRun) return;
    try {
      await cancelAgentRun(activeRun.id);
      setActiveRun({ ...activeRun, status: 'CANCELLED' });
      setIsRunning(false);
    } catch (e) {}
  };

  const handleUndo = async () => {
    try {
      setErrorMessage('');
      const res = await undoAgentAction(`act_undo_${Date.now()}`);
      setUndoSuccessMessage(res.message || 'Last change successfully undone.');
      setTimeout(() => setUndoSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Undo action failed.');
    }
  };

  return (
    <div className="space-y-5 font-sans select-none pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Bot size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">SCOUT AGENT ENGINE</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold uppercase">
                AUTONOMOUS LOOP
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Observe • Plan • Execute • Evaluate • Adapt</p>
          </div>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setAgentTab('RUN')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              agentTab === 'RUN' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Play size={13} /> Active Run
          </button>

          <button
            type="button"
            onClick={() => setAgentTab('APPROVALS')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              agentTab === 'APPROVALS' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck size={13} /> Approvals
          </button>

          <button
            type="button"
            onClick={() => setAgentTab('MEMORY')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              agentTab === 'MEMORY' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Brain size={13} /> Memory
          </button>

          <button
            type="button"
            onClick={() => setAgentTab('SETTINGS')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              agentTab === 'SETTINGS' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Sliders size={13} /> Settings
          </button>
        </div>
      </div>

      {/* Quick Launch Objective Bar */}
      <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 space-y-3 shadow-lg">
        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">LAUNCH AGENT OBJECTIVE</span>
        
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={objectiveInput}
            onChange={(e) => setObjectiveInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleLaunchObjective(); }}
            placeholder="e.g. 'SCOUT, make tomorrow productive.' or 'SCOUT, help me become placement-ready.'"
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none font-sans"
          />

          <button
            type="button"
            onClick={() => handleLaunchObjective()}
            disabled={isRunning || !objectiveInput.trim()}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 font-mono text-xs shrink-0"
          >
            <Play size={15} /> LAUNCH LOOP
          </button>
        </div>

        {/* Preset Objective Chips */}
        <div className="flex flex-wrap gap-2 pt-1 font-mono text-xs">
          <button
            type="button"
            onClick={() => handleLaunchObjective("SCOUT, make tomorrow productive. Prioritize my placement goal and keep my college schedule fixed.")}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500/40 text-slate-300 text-[11px] font-bold transition-all flex items-center gap-1"
          >
            🎯 Make tomorrow productive
          </button>

          <button
            type="button"
            onClick={() => handleLaunchObjective("SCOUT, help me become placement-ready.")}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500/40 text-slate-300 text-[11px] font-bold transition-all flex items-center gap-1"
          >
            🚀 Prepare placement readiness
          </button>

          <button
            type="button"
            onClick={() => handleLaunchObjective("SCOUT, review how I've been doing this week.")}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-500/40 text-slate-300 text-[11px] font-bold transition-all flex items-center gap-1"
          >
            📊 Review weekly performance
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle size={16} /> {errorMessage}
        </div>
      )}

      {undoSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 size={16} /> {undoSuccessMessage}
        </div>
      )}

      {/* TAB CONTENT: ACTIVE RUN WORKSPACE */}
      {agentTab === 'RUN' && activeRun && (
        <div className="space-y-5">
          
          {/* Active Run Card */}
          <div className="glass-card p-6 rounded-3xl border border-purple-500/30 bg-slate-950/90 text-slate-100 font-sans space-y-4 shadow-xl">
            
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">OBJECTIVE</span>
                <h3 className="font-extrabold text-white text-base tracking-tight">{activeRun.objective}</h3>
              </div>

              <div className="flex items-center gap-2">
                <AgentStatusIndicator status={activeRun.status} />

                {(activeRun.status === 'RUNNING' || activeRun.status === 'EXECUTING') && (
                  <button
                    type="button"
                    onClick={handleStopAgent}
                    className="px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900 border border-rose-500/40 text-rose-300 font-mono font-bold text-xs flex items-center gap-1"
                  >
                    <StopCircle size={14} /> STOP AGENT
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleUndo}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono font-bold text-xs flex items-center gap-1"
                  title="Undo last change"
                >
                  <RotateCcw size={13} /> UNDO CHANGE
                </button>
              </div>
            </div>

            {/* Objective Result Banner */}
            {activeRun.result && (
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs font-sans leading-relaxed text-purple-100">
                <strong className="block text-white font-mono font-bold text-[11px] mb-1">AGENT RESULT:</strong>
                {activeRun.result}
              </div>
            )}

            {/* Pending Approval Card */}
            {activeRun.requiresApproval && activeRun.approvalRequest && (
              <AgentApprovalCenter
                approvalRequest={activeRun.approvalRequest}
                onApprovalComplete={fetchHistory}
              />
            )}

            {/* Execution Timeline */}
            {activeRun.steps && activeRun.steps.length > 0 && (
              <AgentStepTimeline steps={activeRun.steps} currentStepNum={activeRun.currentStep} />
            )}

            {/* Safe Execution Trace */}
            {activeRun.trace && activeRun.trace.length > 0 && (
              <AgentExecutionTrace trace={activeRun.trace} />
            )}

          </div>

        </div>
      )}

      {/* TAB CONTENT: APPROVALS */}
      {agentTab === 'APPROVALS' && (
        <div className="space-y-4">
          {activeRun?.approvalRequest ? (
            <AgentApprovalCenter approvalRequest={activeRun.approvalRequest} onApprovalComplete={fetchHistory} />
          ) : (
            <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center font-mono text-xs text-slate-400 space-y-2">
              <ShieldCheck size={36} className="mx-auto text-emerald-400 opacity-60" />
              <strong className="block text-white text-sm font-sans">No Pending Approvals</strong>
              <p className="text-xs text-slate-400">All write actions have been verified and confirmed.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: MEMORY */}
      {agentTab === 'MEMORY' && <AgentMemoryView />}

      {/* TAB CONTENT: SETTINGS & CONSTRAINTS */}
      {agentTab === 'SETTINGS' && (
        <div className="space-y-5">
          <AgentSettingsView />
          <AgentConstraintView />
        </div>
      )}

    </div>
  );
};
