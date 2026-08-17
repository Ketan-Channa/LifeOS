import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Plus, Search, Sparkles, FileText, Layers, Tag, 
  RefreshCw, Filter, Compass, AlertTriangle, ChevronRight 
} from 'lucide-react';
import { KnowledgeDocumentCard } from '../components/knowledge/KnowledgeDocumentCard';
import { DocumentUploadModal } from '../components/modals/DocumentUploadModal';
import { KnowledgeSearch } from '../components/knowledge/KnowledgeSearch';
import { DocumentComparison } from '../components/knowledge/DocumentComparison';
import { getKnowledgeDocuments, getKnowledgeStats, deleteKnowledgeDocument } from '../services/knowledge.api';
import { KnowledgeDocumentItem, KnowledgeStats } from '../../../shared/types/lifeos.types';

export const KnowledgeView: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'LIBRARY' | 'SEARCH' | 'COMPARE'>('LIBRARY');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const [documents, setDocuments] = useState<KnowledgeDocumentItem[]>([]);
  const [stats, setStats] = useState<KnowledgeStats | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [docsData, statsData] = await Promise.all([
        getKnowledgeDocuments({ category: categoryFilter }),
        getKnowledgeStats().catch(() => null)
      ]);
      setDocuments(docsData);
      setStats(statsData);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch knowledge base documents.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter]);

  const handleDeleteDocument = async (docId: string) => {
    if (!window.confirm('Are you sure you want to delete this document and its vectors?')) return;
    try {
      await deleteKnowledgeDocument(docId);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete document.');
    }
  };

  const handleAskScoutForDoc = (doc: KnowledgeDocumentItem) => {
    setActiveTab('SEARCH');
  };

  const formatWordCountDisplay = (words: number) => {
    if (words >= 1000) {
      return `${(words / 1000).toFixed(0)}K`;
    }
    return `${words}`;
  };

  return (
    <div className="space-y-6 font-sans select-none pb-12">
      
      {/* Header & Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BookOpen size={26} className="text-purple-400" /> KNOWLEDGE BASE
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Your personal knowledge, connected to LifeOS.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('SEARCH')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'SEARCH' ? 'bg-purple-600/20 border border-purple-500 text-purple-300' : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Search size={14} /> Search Knowledge
          </button>

          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-xs text-white transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2"
          >
            <Plus size={16} /> Upload Document
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 font-mono">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Dynamic Knowledge Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="glass-card p-4 rounded-3xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">DOCUMENTS</span>
          <strong className="text-2xl font-bold text-white leading-none">
            {stats?.totalDocuments || documents.length || 0}
          </strong>
        </div>

        <div className="glass-card p-4 rounded-3xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">PAGES</span>
          <strong className="text-2xl font-bold text-cyan-400 leading-none">
            {stats?.totalPages || 0}
          </strong>
        </div>

        <div className="glass-card p-4 rounded-3xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">WORDS</span>
          <strong className="text-2xl font-bold text-purple-300 leading-none">
            {formatWordCountDisplay(stats?.totalWords || 0)}
          </strong>
        </div>

        <div className="glass-card p-4 rounded-3xl border border-slate-800 space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">TOPICS</span>
          <strong className="text-2xl font-bold text-emerald-400 leading-none">
            {stats?.categoriesCount || 1}
          </strong>
        </div>
      </div>

      {/* Workspace Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('LIBRARY')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'LIBRARY' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen size={14} /> Document Library ({documents.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SEARCH')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'SEARCH' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} /> Grounded RAG QA
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('COMPARE')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'COMPARE' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Layers size={14} /> Compare Documents
          </button>
        </div>

        {/* Category Filter */}
        {activeTab === 'LIBRARY' && (
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
              <Filter size={12} /> CATEGORY:
            </span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Study">Study</option>
              <option value="College">College</option>
              <option value="Career">Career</option>
              <option value="Projects">Projects</option>
              <option value="Research">Research</option>
              <option value="Personal">Personal</option>
              <option value="Finance">Finance</option>
              <option value="Technical">Technical</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB CONTENT 1: DOCUMENT LIBRARY GRID */}
      {activeTab === 'LIBRARY' && (
        <div>
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[30vh]">
              <div className="flex flex-col items-center gap-3 text-slate-400 font-mono text-xs">
                <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                <span>Loading Knowledge Library...</span>
              </div>
            </div>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <KnowledgeDocumentCard
                  key={doc.id}
                  document={doc}
                  onOpen={(id) => navigate(`/knowledge/${id}`)}
                  onAskScout={handleAskScoutForDoc}
                  onDelete={handleDeleteDocument}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 rounded-3xl border border-slate-800 text-center space-y-4 font-mono text-xs">
              <BookOpen size={40} className="mx-auto text-purple-400 opacity-60" />
              <div className="space-y-1">
                <strong className="block text-base text-white font-sans">No Documents Found</strong>
                <p className="text-slate-400">Upload your notes, resumes, or project files to connect your personal knowledge to LifeOS.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all inline-flex items-center gap-2"
              >
                <Plus size={16} /> Upload First Document
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: GROUNDED RAG SEARCH & QA */}
      {activeTab === 'SEARCH' && (
        <KnowledgeSearch onOpenDocument={(id) => navigate(`/knowledge/${id}`)} />
      )}

      {/* TAB CONTENT 3: DOCUMENT COMPARISON ENGINE */}
      {activeTab === 'COMPARE' && (
        <DocumentComparison documents={documents} />
      )}

      {/* UPLOAD MODAL */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={fetchData}
      />

    </div>
  );
};
