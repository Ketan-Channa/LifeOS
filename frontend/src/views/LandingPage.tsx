import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  BrainCircuit, 
  CalendarCheck, 
  TrendingUp, 
  Target, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Zap,
  Activity
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/useAuthStore';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSplashCompleted } = useAuthStore();

  const features = [
    {
      icon: <CalendarCheck className="w-6 h-6 text-indigo-400" />,
      title: "Intelligent Planning",
      description: "Dynamically balances tasks, deadlines, and high-priority commitments into an optimized daily itinerary."
    },
    {
      icon: <BrainCircuit className="w-6 h-6 text-purple-400" />,
      title: "AI Personal Assistant",
      description: "Contextual AI assistant that executes actions, manages schedules, and synthesizes your productivity data."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-cyan-400" />,
      title: "Pattern Recognition",
      description: "Identifies work habits, peak focus hours, and friction points from historical activity telemetry."
    },
    {
      icon: <Target className="w-6 h-6 text-emerald-400" />,
      title: "Goal Intelligence",
      description: "Deconstructs long-term milestones into actionable daily steps with automated trajectory tracking."
    },
    {
      icon: <Activity className="w-6 h-6 text-amber-400" />,
      title: "Productivity Analytics",
      description: "Visual dashboards detailing focus efficiency, completion velocities, and burn-rate metrics."
    },
    {
      icon: <Clock className="w-6 h-6 text-rose-400" />,
      title: "Smart Scheduling",
      description: "Predictive deadline risk detection and auto-buffer insertion before overload occurs."
    }
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Background Gradient Blurs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-600/15 via-purple-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Cpu size={22} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              LIFE<span className="text-gradient">OS</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setSplashCompleted(false)} leftIcon={<Sparkles size={14} />}>
              Replay Splash
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/register')} rightIcon={<ArrowRight size={16} />}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 md:py-24 space-y-24">
        <section className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles size={14} className="text-indigo-400 animate-pulse" />
            <span>The AI-Powered Personal Operating System</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Your Life. <br className="hidden sm:inline" />
            <span className="text-gradient">One Intelligent System.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Understand your life. Optimize your time. Achieve your goals. LifeOS connects tasks, schedules, habits, and productivity data into an autonomous AI assistant.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/register')}
              rightIcon={<ArrowRight size={18} />}
              className="w-full sm:w-auto text-base px-8"
            >
              Get Started Free
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto text-base px-8"
            >
              Sign In to LifeOS
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-indigo-400" /> End-to-end Secure</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-purple-400" /> Real-time Telemetry</span>
            <span className="flex items-center gap-1.5"><BrainCircuit className="w-4 h-4 text-cyan-400" /> Gemini RAG Core</span>
          </div>
        </section>

        {/* Dashboard Mockup Preview */}
        <section className="relative max-w-5xl mx-auto">
          <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 blur-xl pointer-events-none" />
          <div className="relative glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl p-4 md:p-6 space-y-6">
            
            {/* Mock Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-xs text-slate-400 font-mono ml-2">lifeos.app/dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs text-emerald-400 font-semibold font-mono">LIVE AI ONLINE</span>
              </div>
            </div>

            {/* Mock Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: Today's Focus */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">TODAY'S SCHEDULE</span>
                  <span className="text-indigo-400 font-mono">85% Capacity</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-xs">
                    <span className="text-indigo-200 font-medium">Deep Work: Architecture Spec</span>
                    <span className="text-slate-400">09:00 - 11:30</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-between text-xs">
                    <span className="text-purple-200 font-medium">Q3 Goals Review</span>
                    <span className="text-slate-400">14:00 - 15:00</span>
                  </div>
                </div>
              </div>

              {/* Card 2: AI Recommendation */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-purple-400" /> AI AGENT RECOMMENDATION
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 leading-relaxed">
                  "Based on your 7-day focus velocity, your peak output occurs between 9 AM and 11 AM. Reallocating sprint tasks to this block will reduce deadline risk by 34%."
                </div>
              </div>

              {/* Card 3: Productivity Analytics */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">WEEKLY FOCUS SCORE</span>
                  <span className="text-emerald-400 font-mono">+12.4%</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-extrabold text-white font-mono">92/100</span>
                    <span className="text-xs text-emerald-400 font-medium">Optimal Flow Zone</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full w-[92%]" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Feature Preview Cards */}
        <section className="space-y-12 pt-8 pb-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-white">
              Engineered for High Achievers
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Every component of LifeOS is crafted to minimize cognitive friction and amplify executive focus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="glass-card p-6 rounded-2xl hover:border-indigo-500/40 transition-all duration-300 space-y-4 group">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-100">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
