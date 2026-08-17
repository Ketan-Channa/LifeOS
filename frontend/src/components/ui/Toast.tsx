import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ type, message, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-cyan-400" />
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-200',
    error: 'border-red-500/30 bg-red-950/40 text-red-200',
    warning: 'border-amber-500/30 bg-amber-950/40 text-amber-200',
    info: 'border-cyan-500/30 bg-cyan-950/40 text-cyan-200'
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl max-w-sm ${borders[type]}`}>
        {icons[type]}
        <span className="text-xs font-medium">{message}</span>
        <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-200">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
