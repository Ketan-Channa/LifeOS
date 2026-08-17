import React from 'react';
import { Calendar } from 'lucide-react';

interface DateRangeSelectorProps {
  selectedRange: string;
  onChange: (range: string) => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ selectedRange, onChange }) => {
  const options = [
    { id: 'last_7_days', label: 'Last 7 Days' },
    { id: 'last_14_days', label: 'Last 14 Days' },
    { id: 'last_30_days', label: 'Last 30 Days' },
    { id: 'last_90_days', label: 'Last 90 Days' },
    { id: 'all_time', label: 'All Time' }
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono">
      <div className="px-2.5 py-1 text-slate-400 flex items-center gap-1.5 border-r border-slate-800">
        <Calendar size={13} className="text-cyan-400" />
        <span className="hidden sm:inline">TIMEFRAME:</span>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`px-3 py-1.5 rounded-xl transition-all font-semibold ${
              selectedRange === opt.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};
