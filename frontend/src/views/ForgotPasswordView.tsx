import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Cpu, ArrowLeft, Send, CheckCircle2, ShieldQuestion, Lock, KeyRound } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { FormError } from '../components/ui/FormError';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export const ForgotPasswordView: React.FC = () => {
  const navigate = useNavigate();
  const { forgotPassword, isLoading, error, clearError } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<'SECURITY_QUESTION' | 'TOKEN'>('SECURITY_QUESTION');
  const [email, setEmail] = useState('');
  
  // Security Question state
  const [securityQuestion, setSecurityQuestion] = useState<string | null>(null);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isFetchingQuestion, setIsFetchingQuestion] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devResetToken, setDevResetToken] = useState<string | undefined>(undefined);

  // Fetch security question for email
  const handleFetchQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    if (!email) {
      setFieldErrors({ email: 'Please enter your email address' });
      return;
    }

    setIsFetchingQuestion(true);
    try {
      const response: any = await api.get(`/auth/security-question/${encodeURIComponent(email)}`);
      if (response.success && response.data?.securityQuestion) {
        setSecurityQuestion(response.data.securityQuestion);
      }
    } catch (err: any) {
      setFieldErrors({ email: err.message || 'No account or security question found for this email' });
    } finally {
      setIsFetchingQuestion(false);
    }
  };

  // Submit security question password reset
  const handleResetWithSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (newPassword !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    try {
      const response: any = await api.post('/auth/reset-password-security', {
        email,
        securityAnswer,
        newPassword,
        confirmPassword
      });

      if (response.success) {
        setSuccessMessage(response.message || 'Password reset successful!');
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      }
    } catch (err: any) {
      setFieldErrors({ global: err.message || 'Security answer is incorrect' });
    }
  };

  // Submit email token request
  const handleTokenRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setFieldErrors({ email: 'Please enter your email address' });
      return;
    }

    try {
      const res = await forgotPassword(email);
      setSuccessMessage(res.message);
      if (res.devResetToken) setDevResetToken(res.devResetToken);
    } catch (err: any) {
      // Store error
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        
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
          <h2 className="text-2xl font-bold text-white">Password Recovery</h2>
          <p className="text-sm text-slate-400">Recover access to your LifeOS account</p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 md:p-8 rounded-3xl shadow-2xl border border-white/10 space-y-6">
          
          {/* Method Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setActiveTab('SECURITY_QUESTION');
                setFieldErrors({});
              }}
              className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'SECURITY_QUESTION'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldQuestion size={14} /> Security Question
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('TOKEN');
                setFieldErrors({});
              }}
              className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'TOKEN'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound size={14} /> Reset Token
            </button>
          </div>

          <FormError message={fieldErrors.global || error} />

          {successMessage ? (
            <div className="space-y-4 text-center py-4 animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={32} />
              </div>
              <p className="text-sm text-slate-200 font-medium">{successMessage}</p>

              {devResetToken && (
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-left space-y-2 text-xs">
                  <p className="text-slate-300 font-mono">Dev Token: <code className="text-cyan-300 font-bold">{devResetToken}</code></p>
                  <Link
                    to={`/reset-password/${devResetToken}`}
                    className="inline-block px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs"
                  >
                    Proceed to Token Reset →
                  </Link>
                </div>
              )}

              <div className="pt-2">
                <Link to="/login">
                  <Button variant="secondary" size="md" className="w-full text-xs" leftIcon={<ArrowLeft size={16} />}>
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: Security Question Recovery */}
              {activeTab === 'SECURITY_QUESTION' && (
                <div className="space-y-4">
                  {!securityQuestion ? (
                    <form onSubmit={handleFetchQuestion} className="space-y-4">
                      <Input
                        label="Account Email Address"
                        type="email"
                        placeholder="ketan@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={fieldErrors.email}
                        leftIcon={<Mail size={18} />}
                        required
                      />

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isFetchingQuestion}
                        className="w-full text-sm py-3"
                      >
                        Fetch Security Question
                      </Button>
                    </form>
                  ) : (
                    <form onSubmit={handleResetWithSecurity} className="space-y-4 animate-fade-in">
                      <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs">
                        <span className="text-slate-400 font-mono text-[10px] block">SECURITY QUESTION</span>
                        <p className="text-indigo-200 font-semibold mt-0.5">{securityQuestion}</p>
                      </div>

                      <Input
                        label="Your Security Answer"
                        type="text"
                        placeholder="Enter your security answer"
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        required
                      />

                      <PasswordInput
                        label="New Password"
                        placeholder="Minimum 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        leftIcon={<Lock size={18} />}
                        required
                      />

                      <PasswordInput
                        label="Confirm New Password"
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={fieldErrors.confirmPassword}
                        leftIcon={<Lock size={18} />}
                        required
                      />

                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        isLoading={isLoading}
                        className="w-full text-sm py-3"
                      >
                        Reset Password Now
                      </Button>
                    </form>
                  )}
                </div>
              )}

              {/* TAB 2: Token Recovery */}
              {activeTab === 'TOKEN' && (
                <form onSubmit={handleTokenRequest} className="space-y-4">
                  <Input
                    label="Account Email Address"
                    type="email"
                    placeholder="ketan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={fieldErrors.email}
                    leftIcon={<Mail size={18} />}
                    required
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    rightIcon={<Send size={16} />}
                    className="w-full text-sm py-3"
                  >
                    Send Recovery Link / Token
                  </Button>
                </form>
              )}

              <div className="text-center pt-2">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200">
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
