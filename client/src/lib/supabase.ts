import { createClient, Session, User } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';

// Environment variables - must be set in .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Auth will not work.');
}

// Custom storage adapter for Capacitor
// Uses localStorage but with explicit key management
const capacitorStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

// Create Supabase client with explicit storage configuration
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    storage: capacitorStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: !Capacitor.isNativePlatform(), // Only on web
    flowType: 'pkce', // More secure for mobile
  },
});

// Auth helper functions

// Profile metadata stored in auth.users.raw_user_meta_data
// Synced to profiles table after first authenticated session (PR3)
export interface SignUpMetadata {
  first_name: string;
  phone?: string;
  zip_code?: string;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: SignUpMetadata
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Redirect back to the same origin (preview or production)
      emailRedirectTo: window.location.origin,
      // Store profile data in user metadata (no session needed)
      data: metadata,
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signInWithApple() {
  const redirectTo = Capacitor.isNativePlatform()
    ? 'prepurchasepal://auth-callback'
    : `${window.location.origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo,
      skipBrowserRedirect: Capacitor.isNativePlatform(),
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

// Listen to auth state changes
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}

// Handle OAuth callback (for Capacitor deep link)
export async function handleOAuthCallback(url: string) {
  // Extract tokens from URL if present
  if (url.includes('access_token') || url.includes('code')) {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }
  return null;
}

// Re-export types for convenience
export type { Session, User };
