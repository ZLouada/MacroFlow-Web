/**
 * Two-Factor Authentication Settings Component
 * 
 * Allows users to enable/disable 2FA and manage backup codes
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  Download,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type TwoFactorStep = 'idle' | 'setup' | 'verify' | 'backup' | 'disable';

export function TwoFactorSettings() {
  const { user, enableTwoFactor, verifyAndActivateTwoFactor, disableTwoFactor } = useAuth();
  
  const [step, setStep] = useState<TwoFactorStep>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Setup state
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [disableCode, setDisableCode] = useState('');
  
  // Clipboard state
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  const is2FAEnabled = user?.twoFactorEnabled ?? false;

  const handleStartSetup = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await enableTwoFactor();
      setQrCode(result.qrCode);
      setSecret(result.secret);
      setStep('setup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start 2FA setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const codes = await verifyAndActivateTwoFactor(verificationCode);
      setBackupCodes(codes);
      setStep('backup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    if (disableCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const success = await disableTwoFactor(disableCode);
      if (success) {
        setStep('idle');
        setDisableCode('');
      } else {
        setError('Invalid verification code');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'secret' | 'backup') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'secret') {
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
      } else {
        setCopiedBackup(true);
        setTimeout(() => setCopiedBackup(false), 2000);
      }
    } catch {
      console.error('Failed to copy to clipboard');
    }
  };

  const downloadBackupCodes = () => {
    const content = `MacroFlow Backup Codes\n${'='.repeat(30)}\n\nKeep these codes in a safe place. Each code can only be used once.\n\n${backupCodes.join('\n')}\n\nGenerated: ${new Date().toISOString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'macroflow-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetState = () => {
    setStep('idle');
    setQrCode('');
    setSecret('');
    setVerificationCode('');
    setBackupCodes([]);
    setDisableCode('');
    setError('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account by requiring a verification code in addition to your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {/* Idle State */}
          {step === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className={cn(
                'flex items-center gap-4 p-4 rounded-lg',
                is2FAEnabled ? 'bg-green-500/10' : 'bg-muted'
              )}>
                {is2FAEnabled ? (
                  <ShieldCheck className="h-8 w-8 text-green-500" />
                ) : (
                  <ShieldOff className="h-8 w-8 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <p className="font-medium">
                    {is2FAEnabled ? '2FA is enabled' : '2FA is not enabled'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {is2FAEnabled
                      ? 'Your account is protected with two-factor authentication.'
                      : 'Enable two-factor authentication for enhanced security.'
                    }
                  </p>
                </div>
              </div>

              {is2FAEnabled ? (
                <Button
                  variant="outline"
                  onClick={() => setStep('disable')}
                  className="text-destructive hover:text-destructive"
                >
                  Disable 2FA
                </Button>
              ) : (
                <Button onClick={handleStartSetup} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Enable 2FA'
                  )}
                </Button>
              )}

              {error && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              )}
            </motion.div>
          )}

          {/* Setup State - Show QR Code */}
          {step === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h3 className="font-medium mb-2">Scan QR Code</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Use your authenticator app (Google Authenticator, Authy, etc.) to scan this QR code.
                </p>
                
                {qrCode && (
                  <div className="inline-block p-4 bg-white rounded-lg shadow-sm">
                    <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                  </div>
                )}
              </div>

              {/* Manual entry option */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Or enter this code manually:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm break-all">
                    {secret}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(secret, 'secret')}
                  >
                    {copiedSecret ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Verification input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Enter verification code from your app:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className={cn(
                      'flex-1 px-4 py-3 rounded-lg text-center text-xl font-mono tracking-widest',
                      'border border-input bg-background',
                      'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                    )}
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={resetState}>
                  Cancel
                </Button>
                <Button onClick={handleVerify} disabled={isLoading || verificationCode.length !== 6}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Enable'
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Backup Codes */}
          {step === 'backup' && (
            <motion.div
              key="backup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="font-medium text-lg">2FA Enabled Successfully!</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <code key={index} className="text-center py-2 bg-background rounded font-mono">
                      {code}
                    </code>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(backupCodes.join('\n'), 'backup')}
                  className="flex-1"
                >
                  {copiedBackup ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Codes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={downloadBackupCodes}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>

              <Button onClick={resetState} className="w-full">
                Done
              </Button>
            </motion.div>
          )}

          {/* Disable 2FA */}
          {step === 'disable' && (
            <motion.div
              key="disable"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="p-4 bg-destructive/10 rounded-lg">
                <h3 className="font-medium text-destructive mb-2">Disable Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  This will remove the extra layer of security from your account. Enter your current authenticator code to confirm.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Enter verification code:
                </label>
                <input
                  type="text"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg text-center text-xl font-mono tracking-widest',
                    'border border-input bg-background',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                  )}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={resetState}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDisable}
                  disabled={isLoading || disableCode.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Disabling...
                    </>
                  ) : (
                    'Disable 2FA'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
