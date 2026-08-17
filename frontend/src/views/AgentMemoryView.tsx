import React, { useState, useEffect } from 'react';
import { Brain, Trash2, Plus, CheckCircle2 } from 'lucide-react';
import { getAgentMemories, createAgentMemory, deleteAgentMemory } from '../services/agent.api';
import { AgentMemoryItem } from '../../../shared/types/lifeos.types';

export const AgentMemoryView: React.FC = () => {
  const [memories, setMemories] = useState<AgentMemoryItem[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchMemories = async () => {
    try {
      const list = await getAgentMemories();
      setMemories(list);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleAddMemory = async () => {
    if (!newKey.trim() || !newValue.trim()) return;
    try {
      await createAgentMemory({
        userId: 'default_user',
        type: 'PREFERENCE',
        key: newKey.trim(),
        value: newValue.trim(),
        source: 'USER_EXPLICIT'
      });
      setNewKey('');
      setNewValue('');
      fetchMemories();
    } catch (e) {}
  };

  const handleForget = async (id: string) => {
    if (!window.confirm('Forget this memory preference?')) return;
    try {
      await deleteAgentMemory(id);
      fetchMemories();
    } catch (e) {}
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-purple-500/30 bg-slate-950/90 text-slate-100 font-sans space-y-5 shadow-xl select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Brain size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base tracking-tight">SCOUT AGENT MEMORY</h3>
            <p className="text-xs text-slate-400 font-mono">Durable user preferences and learned workflow constraints.</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300 font-mono font-bold text-xs">
          {memories.length} MEMORIES STORED
        </span>
      </div>

      {/* Memory List */}
      <div className="space-y-2">
        {memories.map((mem) => (
          <div
            key={mem.id}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs flex items-center justify-between transition-all hover:border-slate-700"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold">
                  {mem.type}
                </span>
                <strong className="text-white font-sans text-xs">{mem.key}</strong>
              </div>
              <p className="text-slate-300 font-sans text-xs">{mem.value}</p>
            </div>

            <button
              type="button"
              onClick={() => handleForget(mem.id)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-[11px] font-mono font-bold transition-all flex items-center gap-1"
            >
              <Trash2 size={13} /> Forget This
            </button>
          </div>
        ))}
      </div>

      {/* Add Memory Input */}
      <div className="pt-3 border-t border-slate-800 space-y-2">
        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">ADD EXPLICIT PREFERENCE MEMORY</span>
        
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            placeholder="Preference Key (e.g. focus_block_length)"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
          />

          <input
            type="text"
            placeholder="Preference Value (e.g. User prefers 90-minute focus blocks)"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
          />

          <button
            type="button"
            onClick={handleAddMemory}
            disabled={!newKey.trim() || !newValue.trim()}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Plus size={15} /> Save Memory
          </button>
        </div>
      </div>

    </div>
  );
};
