import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  Calendar, 
  RotateCcw, 
  BarChart3, 
  FileText, 
  BookOpen,
  Bot, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Cpu,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Tasks', path: '/tasks', icon: <CheckSquare size={20} /> },
    { label: 'Goals', path: '/goals', icon: <Target size={20} /> },
    { label: 'Schedule', path: '/schedule', icon: <Calendar size={20} /> },
    { label: 'Habits', path: '/habits', icon: <RotateCcw size={20} /> },
    { label: 'Analytics', path: '/analytics', icon: <BarChart3 size={20} /> },
    { label: 'Knowledge Base', path: '/knowledge', icon: <BookOpen size={20} /> },
    { label: 'Notes', path: '/notes', icon: <FileText size={20} /> },
    { label: 'AI Assistant', path: '/assistant', icon: <Bot size={20} /> },
    { label: 'My Profile', path: '/profile', icon: <ShieldCheck size={20} /> },
    { label: 'Settings', path: '/settings', icon: <Settings size={20} /> }
  ];

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 bg-white/90 dark:bg-slate-950/80 border-r border-slate-200 dark:border-slate-800/80 backdrop-blur-xl transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-20 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 shrink-0">
        <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Cpu size={22} />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                LIFE<span className="text-gradient">OS</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 tracking-wider">v1.0.0 Phase 13</span>
            </div>
          )}
        </Link>

        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto no-scrollbar">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/90'
              }`}
            >
              <div className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
                {item.icon}
              </div>

              {!isCollapsed && <span className="truncate">{item.label}</span>}

              {/* Active Indicator Bar */}
              {isActive && !isCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Upgrade Banner */}
      {!isCollapsed && user?.currentPlan !== 'PRO' && user?.currentPlan !== 'ENTERPRISE' && (
        <div className="p-3 mx-3 mb-3 rounded-2xl bg-gradient-to-r from-indigo-900/10 via-purple-900/10 to-indigo-900/10 dark:from-indigo-900/40 dark:via-purple-900/40 dark:to-indigo-900/40 border border-indigo-500/20 dark:border-indigo-500/30 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500 dark:text-amber-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">Upgrade to Pro</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-sans leading-tight">
            Unlock advanced ML predictions & RAG search.
          </p>
          <Link
            to="/plans"
            className="block text-center py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-[11px] transition-colors"
          >
            Upgrade Plan
          </Link>
        </div>
      )}

      {/* Footer User & Actions */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 shrink-0 space-y-2">
        {/* User Profile Card */}
        <div className={`flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 ${isCollapsed ? 'flex-col' : ''}`}>
          <div 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2.5 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            title="View My Profile"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 dark:bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => logout()}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
