import React from 'react';
import { Eye, Compass, Layers, PauseCircle, Play, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface AgentStatusIndicatorProps {
  status: string;
}

export const AgentStatusIndicator: React.FC<AgentStatusIndicatorProps> = ({ status }) => {
  const getStatusIcon = (st: string) => {
    switch (st) {
      case 'OBSERVING': return <Eye size={13} className="text-cyan-400 animate-pulse" />;
      case 'PLANNING': return <Compass size={13} className="text-purple-400 animate-spin" />;
      case 'WAITING_FOR_APPROVAL': return <PauseCircle size={13} className="text-amber-400 animate-bounce" />;
      case 'EXECUTING': return <Play size={13} className="text-indigo-400 animate-pulse" />;
      case 'EVALUATING': return <Layers size={13} className="text-blue-400" />;
      case 'COMPLETED': return <CheckCircle2 size={13} className="text-emerald-400" />;
      case 'FAILED': return <AlertTriangle size={13} className="text-rose-400" />;
      case 'CANCELLED': return <XCircle size={13} className="text-slate-400" />;
      default: return <Compass size={13} className="text-purple-400" />;
    }
  };

  const getStatusStyle = (st: string) => {
    switch (st) {
      case 'OBSERVING': return 'bg-cyan-950/50 border-cyan-500/40 text-cyan-300';
      case 'PLANNING': return 'bg-purple-950/50 border-purple-500/40 text-purple-300';
      case 'WAITING_FOR_APPROVAL': return 'bg-amber-950/50 border-amber-500/40 text-amber-300';
      case 'EXECUTING': return 'bg-indigo-950/50 border-indigo-500/40 text-indigo-300';
      case 'COMPLETED': return 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300';
      case 'FAILED': return 'bg-rose-950/50 border-rose-500/40 text-rose-300';
      default: return 'bg-slate-900 border-slate-800 text-slate-300';
    }
  };

  return (
    <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 font-mono text-xs font-bold ${getStatusStyle(status)} shadow-sm`}>
      {getStatusIcon(status)}
      <span>AGENT STATUS: {status.replace(/_/g, ' ')}</span>
    </div>
  );
};
