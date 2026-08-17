import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      className="fixed bottom-6 right-24 z-50 w-14 h-14 rounded-full bg-slate-900 dark:bg-slate-900 border-2 border-indigo-500/60 hover:border-indigo-400 text-slate-100 flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none backdrop-blur-md"
    >
      {isDark ? (
        <Sun size={24} className="text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon size={24} className="text-indigo-400 group-hover:-rotate-12 transition-transform duration-300" />
      )}

      {/* Tooltip */}
      <span className="absolute bottom-16 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-slate-100 text-[10px] font-mono font-semibold px-2.5 py-1 rounded-lg border border-slate-700 pointer-events-none whitespace-nowrap shadow-2xl">
        {isDark ? 'Light Theme' : 'Dark Theme'}
      </span>
    </button>
  );
};
