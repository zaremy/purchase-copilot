import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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
import { Onboarding } from "@/components/Onboarding";
import { useStore } from "@/lib/store";

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
  const { onboardingComplete } = useStore();
  const [location] = useLocation();

  const isPublicRoute = location === '/privacy';

  if (!onboardingComplete && !isPublicRoute) {
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
