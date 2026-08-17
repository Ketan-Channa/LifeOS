import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Cpu, 
  ArrowRight, 
  Sparkles, 
  CalendarCheck, 
  BrainCircuit, 
  TrendingUp, 
  Target, 
  Activity, 
  Clock, 
  ShieldCheck, 
  Zap,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { FormError } from '../components/ui/FormError';
import { useAuthStore } from '../store/useAuthStore';
import { loginSchema } from '../../../shared/validation/auth.schema';

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue: { path: (string | number)[]; message: string }) => {
        const field = issue.path[0]?.toString();
        if (field && !errors[field]) {
          errors[field] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    try {
      await login(validation.data);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.errors) {
        const mappedErrors: Record<string, string> = {};
        Object.keys(err.errors).forEach((key) => {
          mappedErrors[key] = err.errors[key][0];
        });
        setFieldErrors(mappedErrors);
      }
    }
  };

  const featureShowcase = [
    {
      icon: <CalendarCheck className="w-6 h-6 text-indigo-400" />,
      title: "Intelligent Task & Schedule Engine",
      tag: "CORE MODULE",
      description: "Balances your daily commitments, tasks, and calendar events into an optimized flow itinerary."
    },
    {
      icon: <BrainCircuit className="w-6 h-6 text-purple-400" />,
      title: "SCOUT AI Personal Assistant",
      tag: "GEMINI RAG CORE",
      description: "Ask SCOUT anything about your schedule, habits, or tasks. SCOUT analyzes your database telemetry in real-time."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-cyan-400" />,
      title: "Behavioral Pattern Recognition",
      tag: "TELEMETRY",
      description: "Detects your peak focus hours, friction points, and habit completion streaks from historical activity data."
    },
    {
      icon: <Target className="w-6 h-6 text-emerald-400" />,
      title: "Goal & Milestone Intelligence",
      tag: "LONG TERM",
      description: "Deconstructs 6-month or 1-year goals into daily actionable steps with automated completion velocity tracking."
    },
    {
      icon: <Activity className="w-6 h-6 text-amber-400" />,
      title: "Productivity Velocity Analytics",
      tag: "ANALYTICS",
      description: "Visual dashboards detailing focus efficiency, completion ratios, and flow state durations."
    },
    {
      icon: <Clock className="w-6 h-6 text-rose-400" />,
      title: "Predictive Deadline Risk Engine",
      tag: "AI PREDICTION",
      description: "Scans upcoming deadlines and alerts you before workload bottlenecks or capacity overloads happen."
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      title: "Interactive Subscription Tiers",
      tag: "4 PLANS AVAILABLE",
      description: "Select from Free (₹0), Intermediate (3mo), Advanced (6mo), or Elite (1yr) with integrated payment gateway."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-400" />,
      title: "Security Questions & Session Protection",
      tag: "ENTERPRISE AUTH",
      description: "Persistent JWT session handling with dedicated security question password recovery."
    }
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* SECTION 1: AUTHENTICATION FORM ABOVE THE FOLD */}
      <section className="min-h-screen flex flex-col items-center justify-center p-4 py-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md space-y-6 relative z-10 my-auto">
          
          {/* Header Branding */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                <Cpu size={22} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                LIFE<span className="text-gradient">OS</span>
              </span>
            </Link>
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="text-sm text-slate-400">Authenticate to access your operating environment</p>
          </div>

          {/* Form Card */}
          <div className="glass-card p-6 md:p-8 rounded-3xl shadow-2xl border border-white/10 space-y-6">
            <FormError message={error} />

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="ketan@example.com"
                value={formData.email}
                onChange={handleChange}
                error={fieldErrors.email}
                leftIcon={<Mail size={18} />}
                required
              />

              <PasswordInput
                label="Password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={fieldErrors.password}
                leftIcon={<Lock size={18} />}
                required
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-[#090D16]"
                  />
                  <span>Remember me</span>
                </label>

                <Link
                  to="/forgot-password"
                  className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight size={18} />}
                  className="w-full text-sm py-3"
                >
                  Sign In
                </Button>
              </div>
            </form>

            <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
              Don't have a LifeOS account?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">
                Get Started
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator Arrow */}
        <div className="mt-8 text-center text-slate-400 animate-bounce flex flex-col items-center gap-1 cursor-pointer" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
          <span className="text-xs font-mono tracking-wider uppercase">Scroll to explore features</span>
          <ChevronDown size={18} className="text-indigo-400" />
        </div>
      </section>

      {/* SECTION 2: FEATURE SHOWCASE CARDS (SCROLL DOWN) */}
      <section className="max-w-7xl mx-auto px-6 py-20 space-y-12 border-t border-slate-800/60">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
            <Sparkles size={14} className="text-indigo-400" />
            <span>POWERFUL SYSTEM FEATURES</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-white">
            What <span className="text-gradient">LifeOS</span> Does For You
          </h2>

          <p className="text-slate-400 text-sm md:text-base">
            Discover the intelligent capabilities engineered into your personal operating system.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureShowcase.map((feat, idx) => (
            <div
              key={idx}
              className="glass-card p-6 rounded-3xl space-y-4 hover:-translate-y-1.5 hover:border-indigo-500/40 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {feat.icon}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  {feat.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {feat.description}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
                <CheckCircle2 size={14} className="text-emerald-400" /> Fully Integrated
              </div>
            </div>
          ))}
        </div>

        {/* Quick CTA Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 text-center space-y-4 max-w-4xl mx-auto shadow-2xl">
          <h3 className="text-2xl font-bold text-white">Ready to Optimize Your Life?</h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Join high achievers using LifeOS to manage tasks, automate goals, and track daily focus.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/register')}
              rightIcon={<ArrowRight size={16} />}
              className="w-full sm:w-auto px-6"
            >
              Create Account Free
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="w-full sm:w-auto px-6"
            >
              Back to Sign In ↑
            </Button>
          </div>
        </div>

      </section>
    </div>
  );
};
