import React, { useState, useEffect } from 'react';
import { Cpu, Sparkles, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Kernel...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Smooth 2.5-second progress animation (0% -> 100%)
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        
        if (next < 25) {
          setStatusText('Initializing Kernel Engine...');
        } else if (next < 50) {
          setStatusText('Loading System Modules & Telemetry...');
        } else if (next < 75) {
          setStatusText('Synchronizing Security & Auth Keys...');
        } else if (next < 99) {
          setStatusText('Preparing LifeOS Dashboard Shell...');
        } else {
          setStatusText('System Ready — Launching...');
        }

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
              onComplete();
            }, 600);
          }, 400);
          return 100;
        }
        return next;
      });
    }, 22);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#090D16] p-6 select-none transition-all duration-700 ${
        isFadingOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute top-2/3 left-1/3 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

      {/* Top Header */}
      <div className="w-full max-w-5xl flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>v1.0.0 Phase 2 Shell</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>SECURE CORE</span>
        </div>
      </div>

      {/* Central Branding & Progress Centerpiece */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg my-auto space-y-8">
        
        <div className="relative group">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 opacity-80 blur-xl group-hover:opacity-100 transition duration-500 animate-pulse"></div>
          <div className="relative w-28 h-28 rounded-3xl bg-[#0F172A] border border-white/10 flex items-center justify-center shadow-2xl">
            <Cpu className="w-14 h-14 text-indigo-400 animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tight text-white font-sans">
            LIFE<span className="text-gradient">OS</span>
          </h1>
          <p className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
            AI-Powered Personal Operating System
          </p>
          <p className="text-sm text-slate-400 italic max-w-xs mx-auto pt-1 font-light">
            "Understand your life. Optimize your time. Achieve your goals."
          </p>
        </div>

        <div className="w-full max-w-md space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-medium">{statusText}</span>
            <span className="text-indigo-400 font-extrabold text-sm px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
              {progress}%
            </span>
          </div>

          <div className="w-full h-3 bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-75 ease-out shadow-lg shadow-indigo-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>0% (START)</span>
            <span>50%</span>
            <span>100% (COMPLETE)</span>
          </div>
        </div>
      </div>

      {/* Developer Credit Line (Splash Screen Only) */}
      <div className="relative z-10 text-center pb-2">
        <p className="text-[11px] font-mono tracking-widest uppercase text-slate-500">
          DESIGNED AND DEVELOPED BY <span className="text-indigo-400 font-bold">KETAN CHANNA</span>
        </p>
      </div>
    </div>
  );
};
