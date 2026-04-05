/**
 * Sign Up Page
 * 
 * Modern, ClickUp-inspired sign up page with:
 * - Multi-step registration flow
 * - Email verification
 * - Password strength indicator
 * - Animated transitions
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  User,
  CheckCircle2,
  ChevronLeft,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { cn } from '@/lib/utils';

// Password strength checker
function checkPasswordStrength(password: string): {
  score: number;
  checks: { label: string; passed: boolean }[];
} {
  const checks = [
    { label: 'At least 8 characters', passed: password.length >= 8 },
    { label: 'Contains uppercase letter', passed: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', passed: /[a-z]/.test(password) },
    { label: 'Contains a number', passed: /\d/.test(password) },
    { label: 'Contains special character', passed: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const score = checks.filter(c => c.passed).length;
  return { score, checks };
}

function getStrengthLabel(score: number): { label: string; color: string } {
  if (score <= 1) return { label: 'Weak', color: 'text-destructive' };
  if (score <= 2) return { label: 'Fair', color: 'text-warning' };
  if (score <= 3) return { label: 'Good', color: 'text-amber-500' };
  if (score <= 4) return { label: 'Strong', color: 'text-success' };
  return { label: 'Very Strong', color: 'text-success' };
}

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signUp, verifyEmail, isLoading, error, clearError, authStep, isAuthenticated } = useAuth();

  const [step, setStep] = useState<'details' | 'verification'>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [localError, setLocalError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const passwordStrength = checkPasswordStrength(password);
  const strengthInfo = getStrengthLabel(passwordStrength.score);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle auth step changes
  useEffect(() => {
    if (authStep === 'verification') {
      setStep('verification');
    }
  }, [authStep]);

  // Clear errors when inputs change
  useEffect(() => {
    if (error) clearError();
    setLocalError('');
  }, [name, email, password, confirmPassword, verificationCode]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!name || !email || !password || !confirmPassword) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (!acceptTerms) {
      setLocalError('Please accept the terms and conditions');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (passwordStrength.score < 3) {
      setLocalError('Please use a stronger password');
      return;
    }

    try {
      const success = await signUp({ name, email, password, confirmPassword });
      if (success) {
        setStep('verification');
      }
    } catch (err) {
      // Error is handled by the auth provider
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (verificationCode.length !== 6) {
      setLocalError('Please enter a 6-digit code');
      return;
    }

    const success = await verifyEmail(verificationCode);
    if (success) {
      navigate('/login', { state: { verified: true } });
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] bg-gradient-to-br from-success via-teal-500 to-emerald-600 relative overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl animate-pulse delay-500" />
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
              Start your<br />
              <span className="text-white/80">productivity journey.</span>
            </h1>
            <p className="text-lg text-white/70 max-w-md mb-8">
              Join 10,000+ teams already using MacroFlow to transform how they work.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-3 gap-6"
          >
            {[
              { value: '10K+', label: 'Active Teams' },
              { value: '50M+', label: 'Tasks Completed' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, index) => (
              <div key={index}>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-white/60 text-sm">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      {/* Right side - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src="/macroflow.png" alt="MacroFlow" className="h-10 w-auto object-contain" />
          </div>

          <AnimatePresence mode="wait">
            {step === 'verification' ? (
              /* Email Verification */
              <motion.div
                key="verification"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => setStep('details')}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-2xl bg-success/10">
                    <Mail className="h-6 w-6 text-success" />
                  </div>
                </div>

                <h1 className="text-2xl font-bold mb-2">Check your email</h1>
                <p className="text-muted-foreground mb-8">
                  We've sent a 6-digit verification code to{' '}
                  <span className="font-medium text-foreground">{email}</span>
                </p>

                <form onSubmit={handleVerifyEmail} className="space-y-6">
                  {/* Verification Code Input */}
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
                          value={verificationCode[index] || ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            const newCode = verificationCode.split('');
                            newCode[index] = value;
                            setVerificationCode(newCode.join(''));
                            
                            // Auto-focus next input
                            if (value && index < 5) {
                              const next = e.target.nextElementSibling as HTMLInputElement;
                              next?.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
                              const prev = (e.target as HTMLInputElement).previousElementSibling as HTMLInputElement;
                              prev?.focus();
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                            setVerificationCode(paste);
                          }}
                          className={cn(
                            'w-12 h-14 text-center text-xl font-semibold rounded-xl',
                            'border-2 border-input bg-background',
                            'focus:outline-none focus:border-success focus:ring-2 focus:ring-success/20',
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
                    disabled={isLoading || verificationCode.length !== 6}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
                      'bg-success text-white font-medium',
                      'hover:bg-success/90 transition-all duration-200',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'shadow-lg shadow-success/20 hover:shadow-xl hover:shadow-success/30'
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Verify Email
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-sm text-muted-foreground">
                    Didn't receive the code?{' '}
                    <button type="button" className="text-success hover:underline">
                      Resend
                    </button>
                  </p>
                </form>
              </motion.div>
            ) : (
              /* Sign Up Form */
              <motion.div
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl font-bold mb-2">Create your account</h1>
                <p className="text-muted-foreground mb-8">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>

                <form onSubmit={handleSignUp} className="space-y-5">
                  {/* Name Input */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className={cn(
                          'w-full pl-10 pr-4 py-3 rounded-xl',
                          'border border-input bg-background',
                          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                          'transition-all duration-200',
                          'placeholder:text-muted-foreground/60'
                        )}
                        autoComplete="name"
                        autoFocus
                      />
                    </div>
                  </div>

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
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a strong password"
                        className={cn(
                          'w-full pl-10 pr-12 py-3 rounded-xl',
                          'border border-input bg-background',
                          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                          'transition-all duration-200',
                          'placeholder:text-muted-foreground/60'
                        )}
                        autoComplete="new-password"
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

                    {/* Password strength */}
                    {password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 space-y-2"
                      >
                        {/* Strength bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all duration-300',
                                passwordStrength.score <= 1 && 'bg-destructive w-1/5',
                                passwordStrength.score === 2 && 'bg-warning w-2/5',
                                passwordStrength.score === 3 && 'bg-amber-500 w-3/5',
                                passwordStrength.score === 4 && 'bg-success w-4/5',
                                passwordStrength.score === 5 && 'bg-success w-full'
                              )}
                            />
                          </div>
                          <span className={cn('text-xs font-medium', strengthInfo.color)}>
                            {strengthInfo.label}
                          </span>
                        </div>

                        {/* Requirements */}
                        <div className="grid grid-cols-2 gap-1">
                          {passwordStrength.checks.map((check, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1.5 text-xs"
                            >
                              {check.passed ? (
                                <Check className="h-3 w-3 text-success" />
                              ) : (
                                <X className="h-3 w-3 text-muted-foreground" />
                              )}
                              <span className={check.passed ? 'text-muted-foreground' : 'text-muted-foreground/60'}>
                                {check.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className={cn(
                          'w-full pl-10 pr-4 py-3 rounded-xl',
                          'border border-input bg-background',
                          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                          'transition-all duration-200',
                          'placeholder:text-muted-foreground/60',
                          confirmPassword && password !== confirmPassword && 'border-destructive focus:border-destructive'
                        )}
                        autoComplete="new-password"
                      />
                      {confirmPassword && password === confirmPassword && (
                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-success" />
                      )}
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-2">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-input text-primary focus:ring-primary/20"
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground">
                      I agree to the{' '}
                      <Link to="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
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
                        Create Account
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

                {/* Social sign up buttons */}
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
