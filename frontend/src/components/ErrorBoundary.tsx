import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[React ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans flex items-center justify-center p-6 select-none">
          <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-rose-500/30 bg-slate-950/90 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle size={32} />
            </div>

            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Something Went Wrong</h2>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                LifeOS encountered an unexpected interface error.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-rose-300 text-left overflow-auto max-h-32">
              {this.state.error?.message || 'Unknown UI Error'}
            </div>

            <button
              type="button"
              onClick={this.handleReload}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <RotateCcw size={15} /> Reload LifeOS Platform
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
