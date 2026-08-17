import React from 'react';
import { FileText, FileCode, BookOpen, Trash2, ExternalLink, Sparkles, AlertTriangle, RefreshCw, Tag, Clock, Layers } from 'lucide-react';
import { KnowledgeDocumentItem } from '../../../../shared/types/lifeos.types';

interface KnowledgeDocumentCardProps {
  document: KnowledgeDocumentItem;
  onOpen: (docId: string) => void;
  onAskScout: (doc: KnowledgeDocumentItem) => void;
  onDelete: (docId: string) => void;
}

export const KnowledgeDocumentCard: React.FC<KnowledgeDocumentCardProps> = ({
  document,
  onOpen,
  onAskScout,
  onDelete
}) => {
  const getFileIcon = (fileType: string) => {
    const ft = fileType.toUpperCase();
    if (ft.includes('PDF')) return <FileText className="text-rose-400" size={22} />;
    if (ft.includes('DOC')) return <FileText className="text-blue-400" size={22} />;
    if (ft.includes('MD')) return <FileCode className="text-emerald-400" size={22} />;
    return <BookOpen className="text-purple-400" size={22} />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READY':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">READY</span>;
      case 'PROCESSING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <RefreshCw size={10} className="animate-spin" /> PROCESSING
          </span>
        );
      case 'FAILED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30">FAILED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400">UPLOADED</span>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const tagList = document.tags ? document.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-4 hover:border-purple-500/40 transition-all font-sans select-none flex flex-col justify-between">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
              {getFileIcon(document.fileType)}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-sm text-slate-100 truncate hover:text-purple-300 cursor-pointer" onClick={() => onOpen(document.id)}>
                {document.title}
              </h4>
              <p className="text-[11px] text-slate-400 font-mono truncate">{document.originalFileName}</p>
            </div>
          </div>

          <div className="shrink-0">{getStatusBadge(document.processingStatus)}</div>
        </div>

        {document.description && (
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{document.description}</p>
        )}
      </div>

      {/* Category & Tags */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
          <span className="px-2 py-0.5 rounded-md bg-purple-950/40 border border-purple-500/30 text-purple-300 font-bold">
            {document.category}
          </span>

          {tagList.map((tag, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1">
              <Tag size={9} /> {tag}
            </span>
          ))}
        </div>

        {/* Telemetry Row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
          <span>{document.pageCount} {document.pageCount === 1 ? 'Page' : 'Pages'} • {document.wordCount.toLocaleString()} Words</span>
          <span>{formatFileSize(document.fileSize)}</span>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => onOpen(document.id)}
          className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors text-xs font-bold font-mono flex items-center gap-1"
        >
          <ExternalLink size={13} /> Open
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAskScout(document)}
            className="px-3 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600 hover:text-white transition-all text-xs font-bold font-mono flex items-center gap-1"
          >
            <Sparkles size={13} /> Ask SCOUT
          </button>

          <button
            type="button"
            onClick={() => onDelete(document.id)}
            className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete Document"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

    </div>
  );
};
