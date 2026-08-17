import React from 'react';
import { Database, BookOpen, Cpu, Sparkles } from 'lucide-react';
import { ScoutSourceBadge } from '../../../../shared/types/lifeos.types';

interface ScoutSourceListProps {
  sources: ScoutSourceBadge[];
}

export const ScoutSourceList: React.FC<ScoutSourceListProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'KNOWLEDGE_BASE': return <BookOpen size={11} className="text-purple-400" />;
      case 'ML_PREDICTION': return <Cpu size={11} className="text-cyan-400" />;
      case 'AI_RECOMMENDATION': return <Sparkles size={11} className="text-amber-400" />;
      default: return <Database size={11} className="text-indigo-400" />;
    }
  };

  const getSourceStyle = (type: string) => {
    switch (type) {
      case 'KNOWLEDGE_BASE': return 'bg-purple-950/40 border-purple-500/30 text-purple-300';
      case 'ML_PREDICTION': return 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300';
      case 'AI_RECOMMENDATION': return 'bg-amber-950/40 border-amber-500/30 text-amber-300';
      default: return 'bg-indigo-950/40 border-indigo-500/30 text-indigo-300';
    }
  };

  return (
    <div className="space-y-1.5 font-mono text-[10px]">
      <span className="text-slate-500 uppercase font-bold tracking-wider block">SOURCES & ATTRIBUTION:</span>
      <div className="flex flex-wrap gap-1.5">
        {sources.map((source, idx) => (
          <span
            key={idx}
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 font-bold ${getSourceStyle(source.type)}`}
            title={source.details || undefined}
          >
            {getSourceIcon(source.type)}
            <span>{source.label}</span>
            {source.details && <span className="opacity-60 font-normal">• {source.details}</span>}
          </span>
        ))}
      </div>
    </div>
  );
};
