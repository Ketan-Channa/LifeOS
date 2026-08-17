import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, CheckCircle2, Trash2, Clock, AlertTriangle, ShieldAlert, Bot, Sparkles, X, ArrowRight
} from 'lucide-react';
import { NotificationItem } from '../../../../shared/types/lifeos.types';
import { markNotificationAsRead, markAllNotificationsAsRead, clearNotifications } from '../../services/notifications.api';

interface NotificationCenterProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onRefresh: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications, onClose, onRefresh }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'HIGH'>('ALL');

  const filtered = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'HIGH') return n.priority === 'HIGH' || n.priority === 'CRITICAL';
    return true;
  });

  const handleNotificationClick = async (n: NotificationItem) => {
    if (!n.isRead) {
      try {
        await markNotificationAsRead(n.id);
        onRefresh();
      } catch (e) {}
    }
    onClose();
    if (n.actionUrl) {
      navigate(n.actionUrl);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      onRefresh();
    } catch (e) {}
  };

  const handleClearAll = async () => {
    try {
      await clearNotifications();
      onRefresh();
    } catch (e) {}
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[9px] border border-rose-500/30">CRITICAL</span>;
      case 'HIGH': return <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px] border border-amber-500/30">HIGH</span>;
      case 'MEDIUM': return <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[9px]">MED</span>;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TASK_OVERDUE':
      case 'TASK_DUE': return <Clock size={14} className="text-rose-400" />;
      case 'GOAL_RISK': return <AlertTriangle size={14} className="text-amber-400" />;
      case 'AGENT_ACTION': return <ShieldAlert size={14} className="text-purple-400" />;
      case 'SCOUT':
      case 'AI_RECOMMENDATION': return <Bot size={14} className="text-cyan-400" />;
      default: return <Sparkles size={14} className="text-indigo-400" />;
    }
  };

  return (
    <div className="absolute right-0 top-12 w-80 md:w-96 glass-panel rounded-3xl border border-slate-800/80 bg-slate-950/95 text-slate-100 font-sans shadow-2xl z-50 select-none overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-purple-400" />
          <h3 className="font-extrabold text-sm text-white tracking-tight">NOTIFICATIONS</h3>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="px-2.5 py-1 rounded-lg text-[10px] font-mono text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            Mark all read
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-2 border-b border-slate-800/50 flex items-center gap-2 font-mono text-[11px]">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`px-2.5 py-1 rounded-lg transition-all ${filter === 'ALL' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          All ({notifications.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('UNREAD')}
          className={`px-2.5 py-1 rounded-lg transition-all ${filter === 'UNREAD' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          Unread ({notifications.filter(n => !n.isRead).length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('HIGH')}
          className={`px-2.5 py-1 rounded-lg transition-all ${filter === 'HIGH' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
        >
          Priority
        </button>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto no-scrollbar p-2 space-y-1.5">
        {filtered.length === 0 ? (
          <div className="p-8 text-center font-mono text-xs text-slate-400 space-y-2">
            <Bell size={28} className="mx-auto text-emerald-400 opacity-60" />
            <strong className="block text-white font-sans text-xs">You're all caught up!</strong>
            <p className="text-[11px] text-slate-400">No new notifications in this category.</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                !n.isRead
                  ? 'bg-purple-950/30 border-purple-500/30 text-white hover:border-purple-500/50'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
                  {getTypeIcon(n.type)}
                  <span className="text-slate-200">{n.title}</span>
                </div>
                {getPriorityBadge(n.priority)}
              </div>

              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">{n.message}</p>

              <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {n.actionUrl && <span className="text-purple-400 flex items-center gap-0.5">View <ArrowRight size={10} /></span>}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-2 border-t border-slate-800/80 text-center">
          <button
            type="button"
            onClick={handleClearAll}
            className="w-full py-1.5 text-[11px] font-mono text-slate-400 hover:text-rose-400 transition-colors flex items-center justify-center gap-1"
          >
            <Trash2 size={12} /> Clear Notification Center
          </button>
        </div>
      )}

    </div>
  );
};
