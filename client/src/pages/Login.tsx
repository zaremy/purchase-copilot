import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { signUpWithEmail, signInWithEmail, signInWithApple } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';

type AuthMode = 'signin' | 'signup';

export default function Login() {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Missing fields',
        description: 'Please enter both email and password.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(email, password);
        toast({
          title: 'Check your email',
          description: 'We sent you a confirmation link.',
        });
      } else {
        await signInWithEmail(email, password);
        // Auth state listener in App.tsx will handle navigation
      }
    } catch (error: any) {
      toast({
        title: 'Authentication failed',
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
        // On native, we need to open the URL in the system browser
        // The deep link callback will be handled by the app
        window.location.href = url;
      }
      // On web, Supabase handles the redirect automatically
    } catch (error: any) {
      toast({
        title: 'Apple Sign In failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EDE8] flex flex-col">
      {/* Header */}
      <div className="bg-neutral-900 text-white py-6 px-4 text-center">
        <h1 className="font-bold text-2xl font-tech uppercase tracking-wide">
          Pre-Purchase Pal
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Your vehicle inspection companion
        </p>
      </div>

      {/* Auth Form */}
      <div className="flex-1 p-6 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-neutral-900">
              {mode === 'signin' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              {mode === 'signin'
                ? 'Sign in to access your vehicles'
                : 'Sign up to start inspecting vehicles'}
            </p>
          </div>

          {/* Apple Sign In Button */}
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
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
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

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium bg-neutral-900 hover:bg-neutral-800"
              disabled={loading}
            >
              {loading ? (
                <Spinner className="w-5 h-5" />
              ) : mode === 'signin' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Toggle mode */}
          <div className="text-center text-sm">
            <span className="text-neutral-500">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              type="button"
              className="text-neutral-900 font-medium hover:underline"
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              disabled={loading}
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>

        {/* Privacy note */}
        <p className="text-xs text-neutral-500 text-center mt-4 px-4">
          By signing in, you agree to our{' '}
          <a href="/privacy" className="underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
