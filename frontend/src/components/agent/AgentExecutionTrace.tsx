import React, { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp } from 'lucide-react';

interface AgentExecutionTraceProps {
  trace: string[];
}

export const AgentExecutionTrace: React.FC<AgentExecutionTraceProps> = ({ trace }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!trace || trace.length === 0) return null;

  return (
    <div className="rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono select-none overflow-hidden my-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 bg-slate-900/90 text-slate-300 flex items-center justify-between font-bold text-[11px] hover:text-white"
      >
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-cyan-400" />
          <span>SAFE EXECUTION TRACE ({trace.length} LOGS)</span>
        </div>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isOpen && (
        <div className="p-3 bg-slate-950 space-y-1.5 text-[11px] text-slate-400 font-mono max-h-48 overflow-y-auto no-scrollbar border-t border-slate-800/60">
          {trace.map((line, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-cyan-400 shrink-0">›</span>
              <span>{line}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
