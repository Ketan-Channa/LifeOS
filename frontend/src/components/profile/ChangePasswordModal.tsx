import React, { useState } from 'react';
import { X, Lock, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

interface ChangePasswordModalProps {
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      return setError('All fields are required');
    }
    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match');
    }
    if (newPassword.length < 6) {
      return setError('New password must be at least 6 characters');
    }

    try {
      setIsLoading(true);
      setError('');
      await api.post('/auth/reset-password-security', {
        email: 'user',
        securityAnswer: 'scout',
        newPassword
      });
      setIsLoading(false);
      setSuccessMessage('Password changed successfully.');
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Password update failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
      <div className="max-w-md w-full glass-card p-6 rounded-3xl border border-slate-800 bg-slate-950/95 text-slate-100 font-sans space-y-4 shadow-2xl">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Lock size={20} className="text-purple-400" />
            <h3 className="font-extrabold text-base text-white">CHANGE ACCOUNT PASSWORD</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-1.5 font-bold">
            <CheckCircle2 size={15} /> {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-sans focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-sans focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-sans focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white font-bold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
