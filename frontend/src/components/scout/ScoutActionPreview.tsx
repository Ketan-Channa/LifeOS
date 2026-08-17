import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, XCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { ScoutActionItem } from '../../../../shared/types/lifeos.types';
import { confirmScoutAction, cancelScoutAction } from '../../services/scout.api';

interface ScoutActionPreviewProps {
  action: ScoutActionItem;
  onActionComplete?: () => void;
}

export const ScoutActionPreview: React.FC<ScoutActionPreviewProps> = ({ action, onActionComplete }) => {
  const initialStatus = action.status === 'COMPLETED' ? 'CONFIRMED' : (action.status as any) || 'PENDING';
  const [status, setStatus] = useState<'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'FAILED'>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const actionId = action.id || `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      await confirmScoutAction(actionId, action);
      setStatus('CONFIRMED');
      setIsLoading(false);
      if (onActionComplete) onActionComplete();
    } catch (err: any) {
      setErrorMessage(err.message || 'Action revalidation failed.');
      setStatus('FAILED');
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      await cancelScoutAction(actionId);
      setStatus('CANCELLED');
      setIsLoading(false);
      if (onActionComplete) onActionComplete();
    } catch (e) {
      setStatus('CANCELLED');
      setIsLoading(false);
    }
  };

  if (status === 'CONFIRMED') {
    return (
      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>SCOUT ACTION CONFIRMED & EXECUTED: <strong>{action.title}</strong></span>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500/20 font-bold text-[10px]">EXECUTED</span>
      </div>
    );
  }

  if (status === 'CANCELLED') {
    return (
      <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono flex items-center gap-2">
        <XCircle size={15} /> Action <strong>{action.title}</strong> was cancelled.
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 text-slate-100 font-sans space-y-3 shadow-lg my-2 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300">
          <ShieldAlert size={16} className="text-amber-400" />
          <span>SCOUT ACTION REQUIRES CONFIRMATION</span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
          {action.actionType}
        </span>
      </div>

      <h4 className="font-bold text-sm text-white">{action.title}</h4>

      {/* Diff View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono bg-slate-900/90 p-3 rounded-xl border border-slate-800">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">OLD VALUE</span>
          <span className="text-slate-400">{action.oldValue ? String(action.oldValue) : '(None)'}</span>
        </div>
        <div>
          <span className="text-[10px] text-purple-300 block uppercase">NEW PROPOSED VALUE</span>
          <span className="text-emerald-300 font-bold">{action.newValue ? String(action.newValue) : JSON.stringify(action.parameters || {})}</span>
        </div>
      </div>

      {action.reason && (
        <p className="text-xs text-slate-300 font-mono text-[11px]">
          <span className="text-slate-500">REASON:</span> {action.reason}
        </p>
      )}

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle size={15} /> {errorMessage}
        </div>
      )}

      {/* Action Confirmation Bar */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isLoading}
          className="px-4 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-mono transition-colors"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isLoading}
          className="px-5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs font-mono transition-all shadow-md flex items-center gap-1.5"
        >
          {isLoading ? 'Revalidating...' : 'Confirm Action'}
        </button>
      </div>

    </div>
  );
};
