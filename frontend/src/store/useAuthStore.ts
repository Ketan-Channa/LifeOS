import { create } from 'zustand';
import { api } from '../services/api';
import { User } from '../../../shared/types/auth.types';
import { LoginInput, RegisterInput, ResetPasswordInput } from '../../../shared/validation/auth.schema';

interface AuthStoreState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  splashCompleted: boolean;

  setSplashCompleted: (completed: boolean) => void;
  login: (credentials: LoginInput) => Promise<void>;
  register: (payload: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string; devResetToken?: string }>;
  resetPassword: (payload: ResetPasswordInput) => Promise<string>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: null,
  token: localStorage.getItem('lifeos_token'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
  splashCompleted: false,

  setSplashCompleted: (completed: boolean) => set({ splashCompleted: completed }),

  clearError: () => set({ error: null }),

  checkAuth: async () => {
    const token = localStorage.getItem('lifeos_token');
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const response: any = await api.get('/auth/me');
      if (response.success && response.data?.user) {
        set({
          user: response.data.user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        localStorage.removeItem('lifeos_token');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch (err: any) {
      localStorage.removeItem('lifeos_token');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (credentials: LoginInput) => {
    set({ isLoading: true, error: null });
    try {
      const response: any = await api.post('/auth/login', credentials);
      if (response.success && response.data) {
        const { user, token } = response.data;
        if (credentials.rememberMe) {
          localStorage.setItem('lifeos_token', token);
        } else {
          localStorage.setItem('lifeos_token', token);
        }
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      }
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Login failed' });
      throw err;
    }
  },

  register: async (payload: RegisterInput) => {
    set({ isLoading: true, error: null });
    try {
      const response: any = await api.post('/auth/register', payload);
      if (response.success && response.data) {
        const { user, token } = response.data;
        localStorage.setItem('lifeos_token', token);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      }
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Registration failed' });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      localStorage.removeItem('lifeos_token');
      set({ user: null, token: null, isAuthenticated: false, error: null });
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const response: any = await api.post('/auth/forgot-password', { email });
      set({ isLoading: false });
      return response.data || { message: response.message };
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Password reset request failed' });
      throw err;
    }
  },

  resetPassword: async (payload: ResetPasswordInput) => {
    set({ isLoading: true, error: null });
    try {
      const response: any = await api.post('/auth/reset-password', payload);
      set({ isLoading: false });
      return response.message || 'Password reset successful';
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Reset password failed' });
      throw err;
    }
  }
}));
