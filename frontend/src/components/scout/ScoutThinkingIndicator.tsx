import React from 'react';
import { Bot, RefreshCw } from 'lucide-react';

interface ScoutThinkingIndicatorProps {
  stateText?: string;
}

export const ScoutThinkingIndicator: React.FC<ScoutThinkingIndicatorProps> = ({
  stateText = 'Checking your schedule & task priorities...'
}) => {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 font-mono text-xs animate-pulse">
      <div className="w-7 h-7 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
        <Bot size={15} />
      </div>

      <div className="flex items-center gap-2">
        <RefreshCw size={12} className="animate-spin text-cyan-400" />
        <span>SCOUT: {stateText}</span>
      </div>
    </div>
  );
};
