import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Cpu, 
  ArrowRight, 
  Phone, 
  Calendar, 
  Hash, 
  HelpCircle,
  Activity,
  Heart
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { FormError } from '../components/ui/FormError';
import { useAuthStore } from '../store/useAuthStore';
import { registerSchema } from '../../../shared/validation/auth.schema';

export const RegisterView: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    dob: '',
    sex: 'Male',
    bloodGroup: 'O+',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    securityQuestion: 'What was your childhood nickname?',
    securityAnswer: ''
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const securityQuestions = [
    'What was your childhood nickname?',
    "What is your mother's maiden name?",
    'What city were you born in?',
    'What was the name of your first pet?',
    'What was your high school mascot?'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const validation = registerSchema.safeParse({
      ...formData,
      age: formData.age ? Number(formData.age) : undefined
    });

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue: { path: (string | number)[]; message: string }) => {
        const field = issue.path[0]?.toString();
        if (field && !errors[field]) errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    try {
      await register(validation.data as any);
      // Redirect to subscription plan selection page
      navigate('/plans');
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

  return (
    <div className="min-h-screen bg-[#090D16] flex items-center justify-center p-4 py-12 selection:bg-indigo-500 selection:text-white">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <Cpu size={22} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              LIFE<span className="text-gradient">OS</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white">Create LifeOS Account</h2>
          <p className="text-sm text-slate-400">Initialize your personal AI operating system profile</p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 md:p-8 rounded-3xl shadow-2xl border border-white/10 space-y-6">
          <FormError message={error} />

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Section 1: Basic Profile */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                1. Personal Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  type="text"
                  placeholder="Ketan Channa"
                  value={formData.name}
                  onChange={handleChange}
                  error={fieldErrors.name}
                  leftIcon={<UserIcon size={18} />}
                  required
                />

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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Age"
                  name="age"
                  type="number"
                  placeholder="22"
                  value={formData.age}
                  onChange={handleChange}
                  error={fieldErrors.age}
                  leftIcon={<Hash size={18} />}
                />

                <Input
                  label="Date of Birth (DOB)"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  error={fieldErrors.dob}
                  leftIcon={<Calendar size={18} />}
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  error={fieldErrors.phone}
                  leftIcon={<Phone size={18} />}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">Sex / Gender</label>
                  <div className="relative">
                    <select
                      name="sex"
                      value={formData.sex}
                      onChange={handleChange}
                      className="w-full bg-[#0F172A]/70 text-slate-100 text-sm rounded-xl px-3.5 py-2.5 outline-none border border-slate-700 glass-input"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full bg-[#0F172A]/70 text-slate-100 text-sm rounded-xl px-3.5 py-2.5 outline-none border border-slate-700 glass-input"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Account Security */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-mono font-semibold text-purple-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                2. Security & Credentials
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PasswordInput
                  label="Password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  error={fieldErrors.password}
                  leftIcon={<Lock size={18} />}
                  required
                />

                <PasswordInput
                  label="Confirm Password"
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={fieldErrors.confirmPassword}
                  leftIcon={<Lock size={18} />}
                  required
                />
              </div>

              {/* Security Question Section */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <HelpCircle size={14} className="text-indigo-400" /> Security Question (For Password Recovery)
                  </label>
                  <select
                    name="securityQuestion"
                    value={formData.securityQuestion}
                    onChange={handleChange}
                    className="w-full bg-[#0F172A] text-slate-100 text-sm rounded-xl px-3.5 py-2.5 outline-none border border-slate-700"
                  >
                    {securityQuestions.map((q, idx) => (
                      <option key={idx} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Security Answer"
                  name="securityAnswer"
                  placeholder="Enter your security answer"
                  value={formData.securityAnswer}
                  onChange={handleChange}
                  error={fieldErrors.securityAnswer}
                  required
                />
              </div>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                rightIcon={<ArrowRight size={18} />}
                className="w-full text-sm py-3.5 shadow-lg shadow-indigo-500/25"
              >
                Create Account & Select Plan
              </Button>
            </div>
          </form>

          <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
