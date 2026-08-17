import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { NotificationBell } from '../notifications/NotificationBell';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/dashboard':
        return 'Overview Dashboard';
      case '/tasks':
        return 'Tasks & Focus Engine';
      case '/goals':
        return 'Goals & Milestones';
      case '/schedule':
        return 'Schedule & Calendar';
      case '/habits':
        return 'Habit Tracker Telemetry';
      case '/analytics':
        return 'Productivity Velocity Analytics';
      case '/notes':
        return 'Notes & Brain Dump';
      case '/assistant':
        return 'SCOUT AI Assistant';
      case '/profile':
        return 'My Personal Profile';
      case '/privacy':
        return 'Privacy & Data Controls';
      case '/settings':
        return 'Account & Operating Settings';
      default:
        return 'LifeOS Kernel';
    }
  };

  return (
    <header className="sticky top-0 z-20 h-20 bg-white/80 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-xl px-6 flex items-center justify-between select-none transition-colors duration-200">
      {/* Page Breadcrumb Title */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">LifeOS /</span>
        <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        
        {/* Subscription Plan Badge */}
        <div 
          onClick={() => navigate('/plans')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-mono font-bold uppercase cursor-pointer hover:bg-indigo-500/20 transition-all"
          title="Manage Subscription Plan"
        >
          <Sparkles size={12} className="text-amber-500 dark:text-amber-400" />
          <span>{user?.currentPlan || 'FREE'} PLAN</span>
        </div>

        {/* Notification Bell Icon */}
        <NotificationBell />

        {/* User Profile Pill */}
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800 cursor-pointer hover:opacity-80 transition-opacity"
          title="View My Profile"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 border border-indigo-400/40 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">{user?.name}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{user?.email}</p>
          </div>
        </div>

      </div>
    </header>
  );
};
