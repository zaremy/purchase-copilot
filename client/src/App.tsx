import { useState, useEffect, useRef } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import { Capacitor } from "@capacitor/core";
import { SocialLogin } from "@capgo/capacitor-social-login";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import CandidateDetail from "@/pages/CandidateDetail";
import ChecklistSection from "@/pages/Checklist";
import AddCandidate from "@/pages/AddCandidate";
import Settings from "@/pages/Settings";
import ChecklistPresets from "@/pages/ChecklistPresets";
import EditPreset from "@/pages/EditPreset";
import Compare from "@/pages/Compare";
import Library from "@/pages/Library";
import Profile from "@/pages/Profile";
import Notifications from "@/pages/Notifications";
import Privacy from "@/pages/Privacy";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Help from "@/pages/Help";
import Login from "@/pages/Login";
import { Onboarding } from "@/components/Onboarding";
import { useStore } from "@/lib/store";
import { features } from "@/lib/config";
import { onAuthStateChange, getSession, Session } from "@/lib/supabase";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/add" component={AddCandidate} />
      <Route path="/compare" component={Compare} />
      <Route path="/library" component={Library} />
      <Route path="/candidate/:id" component={CandidateDetail} />
      <Route path="/candidate/:id/checklist/:section" component={ChecklistSection} />
      <Route path="/settings" component={Settings} />
      <Route path="/settings/profile" component={Profile} />
      <Route path="/settings/notifications" component={Notifications} />
      <Route path="/settings/privacy" component={Privacy} />
      <Route path="/settings/help" component={Help} />
      <Route path="/settings/presets" component={ChecklistPresets} />
      <Route path="/settings/presets/:id" component={EditPreset} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { onboardingComplete, setUserProfile } = useStore();
  const [location, setLocation] = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(features.auth);
  const didInteractiveSignInRef = useRef(false);

  // Check auth state on mount and subscribe to changes
  useEffect(() => {
    if (!features.auth) return;

    // Check existing session
    getSession()
      .then((s) => setSession(s))
      .catch(console.error)
      .finally(() => setAuthLoading(false));

    // Subscribe to auth changes
    const { data: { subscription } } = onAuthStateChange((event, s) => {
      setSession(s);
      setAuthLoading(false);
      // Mark as interactive sign-in when SIGNED_IN event fires
      if (event === 'SIGNED_IN') {
        didInteractiveSignInRef.current = true;
      }
      // Clear flag on sign out to avoid stale redirect
      if (event === 'SIGNED_OUT') {
        didInteractiveSignInRef.current = false;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Initialize native social login plugin (for Apple Sign-In)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    SocialLogin.initialize({ apple: {} }).catch(console.error);
  }, []);

  // Redirect to Home after interactive sign-in
  useEffect(() => {
    if (didInteractiveSignInRef.current && session && !authLoading) {
      didInteractiveSignInRef.current = false;
      // Only redirect if not already on home to prevent redundant route writes
      if (location !== '/') {
        setLocation('/');
      }
    }
  }, [session, authLoading, location, setLocation]);

  // Hydrate userProfile from session metadata
  useEffect(() => {
    if (!session?.user) return;

    const meta = session.user.user_metadata;
    const fullName = meta?.full_name || meta?.name || '';
    const firstName = fullName.split(' ')[0] || '';

    setUserProfile({
      firstName,
      fullName,
      email: session.user.email || '',
      phone: meta?.phone || '',
      zipCode: meta?.zip_code || '',
    });
  }, [session, setUserProfile]);

  const isPublicRoute = location === '/privacy';

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F0EDE8] flex items-center justify-center">
        <Spinner className="w-8 h-8 text-neutral-600" />
      </div>
    );
  }

  // Auth enabled but no session - show login
  if (features.auth && !session && !isPublicRoute) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Login />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Show onboarding ONLY if auth is disabled (legacy mode)
  // When features.auth is true, Login component handles profile collection
  if (!features.auth && !onboardingComplete && !isPublicRoute) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Onboarding />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
