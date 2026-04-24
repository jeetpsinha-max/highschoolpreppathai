import { Loader2 } from "lucide-react";

/**
 * Lightweight full-page loader used as Suspense fallback for code-split routes.
 * Stays subtle so route transitions don't feel like full-app reloads.
 */
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-secondary" />
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    </div>
  );
}
