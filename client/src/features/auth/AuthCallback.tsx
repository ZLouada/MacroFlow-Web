/**
 * OAuth Callback Page
 * 
 * Handles OAuth callback from providers (Google, etc.)
 * Extracts tokens from URL and completes authentication
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthFromOAuth } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const expiresIn = searchParams.get('expiresIn');
      const error = searchParams.get('error');
      const isNewUser = searchParams.get('newUser') === 'true';

      if (error) {
        setStatus('error');
        setErrorMessage(getErrorMessage(error));
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!token) {
        setStatus('error');
        setErrorMessage('No authentication token received');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        // Set the auth state from OAuth response
        await setAuthFromOAuth(token, parseInt(expiresIn || '900', 10));
        setStatus('success');
        
        // Brief delay to show success message
        setTimeout(() => {
          if (isNewUser) {
            navigate('/dashboard?welcome=true');
          } else {
            navigate('/dashboard');
          }
        }, 1500);
      } catch (err) {
        setStatus('error');
        setErrorMessage('Failed to complete authentication');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setAuthFromOAuth]);

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'access_denied':
        return 'Access was denied. Please try again.';
      case 'oauth_failed':
        return 'OAuth authentication failed. Please try again.';
      case 'missing_code':
        return 'Authentication code missing. Please try again.';
      default:
        return 'An error occurred during authentication.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-lg font-medium">Completing sign in...</p>
            <p className="text-sm text-muted-foreground">Please wait while we authenticate you</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-lg font-medium">Welcome!</p>
            <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-lg font-medium">Authentication Failed</p>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            <p className="text-xs text-muted-foreground">Redirecting to login...</p>
          </div>
        )}
      </div>
    </div>
  );
}
