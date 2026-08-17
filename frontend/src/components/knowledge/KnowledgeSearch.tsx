import React, { useState } from 'react';
import { Search, Sparkles, AlertTriangle, ShieldCheck, BookOpen, Layers, ArrowRight, RefreshCw } from 'lucide-react';
import { SourceReference } from './SourceReference';
import { queryKnowledge } from '../../services/knowledge.api';
import { GroundedAnswerResponse } from '../../../../shared/types/lifeos.types';

interface KnowledgeSearchProps {
  onOpenDocument?: (docId: string) => void;
}

export const KnowledgeSearch: React.FC<KnowledgeSearchProps> = ({ onOpenDocument }) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<GroundedAnswerResponse | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      setIsLoading(true);
      setError('');

      const res = await queryKnowledge(question.trim());
      setResponse(res);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to query knowledge base.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 font-sans select-none">
      
      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative flex items-center">
          <Search size={18} className="absolute left-4 text-purple-400" />
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your knowledge base... (e.g., 'What does my resume say about React?')"
            className="w-full pl-11 pr-32 py-3.5 rounded-2xl bg-slate-950/90 border border-purple-500/30 text-white placeholder-slate-500 text-sm focus:border-purple-500 focus:outline-none shadow-lg shadow-purple-950/20"
          />

          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="absolute right-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-xs text-white transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Sparkles size={14} /> Ask SCOUT
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 font-mono">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* RAG Answer & Grounded Citations Display */}
      {response && (
        <div className="glass-card p-6 rounded-3xl border border-purple-500/30 space-y-4 bg-slate-950/90 text-slate-100 shadow-xl">
          
          {/* Header & Badges */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400" />
              <span className="font-bold text-sm text-white">GROUNDED SCOUT RAG RESPONSE</span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[10px]">
              {response.insufficientEvidence ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1">
                  <AlertTriangle size={11} /> INSUFFICIENT EVIDENCE
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <ShieldCheck size={12} /> GROUNDED EVIDENCE
                </span>
              )}
            </div>
          </div>

          {/* Answer Body */}
          <div className="text-xs text-slate-200 leading-relaxed font-sans space-y-2 whitespace-pre-line">
            {response.answer}
          </div>

          {/* Source Citations Row */}
          {response.sources && response.sources.length > 0 && (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase block">
                KNOWLEDGE SOURCES ({response.sources.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {response.sources.map((source, idx) => (
                  <SourceReference key={idx} source={source} onOpenDocument={onOpenDocument} />
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
