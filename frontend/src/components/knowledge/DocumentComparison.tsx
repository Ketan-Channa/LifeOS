import React, { useState } from 'react';
import { Layers, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { compareKnowledgeDocuments } from '../../services/knowledge.api';
import { KnowledgeDocumentItem, DocumentComparisonResponse } from '../../../../shared/types/lifeos.types';

interface DocumentComparisonProps {
  documents: KnowledgeDocumentItem[];
}

export const DocumentComparison: React.FC<DocumentComparisonProps> = ({ documents }) => {
  const [documentAId, setDocumentAId] = useState<string>(documents[0]?.id || '');
  const [documentBId, setDocumentBId] = useState<string>(documents[1]?.id || documents[0]?.id || '');
  const [isLoading, setIsLoading] = useState(false);
  const [comparison, setComparison] = useState<DocumentComparisonResponse | null>(null);
  const [error, setError] = useState('');

  const handleCompare = async () => {
    if (!documentAId || !documentBId) {
      setError('Please select two documents to compare.');
      return;
    }
    if (documentAId === documentBId) {
      setError('Please select two different documents.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const res = await compareKnowledgeDocuments(documentAId, documentBId);
      setComparison(res);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Document comparison failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-5 font-sans select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-purple-400" />
          <h3 className="font-bold text-slate-100 text-sm font-mono">DOCUMENT COMPARISON ENGINE</h3>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">Side-by-side RAG difference analysis</span>
      </div>

      {error && (
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 font-mono">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Selectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        <div>
          <label className="text-[10px] text-purple-300 font-bold block mb-1 uppercase">DOCUMENT A</label>
          <select
            value={documentAId}
            onChange={(e) => setDocumentAId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-500 focus:outline-none"
          >
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>{doc.title} ({doc.fileType})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] text-indigo-300 font-bold block mb-1 uppercase">DOCUMENT B</label>
          <select
            value={documentBId}
            onChange={(e) => setDocumentBId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-purple-500 focus:outline-none"
          >
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>{doc.title} ({doc.fileType})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleCompare}
          disabled={isLoading || documents.length < 2}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-xs text-white transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 font-mono"
        >
          {isLoading ? 'Comparing Documents...' : 'Compare Side-by-Side'}
        </button>
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-4 pt-3 border-t border-slate-800">
          
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-xs leading-relaxed space-y-1">
            <span className="font-mono font-bold text-purple-300 uppercase block">SCOUT SUMMARY COMPARISON</span>
            <p className="text-slate-200">{comparison.summaryComparison}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            
            {/* Common Info */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase block">COMMON INFORMATION</span>
              <ul className="space-y-1 text-slate-300">
                {comparison.commonInformation.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Differences */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="font-mono text-[10px] text-amber-400 font-bold uppercase block">KEY DIFFERENCES</span>
              <ul className="space-y-1 text-slate-300">
                {comparison.keyDifferences.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <AlertTriangle size={13} className="text-amber-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
