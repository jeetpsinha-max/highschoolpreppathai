import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { trackPageView } from "@/lib/analytics";

/** Records a page view in our own analytics table on every route change. */
export function PageViewTracker() {
  const { pathname } = useLocation();
  const { user, loading } = useAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    // Wait for auth to settle so signed-in views are attributed correctly.
    if (loading) return;
    void trackPageView(pathname, userId);
    // Only re-run when the page changes, not when auth refreshes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, loading]);

  return null;
}
