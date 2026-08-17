import React, { useState, useRef } from 'react';
import { Upload, X, FileText, AlertTriangle, CheckCircle2, Tag, Layers } from 'lucide-react';
import { uploadKnowledgeDocument } from '../../services/knowledge.api';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  'Study', 'College', 'Career', 'Projects',
  'Research', 'Personal', 'Finance', 'Technical', 'Other'
];

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Study');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    setError('');
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const allowed = ['.pdf', '.docx', '.doc', '.txt', '.md', '.markdown'];

    if (!allowed.includes(ext)) {
      setError('Unsupported file type. Supported formats: PDF, DOCX, TXT, MD.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Maximum document size is 10 MB.');
      return;
    }

    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a document file to upload.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title || selectedFile.name);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('tags', tags);

      await uploadKnowledgeDocument(formData);

      setIsLoading(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload document.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-xl glass-card rounded-3xl border border-purple-500/30 p-6 space-y-5 bg-slate-950/95 text-slate-100 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Upload size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">UPLOAD DOCUMENT</h3>
              <p className="text-xs text-slate-400 font-mono">PDF, DOCX, TXT, or MD (Max 10 MB)</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 font-mono">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          
          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
              isDragOver ? 'border-purple-500 bg-purple-500/10' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              accept=".pdf,.docx,.doc,.txt,.md,.markdown"
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex items-center justify-center gap-3 text-purple-300">
                <FileText size={24} />
                <div className="text-left font-mono">
                  <strong className="block text-sm font-bold text-white">{selectedFile.name}</strong>
                  <span className="text-[11px] text-slate-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-slate-400">
                <Upload size={32} className="mx-auto text-purple-400 opacity-80" />
                <p className="font-bold text-slate-200">Drag & Drop your document here, or click to browse</p>
                <p className="text-[11px] text-slate-500 font-mono">Supported formats: PDF, DOCX, TXT, MD</p>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase font-bold">Document Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. DBMS Notes, Resume, React Docs"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase font-bold">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-purple-500 focus:outline-none"
              >
                {CATEGORIES.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase font-bold">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary or context about this document..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-mono block mb-1 uppercase font-bold">Tags (Comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. React, Python, ML, Placement"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none font-mono"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || !selectedFile}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold text-white transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Uploading & Processing...
                </>
              ) : (
                <>
                  <Upload size={15} /> Upload & Extract RAG Vectors
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
