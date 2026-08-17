import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getNotes, createNote, deleteNote } from '../services/notes.api';
import { NoteItem } from '../../../shared/types/lifeos.types';

export const NotesView: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fetchNotesData = async () => {
    try {
      setIsLoading(true);
      const data = await getNotes();
      setNotes(data);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotesData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    await createNote({ title, content, category: 'General' });
    setTitle('');
    setContent('');
    fetchNotesData();
  };

  const handleDelete = async (id: string) => {
    await deleteNote(id);
    fetchNotesData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="text-amber-400" /> Notes & Brain Dump
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Store architectural notes, ideas, and structured context for future RAG vector embeddings</p>
      </div>

      <form onSubmit={handleCreate} className="glass-card p-5 rounded-3xl space-y-3">
        <input
          type="text"
          placeholder="Note Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-slate-950 text-slate-100 text-sm font-bold rounded-xl p-3 border border-slate-800 focus:border-indigo-500 outline-none"
          required
        />
        <textarea
          placeholder="Write your note content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl p-3 border border-slate-800 focus:border-indigo-500 outline-none h-24 resize-none"
          required
        />
        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="sm" leftIcon={<Plus size={16} />}>
            Save Note
          </Button>
        </div>
      </form>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-xs font-mono text-slate-400">Loading notes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div key={note.id} className="p-5 rounded-3xl glass-card border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{note.title}</h3>
                <button onClick={() => handleDelete(note.id)} className="text-slate-500 hover:text-rose-400">
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
