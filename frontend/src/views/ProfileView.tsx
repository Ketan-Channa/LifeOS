import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, Calendar, Globe, Droplet, Sparkles, Edit3, Lock, 
  ShieldCheck, Download, Trash2, CheckCircle2, BarChart2, BookOpen, Bot, 
  Cpu, ArrowRight, Activity
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../services/api';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { ChangePasswordModal } from '../components/profile/ChangePasswordModal';

export const ProfileView: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [usageStats, setUsageStats] = useState({
    tasksCount: 0,
    goalsCount: 0,
    habitsCount: 0,
    documentsCount: 0,
    agentRunsCount: 0
  });

  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    api.get('/auth/export-data').then((res: any) => {
      if (res.data) {
        setUsageStats({
          tasksCount: res.data.tasksCount || 0,
          goalsCount: res.data.goalsCount || 0,
          habitsCount: res.data.habitsCount || 0,
          documentsCount: res.data.documentsCount || 0,
          agentRunsCount: res.data.data?.agentRunsMetadata?.length || 0
        });
      }
    }).catch(() => {});
  }, []);

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    try {
      setIsDeleting(true);
      await api.delete('/auth/account');
      logout();
      navigate('/login');
    } catch (e) {
      setIsDeleting(false);
    }
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'KC';

  return (
    <div className="space-y-6 font-sans select-none pb-16">
      
      {/* Header Banner */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-950/90 text-slate-100 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          
          {/* Avatar / Initials Pill */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 border-2 border-indigo-400/40 flex items-center justify-center text-white font-black text-3xl shadow-2xl shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-3xl object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{user?.name || 'Ketan Channa'}</h1>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-bold uppercase flex items-center gap-1">
                <Sparkles size={12} className="text-amber-400" /> {user?.currentPlan || 'FREE'} PLAN
              </span>
            </div>

            <p className="text-xs text-slate-400 font-mono">{user?.email}</p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-1"><Globe size={13} className="text-cyan-400" /> {user?.timezone || 'Asia/Kolkata'}</span>
              <span className="flex items-center gap-1"><Calendar size={13} className="text-purple-400" /> Member since August 2026</span>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
            >
              <Edit3 size={14} /> EDIT PROFILE
            </button>

            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <Lock size={14} /> CHANGE PASSWORD
            </button>
          </div>

        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Information */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-950/90 text-slate-100 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <User size={18} className="text-purple-400" />
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">PERSONAL INFORMATION</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="text-xs font-mono text-purple-400 hover:underline flex items-center gap-1"
              >
                <Edit3 size={13} /> Edit
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">FULL NAME</span>
                <strong className="text-white font-sans text-sm">{user?.name || 'Ketan Channa'}</strong>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">EMAIL ADDRESS</span>
                <strong className="text-white font-sans text-sm">{user?.email}</strong>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">PHONE NUMBER</span>
                <strong className="text-white font-sans text-sm">{user?.phone || '+91 9876543210'}</strong>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">DATE OF BIRTH / GENDER</span>
                <strong className="text-white font-sans text-sm">{user?.dob || '2005-08-15'} ({user?.sex || 'Male'})</strong>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">BLOOD GROUP</span>
                <strong className="text-white font-sans text-sm">{user?.bloodGroup || 'A+'}</strong>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">TIMEZONE</span>
                <strong className="text-white font-sans text-sm">{user?.timezone || 'Asia/Kolkata'}</strong>
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-950/90 text-slate-100 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Activity size={18} className="text-cyan-400" />
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">LIFEOS USAGE METRICS</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-center font-mono">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-2xl font-black text-white">{usageStats.tasksCount}</span>
                <span className="text-[10px] text-slate-400 uppercase block">TASKS</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-2xl font-black text-white">{usageStats.goalsCount}</span>
                <span className="text-[10px] text-slate-400 uppercase block">GOALS</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-2xl font-black text-white">{usageStats.habitsCount}</span>
                <span className="text-[10px] text-slate-400 uppercase block">HABITS</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-2xl font-black text-white">{usageStats.documentsCount}</span>
                <span className="text-[10px] text-slate-400 uppercase block">DOCUMENTS</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-2xl font-black text-white">{usageStats.agentRunsCount}</span>
                <span className="text-[10px] text-slate-400 uppercase block">AGENT RUNS</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          
          {/* Subscription Plan Card */}
          <div className="glass-card p-6 rounded-3xl border border-purple-500/30 bg-slate-950/90 text-slate-100 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block">CURRENT SUBSCRIPTION</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">ACTIVE</span>
            </div>

            <div>
              <h3 className="text-xl font-black text-white">{user?.currentPlan || 'FREE'} PLAN</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Full access to LifeOS AI Engine, SCOUT & Agent Loop.</p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/plans')}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              UPGRADE PLAN <ArrowRight size={14} />
            </button>
          </div>

          {/* Quick Controls */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-950/90 text-slate-100 space-y-3 shadow-xl font-mono text-xs">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold mb-2">QUICK CONTROLS</span>

            <button
              type="button"
              onClick={() => navigate('/privacy')}
              className="w-full p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center justify-between text-left transition-all"
            >
              <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-cyan-400" /> Privacy & Data Settings</span>
              <ArrowRight size={14} />
            </button>

            <button
              type="button"
              onClick={() => navigate('/assistant')}
              className="w-full p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center justify-between text-left transition-all"
            >
              <span className="flex items-center gap-2"><Bot size={16} className="text-purple-400" /> SCOUT Agent Autonomy</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Danger Zone */}
          <div className="glass-card p-6 rounded-3xl border border-rose-500/30 bg-slate-950/90 text-slate-100 space-y-3 shadow-xl">
            <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider block">DANGER ZONE</span>

            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className={`w-full py-2.5 rounded-2xl font-mono font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 ${
                deleteConfirm
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-950/40 hover:border-rose-500/40'
              }`}
            >
              <Trash2 size={14} /> {isDeleting ? 'Deleting...' : deleteConfirm ? 'CONFIRM PERMANENT DELETION' : 'DELETE ACCOUNT'}
            </button>
          </div>

        </div>

      </div>

      {showEditModal && <EditProfileModal onClose={() => setShowEditModal(false)} onSuccess={() => {}} />}
      {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}

    </div>
  );
};
