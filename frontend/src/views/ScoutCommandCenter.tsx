import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Sparkles, Send, Plus, Trash2, MessageSquare, 
  Sun, Award, ShieldCheck, RefreshCw, ChevronRight, Layers, ArrowLeft
} from 'lucide-react';
import { ScoutQuickActions } from '../components/scout/ScoutQuickActions';
import { ScoutActionPreview } from '../components/scout/ScoutActionPreview';
import { ScoutSourceList } from '../components/scout/ScoutSourceList';
import { ScoutThinkingIndicator } from '../components/scout/ScoutThinkingIndicator';
import { ScoutDailyBriefing } from '../components/scout/ScoutDailyBriefing';
import { ScoutWeeklyReview } from '../components/scout/ScoutWeeklyReview';
import { AgentCommandCenter } from './AgentCommandCenter';
import { 
  sendScoutChat, getScoutConversations, getScoutConversationById, 
  createScoutConversation, deleteScoutConversation 
} from '../services/scout.api';
import { ScoutConversationItem, ScoutMessageItem, ScoutActionItem, ScoutSourceBadge } from '../../../shared/types/lifeos.types';

export const ScoutCommandCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CHAT' | 'BRIEFING' | 'WEEKLY' | 'AGENT'>('AGENT');

  const [conversations, setConversations] = useState<ScoutConversationItem[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ScoutMessageItem[]>([]);

  const [isTyping, setIsTyping] = useState(false);
  const [thinkingState, setThinkingState] = useState('Checking your schedule & task priorities...');
  const [error, setError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const list = await getScoutConversations();
      setConversations(list);
      if (list.length > 0 && !currentConvId) {
        setCurrentConvId(list[0].id);
        loadConversation(list[0].id);
      }
    } catch (e) {}
  };

  const loadConversation = async (convId: string) => {
    try {
      const conv = await getScoutConversationById(convId);
      setMessages(conv.messages || []);
      setCurrentConvId(convId);
    } catch (e) {}
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleCreateNewConversation = async () => {
    try {
      const newConv = await createScoutConversation('New SCOUT Chat');
      setConversations([newConv, ...conversations]);
      setCurrentConvId(newConv.id);
      setMessages([]);
    } catch (e) {}
  };

  const handleDeleteConv = async (convId: string) => {
    if (!window.confirm('Delete conversation?')) return;
    try {
      await deleteScoutConversation(convId);
      const remaining = conversations.filter(c => c.id !== convId);
      setConversations(remaining);
      if (remaining.length > 0) {
        setCurrentConvId(remaining[0].id);
        loadConversation(remaining[0].id);
      } else {
        setCurrentConvId(null);
        setMessages([]);
      }
    } catch (e) {}
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ScoutMessageItem = {
      id: `usr_${Date.now()}`,
      conversationId: currentConvId || '',
      userId: 'default_user',
      role: 'USER',
      content: text.trim(),
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);
    setError('');

    // Dynamic safe status messages
    if (text.toLowerCase().includes('schedule') || text.toLowerCase().includes('plan')) {
      setThinkingState('Reviewing schedule & task constraints...');
    } else if (text.toLowerCase().includes('resume') || text.toLowerCase().includes('document')) {
      setThinkingState('Searching your RAG knowledge base...');
    } else {
      setThinkingState('Analyzing task risks & productivity telemetry...');
    }

    try {
      const result = await sendScoutChat(text.trim(), currentConvId || undefined);

      if (result.conversationId && result.conversationId !== currentConvId) {
        setCurrentConvId(result.conversationId);
        fetchConversations();
      }

      const scoutMsg: ScoutMessageItem = {
        id: `ast_${Date.now()}`,
        conversationId: result.conversationId || currentConvId || '',
        userId: 'default_user',
        role: 'ASSISTANT',
        content: result.answer,
        intent: result.intent,
        sources: result.sources,
        actions: result.actions,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, scoutMsg]);
      setIsTyping(false);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to SCOUT AI service.');
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-5 font-sans select-none pb-12">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Bot size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">SCOUT AI</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold">
                UNIFIED LIFE AGENT
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Your LifeOS intelligence layer.</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('AGENT' as any)}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === ('AGENT' as any) ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Bot size={14} /> AGENT MODE
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CHAT')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'CHAT' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} /> SCOUT Chat
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('BRIEFING')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'BRIEFING' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Sun size={14} /> Daily Briefing
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('WEEKLY')}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'WEEKLY' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Award size={14} /> Weekly Review
          </button>
        </div>
      </div>

      {/* TAB CONTENT: AGENT ENGINE */}
      {activeTab === 'AGENT' && <AgentCommandCenter />}

      {/* TAB CONTENT: DAILY BRIEFING */}
      {activeTab === 'BRIEFING' && <ScoutDailyBriefing />}

      {/* TAB CONTENT: WEEKLY REVIEW */}
      {activeTab === 'WEEKLY' && <ScoutWeeklyReview />}

      {/* TAB CONTENT: SCOUT CHAT WORKSPACE */}
      {activeTab === 'CHAT' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[650px]">
          
          {/* Conversation History Sidebar */}
          <div className="hidden lg:flex flex-col glass-card rounded-3xl border border-slate-800 p-4 space-y-3 bg-slate-950/80">
            <button
              type="button"
              onClick={handleCreateNewConversation}
              className="w-full py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 hover:bg-purple-600 hover:text-white font-mono font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <Plus size={16} /> New Conversation
            </button>

            <span className="text-[10px] text-slate-500 font-mono uppercase font-bold tracking-wider block pt-2">
              RECENT CONVERSATIONS
            </span>

            <div className="flex-1 overflow-y-auto space-y-1.5 no-scrollbar">
              {conversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => loadConversation(c.id)}
                  className={`p-3 rounded-2xl cursor-pointer font-mono text-xs flex items-center justify-between transition-all ${
                    c.id === currentConvId ? 'bg-purple-950/60 border border-purple-500/40 text-purple-200' : 'bg-slate-900/60 hover:bg-slate-900 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare size={14} className="shrink-0 text-purple-400" />
                    <span className="truncate">{c.title}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDeleteConv(c.id); }}
                    className="text-slate-600 hover:text-rose-400 p-1"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Workspace */}
          <div className="lg:col-span-3 glass-card rounded-3xl border border-slate-800 flex flex-col overflow-hidden bg-slate-950/90 shadow-2xl">
            
            {/* Quick Actions Bar */}
            <div className="p-3 bg-slate-900/90 border-b border-slate-800">
              <ScoutQuickActions onActionClick={(prompt) => handleSendMessage(prompt)} />
            </div>

            {/* Chat Timeline */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs font-sans">
              {messages.length === 0 ? (
                <div className="text-center py-12 space-y-4 font-sans select-none">
                  <div className="w-16 h-16 rounded-3xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto shadow-xl">
                    <Bot size={34} />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">SCOUT AI</h3>
                    <p className="text-xs text-purple-300 font-mono">Your Personal Life Intelligence Layer</p>
                  </div>

                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    "I'm ready when you are. Add your tasks, goals, schedule or knowledge base, and I'll start learning and optimizing your workflow."
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-center gap-2 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => handleSendMessage("SCOUT, what should I focus on today?")}
                      className="px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 hover:bg-purple-900 font-bold"
                    >
                      ✦ What should I focus on today?
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendMessage("SCOUT, plan my day.")}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                    >
                      📅 Plan My Day
                    </button>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const sources: ScoutSourceBadge[] = typeof msg.sources === 'string' ? JSON.parse(msg.sources || '[]') : (msg.sources || []);
                  const actions: ScoutActionItem[] = typeof msg.actions === 'string' ? JSON.parse(msg.actions || '[]') : (msg.actions || []);

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[88%] ${msg.role === 'USER' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                    >
                      {msg.role === 'ASSISTANT' && (
                        <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0 mt-1">
                          <Bot size={16} />
                        </div>
                      )}

                      <div
                        className={`p-4 rounded-2xl space-y-3 shadow-md ${
                          msg.role === 'USER'
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none'
                            : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
                        }`}
                      >
                        {msg.intent && msg.role === 'ASSISTANT' && (
                          <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5 font-mono text-[10px]">
                            <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300 font-bold uppercase">
                              {msg.intent}
                            </span>
                          </div>
                        )}

                        <div className="leading-relaxed whitespace-pre-wrap font-sans text-xs">{msg.content}</div>

                        {/* RAG & Telemetry Sources */}
                        {sources.length > 0 && <ScoutSourceList sources={sources} />}

                        {/* Interactive Proposed Write Actions */}
                        {actions.length > 0 && (
                          <div className="space-y-2 pt-1 border-t border-slate-800">
                            {actions.map((act, idx) => (
                              <ScoutActionPreview key={idx} action={act} onActionComplete={fetchConversations} />
                            ))}
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })
              )}

              {isTyping && <ScoutThinkingIndicator stateText={thinkingState} />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                placeholder="Ask SCOUT about your tasks, goals, schedule, RAG knowledge, or request an action..."
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none font-sans"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isTyping}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 font-mono text-xs"
              >
                <Send size={15} /> Send
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
