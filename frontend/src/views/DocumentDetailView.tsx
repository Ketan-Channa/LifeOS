import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Sparkles, Trash2, RefreshCw, Clock, Tag, 
  Layers, CheckCircle2, AlertTriangle, BookOpen, ExternalLink, ShieldCheck 
} from 'lucide-react';
import { getKnowledgeDocumentById, deleteKnowledgeDocument, reprocessKnowledgeDocument } from '../services/knowledge.api';
import { KnowledgeDocumentItem } from '../../../shared/types/lifeos.types';
import { KnowledgeSearch } from '../components/knowledge/KnowledgeSearch';

export const DocumentDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [document, setDocument] = useState<KnowledgeDocumentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isReprocessing, setIsReprocessing] = useState(false);

  const fetchDocument = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError('');
      const doc = await getKnowledgeDocumentById(id);
      setDocument(doc);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load document details.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const handleDelete = async () => {
    if (!document || !window.confirm(`Delete document '${document.title}'?`)) return;
    try {
      await deleteKnowledgeDocument(document.id);
      navigate('/knowledge');
    } catch (err: any) {
      alert(err.message || 'Failed to delete document.');
    }
  };

  const handleReprocess = async () => {
    if (!document) return;
    try {
      setIsReprocessing(true);
      await reprocessKnowledgeDocument(document.id);
      await fetchDocument();
      setIsReprocessing(false);
    } catch (err: any) {
      alert(err.message || 'Failed to restart processing.');
      setIsReprocessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-400 font-mono text-xs">
          <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <span>Loading Document Details...</span>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="p-6 space-y-4">
        <Link to="/knowledge" className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5">
          <ArrowLeft size={16} /> Back to Knowledge Base
        </Link>
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertTriangle size={16} /> {error || 'Document not found'}
        </div>
      </div>
    );
  }

  const tagList = document.tags ? document.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className="space-y-6 font-sans select-none pb-12">
      
      {/* Navigation & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/knowledge" className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5">
          <ArrowLeft size={16} /> Back to Knowledge Base
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReprocess}
            disabled={isReprocessing}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors text-xs font-mono font-bold flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw size={13} className={isReprocessing ? 'animate-spin' : ''} /> Reprocess
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white transition-all text-xs font-mono font-bold flex items-center gap-1.5"
          >
            <Trash2 size={13} /> Delete Document
          </button>
        </div>
      </div>

      {/* Document Overview Banner */}
      <div className="glass-card p-6 rounded-3xl border border-purple-500/30 bg-slate-950/90 text-slate-100 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <FileText size={28} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">{document.title}</h2>
              <p className="text-xs text-slate-400 font-mono">{document.originalFileName} • {document.fileType}</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-950/40 border border-purple-500/30 text-purple-300">
            {document.category}
          </span>
        </div>

        {document.description && (
          <p className="text-xs text-slate-300 leading-relaxed font-sans">{document.description}</p>
        )}

        {/* Telemetry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs pt-1">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">PAGE COUNT</span>
            <strong className="text-base text-white">{document.pageCount} Pages</strong>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">WORD COUNT</span>
            <strong className="text-base text-cyan-400">{document.wordCount.toLocaleString()} Words</strong>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">INDEXED CHUNKS</span>
            <strong className="text-base text-emerald-400">{document.chunks?.length || 0} Chunks</strong>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">STATUS</span>
            <strong className="text-base text-purple-300">{document.processingStatus}</strong>
          </div>
        </div>

        {/* Tags */}
        {tagList.length > 0 && (
          <div className="flex flex-wrap gap-1.5 font-mono text-[11px] pt-1 border-t border-slate-800">
            {tagList.map((tag, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
                <Tag size={11} /> {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Ask SCOUT About This Document */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200 font-mono flex items-center gap-2">
          <Sparkles size={16} className="text-purple-400" /> ASK SCOUT ABOUT THIS DOCUMENT
        </h3>
        <KnowledgeSearch />
      </div>

      {/* Extracted Chunks List Preview */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-200 text-sm font-mono flex items-center gap-2">
            <Layers size={16} className="text-purple-400" /> EXTRACTED RAG CHUNKS ({document.chunks?.length || 0})
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Paragraph-aware chunks with overlap</span>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar font-mono text-xs">
          {document.chunks && document.chunks.length > 0 ? (
            document.chunks.map((chunk, idx) => {
              const meta: any = typeof chunk.metadata === 'string' ? JSON.parse(chunk.metadata || '{}') : chunk.metadata;
              return (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-purple-300 font-bold border-b border-slate-900 pb-1.5">
                    <span>Chunk #{chunk.chunkIndex + 1} • Page {meta?.pageNumber || 1}</span>
                    <span className="text-slate-500">~{chunk.tokenCount} Tokens</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">{chunk.content}</p>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-500 text-center py-4">No vector chunks indexed yet.</p>
          )}
        </div>
      </div>

    </div>
  );
};
