import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { useAuth } from './components/providers/AuthProvider';
import { CommandBar, CommandBarProvider } from './components/ai/CommandBar';

// Lazy load heavy modules for code splitting
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'));
const KanbanBoard = lazy(() => import('./features/kanban/KanbanBoard'));
const GanttChart = lazy(() => import('./features/gantt/GanttChart'));
const Settings = lazy(() => import('./features/settings/Settings'));
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const SignUpPage = lazy(() => import('./features/auth/SignUpPage'));
const AuthCallback = lazy(() => import('./features/auth/AuthCallback'));

// Placeholder pages for upcoming features
const CalendarPage = lazy(() => import('./features/placeholder/PlaceholderPages').then(m => ({ default: m.CalendarPage })));
const AnalyticsPage = lazy(() => import('./features/placeholder/PlaceholderPages').then(m => ({ default: m.AnalyticsPage })));
const DocsPage = lazy(() => import('./features/placeholder/PlaceholderPages').then(m => ({ default: m.DocsPage })));
const GoalsPage = lazy(() => import('./features/placeholder/PlaceholderPages').then(m => ({ default: m.GoalsPage })));

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public route wrapper (redirects to dashboard if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <CommandBarProvider>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignUpPage />
              </PublicRoute>
            }
          />
          
          {/* OAuth callback route */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected routes with dashboard layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="kanban" element={<KanbanBoard />} />
            <Route path="gantt" element={<GanttChart />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="docs" element={<DocsPage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        {/* Global floating command bar */}
        <CommandBar />
      </Suspense>
    </CommandBarProvider>
  );
}

export default App;
