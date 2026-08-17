import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';
import { confirmScoutAction, cancelScoutAction } from '../../services/scout.api';

interface AgentApprovalCenterProps {
  approvalRequest: any;
  onApprovalComplete?: () => void;
}

export const AgentApprovalCenter: React.FC<AgentApprovalCenterProps> = ({ approvalRequest, onApprovalComplete }) => {
  const [status, setStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'>('PENDING');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!approvalRequest) return null;

  const handleApprove = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      const actionId = `appr_${Date.now()}`;
      await confirmScoutAction(actionId, {
        actionType: approvalRequest.actionType || 'APPLY_DAILY_PLAN',
        title: approvalRequest.title,
        parameters: approvalRequest.parameters || {},
        reason: approvalRequest.reason || 'Approved by user via Agent Approval Center',
        requiresConfirmation: true
      });
      setStatus('APPROVED');
      setIsLoading(false);
      if (onApprovalComplete) onApprovalComplete();
    } catch (err: any) {
      setErrorMessage(err.message || 'Revalidation check failed.');
      setStatus('PENDING');
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsLoading(true);
      const actionId = `appr_${Date.now()}`;
      await cancelScoutAction(actionId);
      setStatus('REJECTED');
      setIsLoading(false);
      if (onApprovalComplete) onApprovalComplete();
    } catch (e) {
      setStatus('REJECTED');
      setIsLoading(false);
    }
  };

  if (status === 'APPROVED') {
    return (
      <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>ACTION APPROVED & EXECUTED: <strong>{approvalRequest.title}</strong></span>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-500/20 font-bold text-[10px]">VERIFIED</span>
      </div>
    );
  }

  if (status === 'REJECTED') {
    return (
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono flex items-center gap-2">
        <XCircle size={16} /> Request <strong>{approvalRequest.title}</strong> was rejected.
      </div>
    );
  }

  return (
    <div className="p-5 rounded-3xl bg-slate-950 border border-amber-500/40 text-slate-100 font-sans space-y-3 shadow-xl select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300">
          <ShieldAlert size={18} className="text-amber-400" />
          <span>SCOUT AGENT REQUIRES APPROVAL</span>
        </div>
        
        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
          <Clock size={12} />
          <span>Expires in 30m</span>
        </div>
      </div>

      <div>
        <h4 className="font-extrabold text-sm text-white">{approvalRequest.title}</h4>
        <p className="text-xs text-slate-300 mt-1">{approvalRequest.reason}</p>
      </div>

      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
          {errorMessage}
        </div>
      )}

      {/* Buttons */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
        <button
          type="button"
          onClick={handleReject}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-mono font-bold transition-all"
        >
          REJECT
        </button>

        <button
          type="button"
          onClick={handleApprove}
          disabled={isLoading}
          className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs font-mono transition-all shadow-md flex items-center gap-1.5"
        >
          {isLoading ? 'Revalidating...' : 'APPROVE ACTION'}
        </button>
      </div>

    </div>
  );
};
