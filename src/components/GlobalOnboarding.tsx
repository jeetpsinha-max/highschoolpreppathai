import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { OnboardingWizard } from "@/components/OnboardingWizard";

const SKIP_PATHS = ["/auth", "/~oauth"];
const SESSION_DISMISS_KEY = "onboarding-dismissed-session";

/**
 * Globally triggers the onboarding wizard once per session for any logged-in
 * user who hasn't completed it. Skipped on auth-related routes.
 */
export function GlobalOnboarding() {
  const { user, loading: authLoading } = useAuth();
  const { preferences, isLoading: prefsLoading } = useUserPreferences();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (authLoading || prefsLoading) return;
    if (!user) {
      setOpen(false);
      return;
    }
    if (SKIP_PATHS.some(p => location.pathname.startsWith(p))) return;
    if (preferences?.onboarding_completed) return;
    if (sessionStorage.getItem(SESSION_DISMISS_KEY)) return;

    // Small delay so the destination page can mount first
    const t = setTimeout(() => setOpen(true), 600);
    return () => clearTimeout(t);
  }, [user, authLoading, preferences, prefsLoading, location.pathname]);

  if (!open) return null;

  return (
    <OnboardingWizard
      onComplete={() => {
        sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
        setOpen(false);
      }}
    />
  );
}
