import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithApple,
  onAuthStateChange,
  SignUpMetadata,
} from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import { ArrowLeft, Mail, RefreshCw } from 'lucide-react';

type AuthMode = 'welcome' | 'signin' | 'signup' | 'check-email';

export default function Login() {
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Listen for auth state changes (session established after email confirm)
  useEffect(() => {
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Session established - App.tsx will handle navigation to Home
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!firstName.trim()) {
      toast({ title: 'Name required', description: 'Please enter your name.', variant: 'destructive' });
      return;
    }
    if (!email || !password) {
      toast({ title: 'Missing fields', description: 'Please enter email and password.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', description: 'Please check your passwords.', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Password too short', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const metadata: SignUpMetadata = {
        first_name: firstName.trim(),
        phone: phone.trim() || undefined,
        zip_code: zipCode.trim() || undefined,
      };
      await signUpWithEmail(email, password, metadata);
      setMode('check-email');
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Missing fields', description: 'Please enter email and password.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email, password);
      // Auth state listener in App.tsx will handle navigation
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      const { url } = await signInWithApple();
      if (url && Capacitor.isNativePlatform()) {
        window.location.href = url;
      }
    } catch (error: any) {
      toast({
        title: 'Apple Sign In failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    // Re-check session by triggering a page reload
    // The auth state listener will pick up if session exists
    window.location.reload();
  };

  const goBack = () => {
    if (mode === 'check-email') {
      setMode('signup');
    } else {
      setMode('welcome');
    }
  };

  // Welcome Screen
  if (mode === 'welcome') {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <h1 className="text-2xl font-bold text-neutral-400 text-center mb-2 tracking-tight">
            Welcome to
          </h1>
          <h2 className="text-2xl text-white text-center mb-4 tracking-tight">
            <span className="font-bold">Pre-Purchase</span>
            <span className="font-normal">Pal</span>.
          </h2>
          <p className="text-neutral-500 text-sm text-center max-w-xs mb-12">
            Your personal vehicle inspection companion. Never miss a red flag.
          </p>

          <div className="w-full max-w-xs space-y-3">
            <Button
              onClick={() => setMode('signup')}
              className="w-full h-12 text-base font-medium bg-white text-neutral-900 hover:bg-neutral-100"
            >
              Sign Up
            </Button>
            <Button
              onClick={() => setMode('signin')}
              variant="outline"
              className="w-full h-12 text-base font-medium border-neutral-700 text-white hover:bg-neutral-900"
            >
              Sign In
            </Button>
          </div>
        </div>

        <p className="text-xs text-neutral-600 text-center pb-8 px-4">
          By continuing, you agree to our{' '}
          <a href="/privacy" className="underline text-neutral-500">
            Privacy Policy
          </a>
        </p>
      </div>
    );
  }

  // Check Email Screen
  if (mode === 'check-email') {
    return (
      <div className="min-h-screen bg-[#F0EDE8] flex flex-col">
        <div className="bg-neutral-900 text-white py-4 px-4 flex items-center">
          <button onClick={goBack} className="p-2 -ml-2 hover:bg-neutral-800 rounded">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="flex-1 text-center font-bold text-lg pr-7">Check Your Email</h1>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 text-center mb-2">
            Confirm your email
          </h2>
          <p className="text-neutral-500 text-center max-w-xs mb-8">
            We sent a confirmation link to <span className="font-medium text-neutral-700">{email}</span>.
            Click the link to activate your account.
          </p>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="h-12 px-6 text-base font-medium border-neutral-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            I've confirmed, refresh
          </Button>
        </div>
      </div>
    );
  }

  // Sign In / Sign Up Screen (shared layout)
  const isSignUp = mode === 'signup';

  return (
    <div className="min-h-screen bg-[#F0EDE8] flex flex-col">
      {/* Header */}
      <div className="bg-neutral-900 text-white py-4 px-4 flex items-center">
        <button onClick={goBack} className="p-2 -ml-2 hover:bg-neutral-800 rounded">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="flex-1 text-center font-bold text-lg pr-7">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h1>
      </div>

      {/* Form */}
      <div className="flex-1 p-6 flex flex-col justify-start max-w-sm mx-auto w-full">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 space-y-5">
          {/* Apple Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base font-medium border-neutral-300"
            onClick={handleAppleSignIn}
            disabled={loading}
          >
            {loading ? (
              <Spinner className="w-5 h-5" />
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Continue with Apple
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-neutral-500">or</span>
            </div>
          </div>

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
            {/* Name field (signup only) */}
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="firstName">Name *</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                  autoComplete="given-name"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
            </div>

            {/* Confirm password (signup only) */}
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
            )}

            {/* Optional fields (signup only) */}
            {isSignUp && (
              <div className="pt-2 border-t border-neutral-100">
                <p className="text-xs text-neutral-500 mb-3">Optional</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={loading}
                      autoComplete="tel"
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-xs">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      type="text"
                      placeholder="90210"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      maxLength={5}
                      disabled={loading}
                      autoComplete="postal-code"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-neutral-900 hover:bg-neutral-800"
              disabled={loading}
            >
              {loading ? (
                <Spinner className="w-5 h-5" />
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Toggle mode */}
          <div className="text-center text-sm">
            <span className="text-neutral-500">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button
              type="button"
              className="text-neutral-900 font-medium hover:underline"
              onClick={() => setMode(isSignUp ? 'signin' : 'signup')}
              disabled={loading}
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
