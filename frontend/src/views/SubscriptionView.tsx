import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Sparkles, 
  Crown, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Cpu,
  Star,
  Check
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PaymentModal } from '../components/PaymentModal';
import { useAuthStore } from '../store/useAuthStore';

interface PlanItem {
  id: 'FREE' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';
  name: string;
  price: number;
  durationMonths: number;
  durationLabel: string;
  description: string;
  badge?: string;
  popular?: boolean;
  features: string[];
}

export const SubscriptionView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedPlanId, setSelectedPlanId] = useState<'FREE' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE'>(
    (user?.currentPlan as any) || 'INTERMEDIATE'
  );
  const [paymentModalPlan, setPaymentModalPlan] = useState<PlanItem | null>(null);

  const plans: PlanItem[] = [
    {
      id: 'FREE',
      name: 'Free Plan',
      price: 0,
      durationMonths: 120,
      durationLabel: 'Lifetime Access',
      description: 'Essential organization tools for personal task management.',
      features: [
        'Personal Task Manager',
        'Basic Daily Calendar',
        'Standard Habit Tracker',
        'Community Support'
      ]
    },
    {
      id: 'INTERMEDIATE',
      name: 'Intermediate Plan',
      price: 499,
      durationMonths: 3,
      durationLabel: '3 Months Duration',
      badge: 'MOST POPULAR',
      popular: true,
      description: 'Intelligence features for active goal tracking & productivity analytics.',
      features: [
        'Everything in Free',
        'Goal & Milestone Intelligence',
        'AI Task Recommendations',
        'Productivity Velocity Charts',
        'Priority Sync'
      ]
    },
    {
      id: 'ADVANCED',
      name: 'Advanced Plan',
      price: 899,
      durationMonths: 6,
      durationLabel: '6 Months Duration',
      badge: 'HIGH FOCUS',
      description: 'Deep focus telemetry, deadline risk predictions, and custom views.',
      features: [
        'Everything in Intermediate',
        'Deadline Risk Prediction',
        'Behavioral Pattern Detection',
        'Custom Focus Telemetry',
        'Contextual AI Personal Assistant'
      ]
    },
    {
      id: 'ELITE',
      name: 'Elite Plan',
      price: 1499,
      durationMonths: 12,
      durationLabel: '1 Year Duration',
      badge: 'BEST VALUE',
      description: 'Full autonomous AI agent capabilities, RAG memory, and VIP support.',
      features: [
        'Everything in Advanced',
        'Full Autonomous AI Agent Actions',
        'Unlimited Context Memory (RAG)',
        'VIP 24/7 Dedicated Support',
        'Early Access to New AI Models'
      ]
    }
  ];

  const handleSelectAndPay = (plan: PlanItem) => {
    setSelectedPlanId(plan.id);
    setPaymentModalPlan(plan);
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <header className="w-full glass-panel border-b border-white/5 py-4 px-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Cpu size={22} />
            </div>
            <span className="text-xl font-bold text-white">
              LIFE<span className="text-gradient">OS</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 hidden sm:inline">
              Current Plan: <strong className="text-indigo-400 font-mono">{user?.currentPlan || 'FREE'}</strong>
            </span>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              Skip to Dashboard →
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 space-y-12">
        
        {/* Title */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono">
            <Sparkles size={14} className="text-indigo-400" />
            <span>FLEXIBLE SUBSCRIPTION TIERS</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white">
            Choose Your <span className="text-gradient">LifeOS Plan</span>
          </h1>

          <p className="text-slate-400 text-sm md:text-base">
            Unlock AI personal operating capabilities tailored to your goals. Upgrade or switch plans anytime.
          </p>
        </div>

        {/* 4 Plan Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            const isCurrent = user?.currentPlan === plan.id;

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`relative rounded-3xl p-6 transition-all duration-300 cursor-pointer flex flex-col justify-between glass-card group ${
                  plan.popular ? 'border-indigo-500/60 shadow-xl shadow-indigo-500/15' : 'border-slate-800'
                } ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 scale-[1.02] border-indigo-500 bg-slate-900/90 shadow-2xl'
                    : 'hover:-translate-y-1.5 hover:border-slate-700'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center justify-between">
                      {plan.name}
                      {isCurrent && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                          ACTIVE
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[36px]">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="py-2 border-y border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-white font-mono">
                        {plan.price === 0 ? '₹0' : `₹${plan.price.toLocaleString('en-IN')}`}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        / {plan.durationMonths === 120 ? 'lifetime' : `${plan.durationMonths} mos`}
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-400 font-mono mt-0.5">{plan.durationLabel}</p>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-2 text-xs text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="pt-6">
                  <Button
                    variant={isSelected ? 'primary' : 'secondary'}
                    size="md"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectAndPay(plan);
                    }}
                    className="w-full text-xs font-semibold py-2.5"
                  >
                    {isCurrent ? 'Current Plan' : plan.price === 0 ? 'Activate Free' : `Select & Pay ₹${plan.price}`}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

      </main>

      {/* Online Payment Gateway Modal */}
      <PaymentModal
        isOpen={Boolean(paymentModalPlan)}
        onClose={() => setPaymentModalPlan(null)}
        plan={paymentModalPlan}
        onSuccess={() => {
          setPaymentModalPlan(null);
          navigate('/dashboard');
        }}
      />
    </div>
  );
};
