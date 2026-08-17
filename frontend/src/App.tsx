import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SplashScreen } from './components/SplashScreen';
import { ThemeToggle } from './components/ThemeToggle';
import { ScoutBot } from './components/ScoutBot';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './views/LandingPage';
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { ForgotPasswordView } from './views/ForgotPasswordView';
import { ResetPasswordView } from './views/ResetPasswordView';
import { SubscriptionView } from './views/SubscriptionView';
import { DashboardView } from './views/DashboardView';
import { TasksView } from './views/TasksView';
import { GoalsView } from './views/GoalsView';
import { ScheduleView } from './views/ScheduleView';
import { HabitsView } from './views/HabitsView';
import { HabitDetailView } from './views/HabitDetailView';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { GuestRoute } from './routes/GuestRoute';
import { useAuthStore } from './store/useAuthStore';

// Heavy modules code-split via React.lazy
const AnalyticsView = lazy(() => import('./views/AnalyticsView').then(m => ({ default: m.AnalyticsView })));
const KnowledgeView = lazy(() => import('./views/KnowledgeView').then(m => ({ default: m.KnowledgeView })));
const DocumentDetailView = lazy(() => import('./views/DocumentDetailView').then(m => ({ default: m.DocumentDetailView })));
const NotesView = lazy(() => import('./views/NotesView').then(m => ({ default: m.NotesView })));
const AssistantView = lazy(() => import('./views/AssistantView').then(m => ({ default: m.AssistantView })));
const SettingsView = lazy(() => import('./views/SettingsView').then(m => ({ default: m.SettingsView })));
const PrivacySettingsView = lazy(() => import('./views/PrivacySettingsView').then(m => ({ default: m.PrivacySettingsView })));
const ProfileView = lazy(() => import('./views/ProfileView').then(m => ({ default: m.ProfileView })));

const LoadingFallback = () => (
  <div className="min-h-64 flex items-center justify-center font-mono text-xs text-purple-400 select-none">
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      <span>Loading Module...</span>
    </div>
  </div>
);

export const App: React.FC = () => {
  const { splashCompleted, setSplashCompleted, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!splashCompleted) {
    return <SplashScreen onComplete={() => setSplashCompleted(true)} />;
  }

  return (
    <ThemeProvider>
      <Router>
        {/* Fixed Bottom-Right Circular Controls */}
        <ThemeToggle />
        <ScoutBot />

        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Guest Routes (Accessible when unauthenticated) */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginView />} />
              <Route path="/register" element={<RegisterView />} />
              <Route path="/forgot-password" element={<ForgotPasswordView />} />
              <Route path="/reset-password/:token" element={<ResetPasswordView />} />
            </Route>

            {/* Protected Routes (Accessible when authenticated) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/plans" element={<SubscriptionView />} />
              
              {/* Authenticated Application Shell Routes */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardView />} />
                <Route path="/tasks" element={<TasksView />} />
                <Route path="/goals" element={<GoalsView />} />
                <Route path="/schedule" element={<ScheduleView />} />
                <Route path="/habits" element={<HabitsView />} />
                <Route path="/habits/:id" element={<HabitDetailView />} />
                <Route path="/analytics" element={<AnalyticsView />} />
                <Route path="/knowledge" element={<KnowledgeView />} />
                <Route path="/knowledge/:id" element={<DocumentDetailView />} />
                <Route path="/notes" element={<NotesView />} />
                <Route path="/assistant" element={<AssistantView />} />
                <Route path="/profile" element={<ProfileView />} />
                <Route path="/settings" element={<SettingsView />} />
                <Route path="/privacy" element={<PrivacySettingsView />} />
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
};

export default App;
