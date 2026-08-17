import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, Minimize2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { sendScoutChat } from '../services/scout.api';

interface Message {
  id: string;
  sender: 'user' | 'scout';
  text: string;
  timestamp: string;
  sources?: any[];
  actions?: any[];
}

export const ScoutBot: React.FC = () => {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'scout',
      text: `Hello ${user?.name || 'there'}! I am SCOUT, your personal LifeOS AI Assistant. Ask me what to work on today, analyze your productive periods, or request an AI schedule!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const quickPrompts = [
    'What should I work on today?',
    'When am I most productive?',
    'Which tasks am I postponing?',
    'What goals are at risk?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    try {
      const res = await sendScoutChat(text.trim());
      
      const scoutMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'scout',
        text: res.answer || "I am currently analyzing your LifeOS telemetry.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: res.sources,
        actions: res.actions
      };

      setMessages((prev) => [...prev, scoutMsg]);
    } catch (err: any) {
      const scoutMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'scout',
        text: "I am experiencing temporary connection issues with the AI kernel, but your LifeOS schedule and tasks remain available.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, scoutMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title="SCOUT AI Assistant"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white shadow-2xl shadow-indigo-500/50 hover:scale-110 active:scale-95 transition-all duration-300 group border border-white/20 flex items-center justify-center backdrop-blur-md"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute -inset-1.5 rounded-full bg-cyan-400 opacity-75 blur animate-ping" />
            <Bot size={24} className="relative z-10 text-white" />
          </div>

          <span className="absolute bottom-16 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-slate-100 text-[10px] font-mono font-bold px-2 py-1 rounded-lg border border-slate-800 pointer-events-none whitespace-nowrap shadow-md">
            SCOUT AI
          </span>
        </button>
      )}

      {/* SCOUT AI Chatbot Drawer Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md h-[550px] bg-white dark:bg-[#0F172A] border border-slate-300 dark:border-indigo-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-up">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Bot size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">SCOUT</h3>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono font-semibold">
                    REAL AI CO-PILOT
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">LifeOS Telemetry & AI Assistant</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <Minimize2 size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 dark:bg-slate-950/40 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {msg.sender === 'scout' && (
                  <div className="w-7 h-7 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shrink-0 mt-1">
                    <Bot size={14} />
                  </div>
                )}
                
                <div
                  className={`p-3 rounded-2xl space-y-1 shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <span className="text-[9px] opacity-60 block text-right font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 items-center text-slate-500 dark:text-slate-400 italic text-[11px] font-mono">
                <div className="w-7 h-7 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shrink-0">
                  <Bot size={14} />
                </div>
                <span>SCOUT is analyzing LifeOS database telemetry...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-slate-100 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto no-scrollbar text-[11px]">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 shadow-sm transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask SCOUT about your life, tasks, or schedule..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              className="flex-1 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs rounded-xl px-3.5 py-2.5 outline-none border border-slate-300 dark:border-slate-800 focus:border-indigo-500 placeholder:text-slate-400"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
              className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
            </button>
          </div>

        </div>
      )}
    </>
  );
};
