import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PasswordInput } from '../components/ui/PasswordInput';
import { FormError } from '../components/ui/FormError';
import { useAuthStore } from '../store/useAuthStore';
import { resetPasswordSchema } from '../../../shared/validation/auth.schema';

export const ResetPasswordView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { resetPassword, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (!token) {
      setFieldErrors({ global: 'Missing password reset token' });
      return;
    }

    const validation = resetPasswordSchema.safeParse({
      token,
      password: formData.password,
      confirmPassword: formData.confirmPassword
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
      const msg = await resetPassword(validation.data);
      setSuccessMessage(msg);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      // Error managed in auth store
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <Cpu size={22} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              LIFE<span className="text-gradient">OS</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white">Set New Password</h2>
          <p className="text-sm text-slate-400">Choose a strong replacement password for your account</p>
        </div>

        <div className="glass-card p-6 md:p-8 rounded-2xl shadow-2xl border border-white/10 space-y-6">
          <FormError message={error} />

          {successMessage ? (
            <div className="text-center space-y-4 py-4 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <p className="text-sm text-emerald-300 font-medium">{successMessage}</p>
              <p className="text-xs text-slate-400">Redirecting to sign in page...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <PasswordInput
                label="New Password"
                name="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
                error={fieldErrors.password}
                leftIcon={<Lock size={18} />}
                required
              />

              <PasswordInput
                label="Confirm New Password"
                name="confirmPassword"
                placeholder="Re-enter new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={fieldErrors.confirmPassword}
                leftIcon={<Lock size={18} />}
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight size={18} />}
                  className="w-full text-sm py-3"
                >
                  Update Password
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
