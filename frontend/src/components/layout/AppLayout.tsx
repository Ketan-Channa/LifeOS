import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  Calendar, 
  RotateCcw, 
  BarChart3, 
  FileText, 
  Bot, 
  Settings 
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const mobileNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Tasks', path: '/tasks', icon: <CheckSquare size={18} /> },
    { label: 'Goals', path: '/goals', icon: <Target size={18} /> },
    { label: 'Schedule', path: '/schedule', icon: <Calendar size={18} /> },
    { label: 'Habits', path: '/habits', icon: <RotateCcw size={18} /> },
    { label: 'AI', path: '/assistant', icon: <Bot size={18} /> }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Desktop Left Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />

      {/* Main Content Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <Header />
        
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 border-t border-slate-800 backdrop-blur-lg flex items-center justify-around py-2 px-1">
        {mobileNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-indigo-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={isActive ? 'text-indigo-400' : 'text-slate-400'}>
                {item.icon}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
