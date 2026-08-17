import React, { useState } from 'react';
import { ShieldCheck, Download, Trash2, CheckCircle2, Lock, FileText, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export const PrivacySettingsView: React.FC = () => {
  const [aiDataUsage, setAiDataUsage] = useState(true);
  const [ragIndexing, setRagIndexing] = useState(true);
  const [agentMemory, setAgentMemory] = useState(true);
  const [analyticsCollection, setAnalyticsCollection] = useState(true);

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      setErrorMessage('');
      const res: any = await api.get('/auth/export-data');
      
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lifeos-user-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err: any) {
      setIsExporting(false);
      setErrorMessage(err.message || 'Data export failed.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirmed) {
      setDeleteConfirmed(true);
      return;
    }

    try {
      setIsDeleting(true);
      setErrorMessage('');
      await api.delete('/auth/account');
      localStorage.clear();
      window.location.href = '/login';
    } catch (err: any) {
      setIsDeleting(false);
      setErrorMessage(err.message || 'Account deletion failed.');
    }
  };

  return (
    <div className="space-y-6 font-sans select-none pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">PRIVACY & DATA CONTROLS</h1>
            <p className="text-xs text-slate-400 font-mono">Manage AI data minimization, RAG indexing, data export & account retention.</p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle size={16} /> {errorMessage}
        </div>
      )}

      {/* Toggles */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-950/90 text-slate-100 space-y-4 shadow-xl">
        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">AI DATA MINIMIZATION & PREFERENCES</span>

        <div className="space-y-3 font-mono text-xs">
          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer">
            <div>
              <strong className="block text-white font-sans text-sm">Context Minimization for Gemini AI</strong>
              <p className="text-slate-400 font-sans text-xs mt-0.5">Strip private authentication fields and credentials before sending context to LLMs.</p>
            </div>
            <input
              type="checkbox"
              checked={aiDataUsage}
              onChange={() => setAiDataUsage(!aiDataUsage)}
              className="accent-cyan-500 w-5 h-5"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer">
            <div>
              <strong className="block text-white font-sans text-sm">Personal RAG Knowledge Base Indexing</strong>
              <p className="text-slate-400 font-sans text-xs mt-0.5">Allow uploaded documents to be vector indexed for user-isolated RAG search.</p>
            </div>
            <input
              type="checkbox"
              checked={ragIndexing}
              onChange={() => setRagIndexing(!ragIndexing)}
              className="accent-cyan-500 w-5 h-5"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer">
            <div>
              <strong className="block text-white font-sans text-sm">SCOUT Agent Memory Retention</strong>
              <p className="text-slate-400 font-sans text-xs mt-0.5">Store durable workflow preferences and constraints locally for agent automation.</p>
            </div>
            <input
              type="checkbox"
              checked={agentMemory}
              onChange={() => setAgentMemory(!agentMemory)}
              className="accent-cyan-500 w-5 h-5"
            />
          </label>
        </div>
      </div>

      {/* Export & Deletion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Data Export Card */}
        <div className="glass-card p-6 rounded-3xl border border-indigo-500/30 bg-slate-950/90 text-slate-100 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Download size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">EXPORT MY DATA</h3>
              <p className="text-xs text-slate-400 font-mono">Download complete JSON archive of tasks, goals, habits, schedules & document metadata.</p>
            </div>
          </div>

          {exportSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-mono flex items-center gap-1.5 font-bold">
              <CheckCircle2 size={14} /> DATA ARCHIVE DOWNLOADED SUCCESSFULLY!
            </div>
          )}

          <button
            type="button"
            onClick={handleExportData}
            disabled={isExporting}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download size={15} /> {isExporting ? 'Generating Export...' : 'DOWNLOAD DATA ARCHIVE'}
          </button>
        </div>

        {/* Account Deletion Card */}
        <div className="glass-card p-6 rounded-3xl border border-rose-500/30 bg-slate-950/90 text-slate-100 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600/30 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Trash2 size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">PERMANENT ACCOUNT DELETION</h3>
              <p className="text-xs text-slate-400 font-mono">Controlled deletion of profile, tasks, goals, schedules, documents & agent logs.</p>
            </div>
          </div>

          {deleteConfirmed && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-sans">
              ⚠️ Are you sure? Click again to permanently erase your account and all data.
            </div>
          )}

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className={`w-full py-3 rounded-2xl font-mono font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 ${
              deleteConfirmed
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                : 'bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-950/40 hover:border-rose-500/40'
            }`}
          >
            <Trash2 size={15} /> {isDeleting ? 'Deleting Account...' : deleteConfirmed ? 'CONFIRM PERMANENT DELETION' : 'DELETE MY ACCOUNT'}
          </button>
        </div>

      </div>

    </div>
  );
};
