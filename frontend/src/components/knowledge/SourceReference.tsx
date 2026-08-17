import React, { useState } from 'react';
import { BookOpen, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';
import { SourceCitation } from '../../../../shared/types/lifeos.types';

interface SourceReferenceProps {
  source: SourceCitation;
  onOpenDocument?: (docId: string) => void;
}

export const SourceReference: React.FC<SourceReferenceProps> = ({ source, onOpenDocument }) => {
  const [showPreview, setShowPreview] = useState(false);
  const relevancePct = Math.round((source.relevanceScore || 0.85) * 100);

  return (
    <div className="relative inline-block font-sans select-none">
      <button
        type="button"
        onClick={() => setShowPreview(!showPreview)}
        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-purple-500/30 text-purple-300 hover:text-white hover:border-purple-500 transition-all font-mono text-[11px] flex items-center gap-1.5 shadow-sm"
      >
        <BookOpen size={12} className="text-purple-400" />
        <span>{source.documentTitle}</span>
        <span className="text-slate-500">• Page {source.pageNumber}</span>
      </button>

      {/* Popover Excerpt Preview */}
      {showPreview && (
        <div className="absolute bottom-full left-0 mb-2 w-80 p-3.5 rounded-2xl glass-card border border-purple-500/40 bg-slate-950/95 text-slate-100 shadow-2xl z-50 space-y-2">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white min-w-0">
              <FileText size={14} className="text-purple-400 shrink-0" />
              <span className="truncate">{source.documentTitle}</span>
            </div>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
              {relevancePct}% MATCH
            </span>
          </div>

          <div className="text-[11px] text-slate-300 font-mono space-y-1">
            <span className="text-[10px] text-slate-500 block uppercase">SECTION: {source.section} • PAGE {source.pageNumber}</span>
            <p className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 leading-relaxed font-sans text-xs text-slate-200 line-clamp-4">
              "{source.excerpt}"
            </p>
          </div>

          {onOpenDocument && (
            <button
              type="button"
              onClick={() => { setShowPreview(false); onOpenDocument(source.documentId); }}
              className="w-full py-1.5 rounded-xl bg-purple-600/20 text-purple-300 hover:bg-purple-600 hover:text-white transition-all text-xs font-mono font-bold flex items-center justify-center gap-1"
            >
              Open Full Document <ChevronRight size={13} />
            </button>
          )}

        </div>
      )}
    </div>
  );
};
