/**
 * Login Page
 * 
 * Modern, ClickUp-inspired login page with:
 * - Email/Password authentication
 * - Remember me option
 * - Social login placeholders
 * - 2FA support
 * - Animated transitions
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  Shield,
  CheckCircle2,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, verifyTwoFactor, isLoading, error, clearError, authStep, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [localError, setLocalError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear errors when inputs change
  useEffect(() => {
    if (error) clearError();
    setLocalError('');
  }, [email, password, twoFactorCode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      await login({ email, password, rememberMe });
    } catch (err) {
      // Error is handled by the auth provider
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (twoFactorCode.length !== 6) {
      setLocalError('Please enter a 6-digit code');
      return;
    }

    const success = await verifyTwoFactor(twoFactorCode);
    if (!success && !error) {
      setLocalError('Invalid verification code');
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-gradient-to-br from-primary via-indigo-600 to-purple-700 relative overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-400/10 rounded-full blur-2xl animate-pulse delay-500" />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <img src="/macroflow.png" alt="MacroFlow" className="h-12 w-auto object-contain drop-shadow-md" />
          </div>

          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
              Work smarter,<br />
              <span className="text-white/80">not harder.</span>
            </h1>
            <p className="text-lg text-white/70 max-w-md mb-8">
              Join thousands of teams using MacroFlow to manage projects, track progress, and collaborate seamlessly.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {[
              'AI-powered task management',
              'Real-time collaboration',
              'Enterprise-grade security',
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src="/macroflow.png" alt="MacroFlow" className="h-10 w-auto object-contain" />
          </div>

          <AnimatePresence mode="wait">
            {authStep === '2fa' ? (
              /* 2FA Verification */
              <motion.div
                key="2fa"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to login
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-2xl bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                </div>

                <h1 className="text-2xl font-bold mb-2">Two-factor authentication</h1>
                <p className="text-muted-foreground mb-8">
                  Enter the 6-digit code from your authenticator app to continue.
                </p>

                <form onSubmit={handleVerify2FA} className="space-y-6">
                  {/* 2FA Code Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Verification Code
                    </label>
                    <div className="flex gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <input
                          key={index}
                          type="text"
                          maxLength={1}
                          value={twoFactorCode[index] || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            const newCode = twoFactorCode.split('');
                            newCode[index] = value;
                            setTwoFactorCode(newCode.join(''));
                            
                            // Auto-focus next input
                            if (value && index < 5) {
                              const next = e.target.nextElementSibling as HTMLInputElement;
                              next?.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            // Handle backspace
                            if (e.key === 'Backspace' && !twoFactorCode[index] && index > 0) {
                              const prev = (e.target as HTMLInputElement).previousElementSibling as HTMLInputElement;
                              prev?.focus();
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                            setTwoFactorCode(paste);
                          }}
                          className={cn(
                            'w-12 h-14 text-center text-xl font-semibold rounded-xl',
                            'border-2 border-input bg-background',
                            'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                            'transition-all duration-200'
                          )}
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Error message */}
                  {displayError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {displayError}
                    </motion.div>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isLoading || twoFactorCode.length !== 6}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
                      'bg-primary text-primary-foreground font-medium',
                      'hover:bg-primary/90 transition-all duration-200',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30'
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Verify
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-muted-foreground">
                    Lost access to your authenticator?{' '}
                    <Link to="/recover" className="text-primary hover:underline">
                      Use recovery code
                    </Link>
                  </p>
                </form>
              </motion.div>
            ) : (
              /* Login Form */
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
                <p className="text-muted-foreground mb-8">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary hover:underline font-medium">
                    Sign up for free
                  </Link>
                </p>

                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className={cn(
                          'w-full pl-10 pr-4 py-3 rounded-xl',
                          'border border-input bg-background',
                          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                          'transition-all duration-200',
                          'placeholder:text-muted-foreground/60'
                        )}
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="password" className="text-sm font-medium">
                        Password
                      </label>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className={cn(
                          'w-full pl-10 pr-12 py-3 rounded-xl',
                          'border border-input bg-background',
                          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                          'transition-all duration-200',
                          'placeholder:text-muted-foreground/60'
                        )}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember me */}
                  <div className="flex items-center gap-2">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-input text-primary focus:ring-primary/20"
                    />
                    <label htmlFor="remember" className="text-sm text-muted-foreground">
                      Remember me for 30 days
                    </label>
                  </div>

                  {/* Error message */}
                  {displayError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {displayError}
                    </motion.div>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
                      'bg-primary text-primary-foreground font-medium',
                      'hover:bg-primary/90 transition-all duration-200',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30'
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Social login buttons */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => window.location.href = '/api/v1/auth/google'}
                    className={cn(
                      'flex items-center justify-center gap-2 px-6 py-3 rounded-xl w-full',
                      'border border-input bg-background',
                      'hover:bg-muted transition-colors'
                    )}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Continue with Google</span>
                  </button>
                </div>

                {/* Demo credentials */}
                <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Demo credentials:</p>
                  <div className="space-y-1 text-xs">
                    <p><span className="text-muted-foreground">Email:</span> <code className="bg-background px-1 rounded">demo@macroflow.io</code></p>
                    <p><span className="text-muted-foreground">Password:</span> <code className="bg-background px-1 rounded">demo123</code></p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    For 2FA demo: <code className="bg-background px-1 rounded">admin@macroflow.io</code> / <code className="bg-background px-1 rounded">admin123</code>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
