import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { I18nProvider } from './lib/i18n';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { AuthProvider } from './components/providers/AuthProvider';
import { WorkspaceProvider } from './components/workspace';
import { PresenceProvider } from './components/presence';
import { OfflineSyncProvider, OfflineBanner } from './lib/offline';
import './index.css';

// Configure React Query with aggressive caching for "instant" feel
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache data for 30 minutes
      gcTime: 30 * 60 * 1000,
      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for real-time feel
      refetchOnWindowFocus: true,
      // Don't refetch on mount if data is still fresh
      refetchOnMount: false,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <I18nProvider>
          <ThemeProvider defaultTheme="system" storageKey="macroflow-theme">
            <AuthProvider>
              <OfflineSyncProvider>
                <WorkspaceProvider>
                  <PresenceProvider>
                    <OfflineBanner />
                    <App />
                  </PresenceProvider>
                </WorkspaceProvider>
              </OfflineSyncProvider>
            </AuthProvider>
          </ThemeProvider>
        </I18nProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
